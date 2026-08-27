"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Progress, Checkbox } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";
import { defaultCareerRoadmap } from "../_lib/helpers";

export default function CareerRoadmapPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const journeyStage = useAppStore((s) => s.journeyStage);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const milestones = useMemo(() => {
    const stored = user?.careerRoadmap;
    if (stored?.length) return stored;
    return defaultCareerRoadmap(journeyStage);
  }, [user?.careerRoadmap, journeyStage]);

  const completed = milestones.filter((m) => m.completed).length;
  const progress = milestones.length ? Math.round((completed / milestones.length) * 100) : 0;

  const toggleMilestone = (milestoneId) => {
    if (!user) return;
    const next = milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    updateProfile(user.id, { careerRoadmap: next });
    const item = next.find((m) => m.id === milestoneId);
    toast.success(item?.completed ? "Milestone completed!" : "Milestone marked incomplete");
  };

  const resetRoadmap = () => {
    if (!user) return;
    const fresh = defaultCareerRoadmap(journeyStage);
    updateProfile(user.id, { careerRoadmap: fresh });
    toast.message("Roadmap reset to defaults for your journey stage");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Career roadmap"
        description="Track milestones aligned with your academic journey and career goals"
        actions={<Button variant="secondary" onClick={resetRoadmap}>Reset roadmap</Button>}
      />

      <div className="card-surface p-4">
        <Progress value={progress} label={`${completed} of ${milestones.length} milestones complete`} />
      </div>

      <ul className="space-y-3">
        {milestones.map((m, idx) => (
          <li key={m.id} className="card-surface flex items-start gap-4 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nexus-100 text-sm font-semibold text-nexus-800 dark:bg-nexus-950">
              {idx + 1}
            </span>
            <div className="flex-1">
              <Checkbox
                label={m.title}
                checked={Boolean(m.completed)}
                onChange={() => toggleMilestone(m.id)}
              />
            </div>
          </li>
        ))}
      </ul>

      {user?.careerGoals?.length ? (
        <div className="card-surface p-4">
          <h3 className="font-semibold">Career goals</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-secondary">
            {user.careerGoals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
