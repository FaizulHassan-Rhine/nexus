"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Button, Select, Textarea, Input, Badge, StatusBadge } from "@/components/ui";
import { SlaBadge } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { supportService } from "@/lib/mockServices";
import { formatDate, formatRelative } from "@/lib/formatters";
import { toast } from "sonner";
import { suggestArticles, normalizeConversation } from "../../_lib/helpers";
import { Breadcrumbs } from "@/components/layout/Shell";

export default function TicketWorkspacePage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id;

  const tickets = useAppStore((s) => s.tickets);
  const users = useAppStore((s) => s.users);
  const helpArticles = useAppStore((s) => s.helpArticles);
  const updateTicket = useAppStore((s) => s.updateTicket);
  const replyToTicket = useAppStore((s) => s.replyToTicket);
  const resolveTicket = useAppStore((s) => s.resolveTicket);
  const escalateTicket = useAppStore((s) => s.escalateTicket);

  const ticket = tickets.find((t) => t.id === ticketId);
  const [reply, setReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [resolution, setResolution] = useState("");
  const [rating, setRating] = useState(5);

  const thread = useMemo(() => (ticket ? normalizeConversation(ticket) : []), [ticket]);
  const articles = useMemo(() => suggestArticles(ticket, helpArticles), [ticket, helpArticles]);
  const agents = users.filter((u) => u.role === "helpdesk");

  if (!hydrated) return null;
  if (!ticket) {
    return (
      <div className="space-y-4">
        <PageHeader title="Ticket not found" />
        <Button onClick={() => router.push("/helpdesk/tickets")}>Back</Button>
      </div>
    );
  }

  const requester = users.find((u) => u.id === ticket.requesterId);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Tickets", href: "/helpdesk/tickets" }, { label: ticket.subject }]} />
      <PageHeader
        title={ticket.subject}
        description={`${ticket.category} · ${ticket.priority} · Opened ${formatDate(ticket.createdAt)}`}
        actions={<SlaBadge deadline={ticket.slaDeadline} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card-surface p-4">
            <p className="text-sm">{ticket.description}</p>
          </div>
          <div className="card-surface space-y-3 p-4">
            {thread.map((m, i) => {
              const author = users.find((u) => u.id === m.by);
              const isInternal = m.type === "internal";
              return (
                <div key={i} className={`rounded-lg p-3 text-sm ${isInternal ? "border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30" : "bg-slate-50 dark:bg-slate-800"}`}>
                  <p className="text-xs font-medium">{author?.name || m.by} {isInternal ? <Badge tone="amber">Internal</Badge> : null}</p>
                  <p className="mt-1">{m.body}</p>
                  <p className="mt-1 text-xs text-secondary">{formatRelative(m.at)}</p>
                </div>
              );
            })}
          </div>
          {ticket.status !== "Resolved" ? (
            <div className="card-surface space-y-3 p-4">
              <Input placeholder="Public reply..." value={reply} onChange={(e) => setReply(e.target.value)} />
              <Button onClick={async () => { if (!reply.trim()) return; await supportService.reply(ticket.id, reply); setReply(""); toast.success("Reply sent"); }}>Send reply</Button>
              <Textarea label="Internal note" value={internalNote} onChange={(e) => setInternalNote(e.target.value)} rows={2} />
              <Button variant="secondary" size="sm" onClick={async () => { if (!internalNote.trim()) return; await supportService.reply(ticket.id, internalNote, true); setInternalNote(""); toast.success("Note added"); }}>Add internal note</Button>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="card-surface space-y-3 p-4 text-sm">
            <p><strong>Status:</strong> <StatusBadge status={ticket.status} /></p>
            <p><strong>Requester:</strong> {requester?.name}</p>
            <Select label="Assign to" value={ticket.assignedTo || ""} onChange={(e) => { updateTicket(ticket.id, { assignedTo: e.target.value, status: "In progress" }); toast.success("Assigned"); }} options={[{ value: "", label: "Unassigned" }, ...agents.map((a) => ({ value: a.id, label: a.name }))]} />
            <Select label="Priority" value={ticket.priority} onChange={(e) => { updateTicket(ticket.id, { priority: e.target.value }); toast.success("Priority updated"); }} options={["Low", "Medium", "High", "Critical"]} />
          </div>

          {ticket.status !== "Resolved" ? (
            <div className="card-surface space-y-3 p-4">
              <Textarea label="Resolution summary" value={resolution} onChange={(e) => setResolution(e.target.value)} />
              <Button onClick={async () => { if (!resolution.trim()) { toast.error("Resolution required"); return; } await supportService.resolve(ticket.id, resolution); updateTicket(ticket.id, { satisfactionRating: rating }); toast.success("Resolved"); }}>Resolve</Button>
              <Button variant="outline" onClick={async () => { await supportService.escalate(ticket.id, "university"); toast.success("Escalated"); }}>Escalate</Button>
            </div>
          ) : (
            <div className="card-surface p-4 text-sm">
              <p><strong>Resolution:</strong> {ticket.resolution || "—"}</p>
              <p className="mt-2"><strong>Satisfaction:</strong> {ticket.satisfactionRating ?? rating} / 5</p>
            </div>
          )}

          <div className="card-surface p-4">
            <h3 className="font-semibold">Suggested articles</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {articles.map((a) => (
                <li key={a.id}>
                  <Link href={`/help/articles/${a.slug}`} className="text-nexus-700 hover:underline">{a.title}</Link>
                </li>
              ))}
              {!articles.length && <p className="text-secondary">No matches — search knowledge base.</p>}
            </ul>
          </div>

          {!ticket.satisfactionRating && ticket.status === "Resolved" ? (
            <div className="card-surface p-4">
              <Select label="Simulate satisfaction" value={String(rating)} onChange={(e) => { const v = Number(e.target.value); setRating(v); updateTicket(ticket.id, { satisfactionRating: v }); toast.success("Rating recorded"); }} options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} stars` }))} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
