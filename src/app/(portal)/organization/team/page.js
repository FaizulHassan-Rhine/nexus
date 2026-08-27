"use client";

import { useState } from "react";
import { PageHeader, SectionHeader } from "@/components/ui";
import { Button, Badge, Switch } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";
import { ORG_TEAM_ROLES, canOrgRole } from "../_lib/helpers";

const DEMO_TEAM = [
  { id: "user-demo-company", name: "Nusrat Jahan", email: "company@nexus.demo", role: "owner", department: "HR" },
  { id: "tm-recruiter", name: "Arif Khan", email: "arif.khan@bengaltech.demo", role: "recruiter", department: "Talent" },
  { id: "tm-pm", name: "Sadia Islam", email: "sadia@bengaltech.demo", role: "programme-manager", department: "L&D" },
  { id: "tm-finance", name: "Imran Chowdhury", email: "imran@bengaltech.demo", role: "finance", department: "Finance" },
  { id: "tm-viewer", name: "Riya Das", email: "riya@bengaltech.demo", role: "viewer", department: "Compliance" },
];

const PERMISSION_AREAS = [
  { id: "candidates", label: "Candidates & pipeline" },
  { id: "interviews", label: "Interviews & offers" },
  { id: "courses", label: "Training programmes" },
  { id: "projects", label: "Industry projects" },
  { id: "partnerships", label: "Partnerships" },
  { id: "co-funding", label: "Co-funding & payments" },
];

export default function TeamPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [activeRole, setActiveRole] = useState(user?.orgTeamRole || "owner");
  const [inviteEmail, setInviteEmail] = useState("");

  const switchRole = (roleId) => {
    setActiveRole(roleId);
    updateProfile(user.id, { orgTeamRole: roleId });
    toast.success(`Simulating ${ORG_TEAM_ROLES.find((r) => r.id === roleId)?.label} permissions`);
  };

  const simulateUser = (member) => {
    toast.message(`Viewing as ${member.name} (${member.role}) — permission simulation only`);
  };

  const invite = () => {
    if (!inviteEmail.trim()) {
      toast.error("Enter email");
      return;
    }
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
  };

  if (!hydrated) return null;

  const currentRole = ORG_TEAM_ROLES.find((r) => r.id === activeRole);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="Role-based access for owners, recruiters, programme managers, finance, and viewers"
      />

      <section className="card-surface p-4">
        <SectionHeader title="Simulate your role" description="Preview permission boundaries in this prototype" />
        <div className="mt-4 flex flex-wrap gap-2">
          {ORG_TEAM_ROLES.map((role) => (
            <Button
              key={role.id}
              size="sm"
              variant={activeRole === role.id ? "primary" : "secondary"}
              onClick={() => switchRole(role.id)}
            >
              {role.label}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-sm text-secondary">
          Active simulation: <strong>{currentRole?.label}</strong> — permissions: {currentRole?.permissions.join(", ")}
        </p>
      </section>

      <section className="card-surface p-4">
        <SectionHeader title="Permission matrix" />
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-3 py-2 text-left">Area</th>
                {ORG_TEAM_ROLES.map((r) => (
                  <th key={r.id} className="px-3 py-2 text-center">{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_AREAS.map((area) => (
                <tr key={area.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2">{area.label}</td>
                  {ORG_TEAM_ROLES.map((r) => {
                    const allowed = r.permissions.includes("all") || r.permissions.includes(area.id) || (r.permissions.includes("read") && area.id !== "co-funding");
                    return (
                      <td key={r.id} className="px-3 py-2 text-center">
                        {allowed ? "✓" : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-surface p-4">
        <SectionHeader title="Team members" />
        <ul className="mt-4 space-y-3">
          {DEMO_TEAM.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-secondary">{m.email} · {m.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="teal">{ORG_TEAM_ROLES.find((r) => r.id === m.role)?.label}</Badge>
                {m.id === user?.id ? <Badge tone="violet">You</Badge> : null}
                <Button size="sm" variant="ghost" onClick={() => simulateUser(m)}>Simulate</Button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <input
            type="email"
            placeholder="colleague@company.demo"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <Button onClick={invite}>Invite member</Button>
        </div>
      </section>

      <section className="card-surface p-4">
        <SectionHeader title="Your current access" />
        <ul className="mt-3 space-y-2 text-sm">
          {PERMISSION_AREAS.map((area) => (
            <li key={area.id} className="flex items-center justify-between">
              <span>{area.label}</span>
              <Switch checked={canOrgRole({ orgTeamRole: activeRole }, area.id)} disabled onChange={() => {}} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
