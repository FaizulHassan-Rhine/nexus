"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, FilterBar } from "@/components/ui";
import { Button, Input, Select, Badge, Avatar, Modal } from "@/components/ui";
import { MatchScoreRing, MatchBreakdown } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { messagingService } from "@/lib/mockServices";
import { toast } from "sonner";
import {
  getConsentedCandidates,
  getOrgMatches,
  getOrgOpportunities,
  buildMatchScoreResult,
} from "../_lib/helpers";

export default function CandidatesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const users = useAppStore((s) => s.users);
  const matches = useAppStore((s) => s.matches);
  const opportunities = useAppStore((s) => s.opportunities);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const createConversation = useAppStore((s) => s.createConversation);

  const [q, setQ] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(null);

  const orgOpps = useMemo(() => getOrgOpportunities(opportunities, user?.organizationId), [opportunities, user]);
  const orgMatches = useMemo(
    () => getOrgMatches(matches, opportunities, user?.organizationId),
    [matches, opportunities, user]
  );
  const shortlisted = user?.orgShortlist || [];

  const candidates = useMemo(() => {
    const consented = getConsentedCandidates(users);
    const skills = [...new Set(consented.flatMap((u) => u.skills || []))].sort();
    return {
      list: consented
        .filter((c) => {
          const hay = `${c.name} ${c.programme} ${(c.skills || []).join(" ")}`.toLowerCase();
          return !q || hay.includes(q.toLowerCase());
        })
        .filter((c) => skillFilter === "all" || (c.skills || []).includes(skillFilter))
        .map((c) => {
          const bestMatch = orgMatches
            .filter((m) => m.candidateId === c.id)
            .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))[0];
          return { ...c, bestMatch };
        })
        .sort((a, b) => (b.bestMatch?.overallScore || 0) - (a.bestMatch?.overallScore || 0)),
      skills,
    };
  }, [users, q, skillFilter, orgMatches]);

  const toggleCompare = (id) => {
    setCompareIds((list) => {
      if (list.includes(id)) return list.filter((x) => x !== id);
      if (list.length >= 4) {
        toast.error("Compare up to 4 candidates");
        return list;
      }
      return [...list, id];
    });
  };

  const toggleShortlist = (id) => {
    const next = shortlisted.includes(id) ? shortlisted.filter((x) => x !== id) : [...shortlisted, id];
    updateProfile(user.id, { orgShortlist: next });
    toast.success(shortlisted.includes(id) ? "Removed from shortlist" : "Shortlisted");
  };

  const sendInvite = (candidateId, oppId) => {
    toast.success("Invitation sent — candidate notified");
    setInviteOpen(null);
  };

  const messageCandidate = async (candidateId) => {
    const conv = createConversation([user.id, candidateId], "Recruitment inquiry");
    await messagingService.send(conv.id, `Hello — ${user?.name} from our organization would like to connect regarding opportunities.`);
    router.push("/organization/messages");
  };

  const compareCandidates = candidates.list.filter((c) => compareIds.includes(c.id));

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate pool"
        description="Consented student and faculty profiles with match scores"
        actions={
          <>
            {compareIds.length ? (
              <Button variant="secondary" onClick={() => setCompareOpen(true)}>Compare ({compareIds.length})</Button>
            ) : null}
            <Button onClick={() => router.push("/organization/pipeline")}>Open pipeline</Button>
          </>
        }
      />

      <FilterBar>
        <Input label="Search" placeholder="Name, programme, skills..." value={q} onChange={(e) => setQ(e.target.value)} className="min-w-[200px]" />
        <Select
          label="Skill"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          options={[{ value: "all", label: "All skills" }, ...candidates.skills.slice(0, 15).map((s) => ({ value: s, label: s }))]}
        />
      </FilterBar>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {candidates.list.map((c) => (
          <article key={c.id} className="card-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={c.name} src={c.avatar} />
                <div>
                  <Link href={`/organization/candidates/${c.id}`} className="font-semibold hover:text-nexus-700">
                    {c.name}
                  </Link>
                  <p className="text-xs text-secondary">{c.programme} · Year {c.currentYear || "—"}</p>
                </div>
              </div>
              {c.bestMatch ? <MatchScoreRing score={c.bestMatch.overallScore} size={48} /> : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {(c.skills || []).slice(0, 4).map((s) => (
                <Badge key={s} tone="slate">{s}</Badge>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-secondary">
              <span>{c.weeklyAvailability || 20}h/week</span>
              <span>·</span>
              <Badge tone={c.verificationStatus === "Verified" ? "green" : "amber"}>{c.verificationStatus || "Pending"}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant={shortlisted.includes(c.id) ? "primary" : "secondary"} onClick={() => toggleShortlist(c.id)}>
                {shortlisted.includes(c.id) ? "Shortlisted" : "Shortlist"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setInviteOpen(c.id)}>Invite</Button>
              <Button size="sm" variant="ghost" onClick={() => toggleCompare(c.id)}>
                {compareIds.includes(c.id) ? "In compare" : "Compare"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => messageCandidate(c.id)}>Message</Button>
            </div>
          </article>
        ))}
      </div>

      <Modal open={compareOpen} onClose={() => setCompareOpen(false)} title="Compare candidates">
        <div className="grid gap-4 sm:grid-cols-2">
          {compareCandidates.map((c) => (
            <div key={c.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-secondary">{c.programme}</p>
              {c.bestMatch ? (
                <div className="mt-2">
                  <MatchBreakdown scoreResult={buildMatchScoreResult(c.bestMatch)} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={!!inviteOpen} onClose={() => setInviteOpen(null)} title="Invite to opportunity">
        <Select
          label="Opportunity"
          options={orgOpps.map((o) => ({ value: o.id, label: o.title }))}
          onChange={(e) => sendInvite(inviteOpen, e.target.value)}
        />
        <p className="mt-2 text-xs text-secondary">Candidate receives notification with opportunity details.</p>
      </Modal>
    </div>
  );
}
