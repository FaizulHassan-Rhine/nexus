"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Input, Textarea, Select, StatusBadge, Modal } from "@/components/ui";
import { SlaBadge } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { supportService } from "@/lib/mockServices";
import { formatDate, formatRelative } from "@/lib/formatters";
import { toast } from "sonner";

export default function OrganizationSupportPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);

  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({
    subject: "",
    category: "Recruitment support",
    priority: "Medium",
    description: "",
  });

  const mine = useMemo(
    () => tickets.filter((t) => t.requesterId === user?.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [tickets, user]
  );

  const active = selected ? tickets.find((t) => t.id === selected) : mine[0];
  const thread = active?.conversation || [];

  const createTicket = async () => {
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error("Subject and description required");
      return;
    }
    const ticket = await supportService.createTicket(form);
    toast.success("Ticket created");
    setCreateOpen(false);
    setSelected(ticket.id);
    setForm({ subject: "", category: "Recruitment support", priority: "Medium", description: "" });
  };

  const sendReply = async () => {
    if (!reply.trim() || !active) return;
    await supportService.reply(active.id, reply);
    setReply("");
    toast.success("Reply sent");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Nexus helpdesk — 24-hour SLA target"
        actions={<Button onClick={() => setCreateOpen(true)}>Create ticket</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <aside className="card-surface max-h-[60vh] overflow-y-auto p-2">
          {mine.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm ${active?.id === t.id ? "bg-nexus-50 dark:bg-nexus-950" : "hover:bg-slate-50"}`}
            >
              <p className="font-medium">{t.subject}</p>
              <div className="mt-1 flex gap-2">
                <StatusBadge status={t.status} />
                <SlaBadge deadline={t.slaDeadline} />
              </div>
            </button>
          ))}
          {!mine.length && <p className="p-3 text-sm text-secondary">No tickets yet.</p>}
        </aside>

        <div className="card-surface min-h-[400px] lg:col-span-2">
          {active ? (
            <>
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <p className="font-semibold">{active.subject}</p>
                <p className="text-xs text-secondary">{active.category} · {formatDate(active.createdAt)}</p>
              </div>
              <div className="max-h-[320px] space-y-3 overflow-y-auto p-4">
                {thread.map((m, i) => {
                  const author = users.find((u) => u.id === m.by);
                  return (
                    <div key={i} className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
                      <p className="text-xs font-medium text-secondary">{author?.name || "Support"} · {formatRelative(m.at)}</p>
                      <p className="mt-1">{m.body}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700">
                <Input placeholder="Reply..." value={reply} onChange={(e) => setReply(e.target.value)} className="flex-1" />
                <Button onClick={sendReply}>Send</Button>
              </div>
            </>
          ) : (
            <p className="p-8 text-center text-secondary">Select or create a ticket</p>
          )}
        </div>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create support ticket">
        <div className="space-y-4">
          <Input label="Subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
          <Select label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} options={[
            { value: "Recruitment support", label: "Recruitment" },
            { value: "Co-funding", label: "Co-funding" },
            { value: "Technical issue", label: "Technical" },
            { value: "Verification", label: "Verification" },
          ]} />
          <Select label="Priority" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} options={[
            { value: "Low", label: "Low" },
            { value: "Medium", label: "Medium" },
            { value: "High", label: "High" },
          ]} />
          <Textarea label="Description" rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Button onClick={createTicket}>Submit ticket</Button>
        </div>
      </Modal>
    </div>
  );
}
