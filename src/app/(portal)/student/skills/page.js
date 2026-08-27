"use client";

import { useMemo, useState } from "react";
import { PageHeader, SectionHeader } from "@/components/ui";
import { Button, Badge, Input, Modal, Progress } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";
import { collectSkillGaps, getStudentMatches } from "../_lib/helpers";

export default function SkillsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const matches = useAppStore((s) => s.matches);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const recalculateMatchesForUser = useAppStore((s) => s.recalculateMatchesForUser);

  const [newSkill, setNewSkill] = useState("");
  const [assessOpen, setAssessOpen] = useState(false);
  const [assessSkill, setAssessSkill] = useState("");
  const [assessScore, setAssessScore] = useState(70);

  const userMatches = useMemo(
    () => (user ? getStudentMatches(matches, user.id) : []),
    [matches, user]
  );
  const gaps = useMemo(() => collectSkillGaps(userMatches), [userMatches]);

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill || !user) return;
    if (user.skills?.includes(skill)) {
      toast.message("Skill already in inventory");
      return;
    }
    const skills = [...(user.skills || []), skill];
    const skillProficiency = { ...(user.skillProficiency || {}), [skill]: "Beginner" };
    updateProfile(user.id, { skills, skillProficiency });
    recalculateMatchesForUser(user.id);
    setNewSkill("");
    toast.success(`Added ${skill}`);
  };

  const removeSkill = (skill) => {
    if (!user) return;
    const skills = (user.skills || []).filter((s) => s !== skill);
    const skillProficiency = { ...(user.skillProficiency || {}) };
    delete skillProficiency[skill];
    updateProfile(user.id, { skills, skillProficiency });
    recalculateMatchesForUser(user.id);
    toast.message(`Removed ${skill}`);
  };

  const completeAssessment = () => {
    if (!user || !assessSkill) return;
    const level = assessScore >= 85 ? "Advanced" : assessScore >= 60 ? "Intermediate" : "Beginner";
    const skills = user.skills?.includes(assessSkill)
      ? user.skills
      : [...(user.skills || []), assessSkill];
    updateProfile(user.id, {
      skills,
      skillProficiency: { ...(user.skillProficiency || {}), [assessSkill]: level },
      skillAssessments: [
        ...(user.skillAssessments || []),
        { skill: assessSkill, score: assessScore, level, completedAt: new Date().toISOString() },
      ],
    });
    recalculateMatchesForUser(user.id);
    setAssessOpen(false);
    toast.success(`${assessSkill} assessed as ${level}`);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Skills"
        description="Manage your skill inventory, close gaps, and run proficiency assessments"
        actions={
          <Button variant="secondary" onClick={() => { setAssessSkill(user?.skills?.[0] || ""); setAssessOpen(true); }}>
            Run assessment
          </Button>
        }
      />

      <section className="card-surface p-4">
        <SectionHeader title="Add skill" />
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="e.g. TypeScript, AWS, Figma"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={addSkill}>Add to inventory</Button>
        </div>
      </section>

      <section>
        <SectionHeader title="Skill inventory" description={`${user?.skills?.length || 0} skills`} />
        <div className="flex flex-wrap gap-2">
          {(user?.skills || []).map((skill) => (
            <div key={skill} className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-700">
              <span className="font-medium">{skill}</span>
              <Badge tone="teal">{user.skillProficiency?.[skill] || "Beginner"}</Badge>
              <button type="button" className="text-xs text-danger" onClick={() => removeSkill(skill)}>
                Remove
              </button>
            </div>
          ))}
          {!user?.skills?.length && <p className="text-sm text-secondary">No skills yet.</p>}
        </div>
      </section>

      <section>
        <SectionHeader title="Skill gaps" description="From your top match recommendations" />
        <ul className="space-y-2">
          {gaps.map(({ skill, count }) => (
            <li key={skill} className="card-surface flex items-center justify-between p-3 text-sm">
              <span>{skill}</span>
              <div className="flex items-center gap-2">
                <Badge tone="amber">{count} matches need this</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAssessSkill(skill);
                    setAssessOpen(true);
                  }}
                >
                  Assess
                </Button>
              </div>
            </li>
          ))}
          {!gaps.length && <p className="text-sm text-secondary">No significant gaps detected.</p>}
        </ul>
      </section>

      {(user?.skillAssessments || []).length ? (
        <section className="card-surface p-4">
          <h3 className="font-semibold">Assessment history</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {user.skillAssessments.map((a, i) => (
              <li key={i} className="flex justify-between">
                <span>{a.skill}</span>
                <span>{a.level} ({a.score}%)</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Modal open={assessOpen} onClose={() => setAssessOpen(false)} title="Skill assessment simulation" description="Simulated proficiency check — results update your profile">
        <div className="space-y-4">
          <Input label="Skill" value={assessSkill} onChange={(e) => setAssessSkill(e.target.value)} />
          <div>
            <label className="text-sm font-medium">Simulated score: {assessScore}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={assessScore}
              onChange={(e) => setAssessScore(Number(e.target.value))}
              className="mt-2 w-full accent-nexus-600"
            />
          </div>
          <Progress value={assessScore} label="Proficiency preview" />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAssessOpen(false)}>Cancel</Button>
            <Button onClick={completeAssessment}>Complete assessment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
