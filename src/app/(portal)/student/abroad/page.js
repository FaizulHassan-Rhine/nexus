"use client";

import { useMemo } from "react";
import { PageHeader, SectionHeader } from "@/components/ui";
import { Button, Checkbox, Input, Textarea, Select } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";
import { defaultAbroadChecklist } from "../_lib/helpers";

export default function AbroadPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const updateProfile = useAppStore((s) => s.updateProfile);
  const scholarships = useAppStore((s) => s.scholarships);

  const planner = user?.abroadPlanner || {
    targetCountry: "",
    targetProgram: "",
    intake: "",
    checklist: defaultAbroadChecklist(),
    recommendationRequests: [],
  };

  const checklist = planner.checklist?.length ? planner.checklist : defaultAbroadChecklist();
  const doneCount = checklist.filter((c) => c.done).length;

  const savePlanner = (updates) => {
    if (!user) return;
    updateProfile(user.id, { abroadPlanner: { ...planner, ...updates } });
  };

  const toggleChecklist = (id) => {
    const next = checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c));
    savePlanner({ checklist: next });
    toast.success("Checklist updated");
  };

  const requestRecommendation = () => {
    if (!user) return;
    const facultyId = user.facultyRecommendations?.[0]?.facultyId || "user-demo-faculty";
    const request = {
      id: `rec-${Date.now()}`,
      facultyId,
      status: "Pending",
      requestedAt: new Date().toISOString(),
      note: `Recommendation for ${planner.targetProgram || "study abroad application"}`,
    };
    savePlanner({
      recommendationRequests: [...(planner.recommendationRequests || []), request],
    });
    toast.success("Recommendation letter request sent to faculty");
  };

  const abroadScholarships = useMemo(
    () => scholarships.filter((s) => s.country && s.country !== "Bangladesh").slice(0, 4),
    [scholarships]
  );

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Study abroad planner"
        description="Organize your international study application checklist and documents"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface space-y-4 p-4">
          <SectionHeader title="Application planner" />
          <Select
            label="Target country"
            value={planner.targetCountry}
            onChange={(e) => savePlanner({ targetCountry: e.target.value })}
            placeholder="Select country"
            options={["Germany", "Canada", "Australia", "United Kingdom", "United States", "Japan", "South Korea"]}
          />
          <Input
            label="Target program"
            value={planner.targetProgram}
            onChange={(e) => savePlanner({ targetProgram: e.target.value })}
            placeholder="e.g. MSc Computer Science"
          />
          <Input
            label="Target intake"
            value={planner.intake}
            onChange={(e) => savePlanner({ intake: e.target.value })}
            placeholder="e.g. Fall 2027"
          />
          <Textarea
            label="Notes"
            value={planner.notes || ""}
            onChange={(e) => savePlanner({ notes: e.target.value })}
            rows={3}
          />
        </section>

        <section className="card-surface p-4">
          <SectionHeader
            title="Checklist"
            description={`${doneCount} of ${checklist.length} complete`}
          />
          <ul className="space-y-3">
            {checklist.map((item) => (
              <li key={item.id}>
                <Checkbox
                  label={item.label}
                  checked={item.done}
                  onChange={() => toggleChecklist(item.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card-surface p-4">
        <SectionHeader
          title="Recommendation letters"
          description="Request faculty endorsements through Nexus"
          actions={<Button size="sm" onClick={requestRecommendation}>Request letter</Button>}
        />
        <ul className="mt-4 space-y-2 text-sm">
          {(planner.recommendationRequests || []).map((r) => (
            <li key={r.id} className="flex justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
              <span>{r.note}</span>
              <span className="text-secondary">{r.status}</span>
            </li>
          ))}
          {!planner.recommendationRequests?.length && (
            <p className="text-secondary">No requests yet.</p>
          )}
        </ul>
      </section>

      {abroadScholarships.length ? (
        <section>
          <SectionHeader title="International scholarships on Nexus" />
          <ul className="grid gap-3 md:grid-cols-2">
            {abroadScholarships.map((s) => (
              <li key={s.id} className="card-surface p-3 text-sm">
                <p className="font-medium">{s.title}</p>
                <p className="text-secondary">{s.country} · {s.providerName}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
