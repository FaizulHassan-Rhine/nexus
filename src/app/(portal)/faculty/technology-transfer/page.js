"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Badge, Modal } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { messagingService } from "@/lib/mockServices";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { getFacultyTechnologies } from "../_lib/helpers";

export default function TechnologyTransferPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const technologies = useAppStore((s) => s.technologies);
  const conversations = useAppStore((s) => s.conversations);
  const updateTechnology = useAppStore((s) => s.updateTechnology);
  const createConversation = useAppStore((s) => s.createConversation);

  const [interestTech, setInterestTech] = useState(null);
  const [message, setMessage] = useState("");

  const myTech = useMemo(
    () => (user ? getFacultyTechnologies(technologies, user.id) : []),
    [technologies, user]
  );
  const universityTech = useMemo(
    () => technologies.filter((t) => t.universityId === user?.universityId),
    [technologies, user]
  );
  const industryInterest = useMemo(
    () =>
      conversations.filter(
        (c) =>
          c.subject?.toLowerCase().includes("licens") ||
          c.subject?.toLowerCase().includes("patent") ||
          c.subject?.toLowerCase().includes("nlp")
      ),
    [conversations]
  );

  const expressInterest = (tech) => {
    setInterestTech(tech);
    setMessage(`We are interested in exploring ${tech.collaborationTypes?.[0] || "licensing"} for ${tech.title}.`);
  };

  const sendInterest = async () => {
    if (!interestTech || !message.trim() || !user) return;
    const conv = createConversation(["user-demo-company", user.id], `Interest: ${interestTech.title}`);
    await messagingService.send(conv.id, message);
    updateTechnology(interestTech.id, {
      industryInterest: [...(interestTech.industryInterest || []), { at: new Date().toISOString(), note: message.slice(0, 80) }],
    });
    toast.success("Collaboration request sent");
    setInterestTech(null);
    router.push("/faculty/messages");
  };

  const updateStatus = (techId, status) => {
    updateTechnology(techId, { status });
    toast.success(`Status updated to ${status}`);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technology transfer"
        description="Faculty and university technologies, industry interest, licensing paths, and commercialization"
        actions={
          <Button onClick={() => router.push("/faculty/technologies/new")}>Register new technology</Button>
        }
      />

      <Tabs defaultValue="faculty">
        <TabList>
          <Tab value="faculty">My technologies</Tab>
          <Tab value="university">University portfolio</Tab>
          <Tab value="interest">Industry interest</Tab>
          <Tab value="licensing">Licensing paths</Tab>
        </TabList>

        <TabPanel value="faculty">
          <div className="grid gap-4 md:grid-cols-2">
            {myTech.map((t) => (
              <article key={t.id} className="card-surface p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="teal">{t.type}</Badge>
                  <Badge tone="violet">{t.readinessLevel?.split("—")[0]?.trim() || t.readinessLevel}</Badge>
                </div>
                <h3 className="mt-2 font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-secondary line-clamp-2">{t.description}</p>
                <p className="mt-2 text-xs text-secondary">IP: {t.ipStatus} · {t.sector}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadgeInline status={t.status} />
                  <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "Under negotiation")}>
                    Mark negotiating
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </TabPanel>

        <TabPanel value="university">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {universityTech.map((t) => {
              const isMine = t.facultyId === user?.id || t.ownerUserId === user?.id;
              return (
                <article key={t.id} className="card-surface p-4">
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="text-sm text-secondary">{t.sector}</p>
                  <Badge tone={isMine ? "green" : "slate"} className="mt-2">{isMine ? "Yours" : "University"}</Badge>
                  {!isMine ? (
                    <Button size="sm" variant="secondary" className="mt-3" onClick={() => expressInterest(t)}>
                      Request collaboration
                    </Button>
                  ) : null}
                </article>
              );
            })}
          </div>
        </TabPanel>

        <TabPanel value="interest">
          <ul className="space-y-3">
            {industryInterest.map((c) => (
              <li key={c.id} className="card-surface p-4">
                <p className="font-medium">{c.subject}</p>
                <p className="text-sm text-secondary">{c.messages?.[c.messages.length - 1]?.body}</p>
                <Link href="/faculty/messages" className="mt-2 inline-block text-sm text-nexus-700">Open conversation</Link>
              </li>
            ))}
            {myTech.flatMap((t) => (t.industryInterest || []).map((i, idx) => (
              <li key={`${t.id}-${idx}`} className="card-surface p-4">
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-secondary">{i.note}</p>
                <p className="text-xs text-secondary">{formatDate(i.at)}</p>
              </li>
            )))}
          </ul>
        </TabPanel>

        <TabPanel value="licensing">
          <div className="space-y-4">
            {myTech.map((t) => (
              <div key={t.id} className="card-surface p-4">
                <h3 className="font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm">{t.licensingTerms}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(t.collaborationTypes || []).map((ct) => (
                    <Badge key={ct} tone="teal">{ct}</Badge>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => expressInterest(t)}>Express industry interest</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "Licensed")}>Mark licensed</Button>
                </div>
              </div>
            ))}
          </div>
        </TabPanel>
      </Tabs>

      <Modal open={Boolean(interestTech)} onClose={() => setInterestTech(null)} title="Express interest">
        <div className="space-y-4">
          <p className="text-sm">{interestTech?.title}</p>
          <textarea
            className="w-full rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setInterestTech(null)}>Cancel</Button>
            <Button onClick={sendInterest}>Send to industry partner</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatusBadgeInline({ status }) {
  return <Badge tone="slate">{status}</Badge>;
}
