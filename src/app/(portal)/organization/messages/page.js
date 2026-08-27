"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Input, Avatar, EmptyState } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { messagingService } from "@/lib/mockServices";
import { formatRelative } from "@/lib/formatters";
import { getConversationParticipants, getMessageTime } from "../_lib/helpers";

const QUICK_REPLIES = [
  "Thank you for your interest. We will review and respond shortly.",
  "Could you share your availability for an interview next week?",
  "Your application has progressed to the next stage.",
  "Please upload your updated transcript via Nexus.",
];

export default function OrganizationMessagesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const conversations = useAppStore((s) => s.conversations);
  const users = useAppStore((s) => s.users);
  const createConversation = useAppStore((s) => s.createConversation);

  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [sending, setSending] = useState(false);

  const myConversations = useMemo(
    () =>
      conversations
        .filter((c) => getConversationParticipants(c).includes(user?.id))
        .filter((c) => {
          if (!q) return true;
          const pid = getConversationParticipants(c).find((id) => id !== user?.id);
          const peer = users.find((u) => u.id === pid);
          return (c.subject || peer?.name || "").toLowerCase().includes(q.toLowerCase());
        })
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)),
    [conversations, user, q, users]
  );

  const active = myConversations.find((c) => c.id === activeId) || myConversations[0];
  const otherId = active ? getConversationParticipants(active).find((id) => id !== user?.id) : null;
  const otherUser = users.find((u) => u.id === otherId);

  const send = async (body) => {
    const text = body || draft;
    if (!text.trim() || !active) return;
    setSending(true);
    try {
      await messagingService.send(active.id, text.trim());
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  const startWithCandidate = () => {
    const student = users.find((u) => u.role === "student" && u.privacyPreferences?.shareWithOrganizations !== false);
    if (!student) return;
    const existing = myConversations.find((c) => getConversationParticipants(c).includes(student.id));
    if (existing) {
      setActiveId(existing.id);
      return;
    }
    const conv = createConversation([user.id, student.id], "Recruitment — BengalTech");
    setActiveId(conv.id);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Candidates, universities, and support"
        actions={<Button variant="secondary" onClick={startWithCandidate}>Message candidate</Button>}
      />

      <Input placeholder="Search conversations..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />

      <div className="grid gap-4 lg:grid-cols-3">
        <aside className="card-surface max-h-[70vh] overflow-y-auto p-2 lg:col-span-1">
          {myConversations.length ? (
            <ul className="space-y-1">
              {myConversations.map((c) => {
                const pid = getConversationParticipants(c).find((id) => id !== user?.id);
                const peer = users.find((u) => u.id === pid);
                const last = c.messages?.[c.messages.length - 1];
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm ${active?.id === c.id ? "bg-nexus-50 dark:bg-nexus-950" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      <p className="font-medium">{c.subject || peer?.name}</p>
                      <p className="line-clamp-1 text-xs text-secondary">{last?.body}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="No conversations" description="Start messaging from Candidates" />
          )}
        </aside>

        <div className="card-surface flex min-h-[400px] flex-col lg:col-span-2">
          {active ? (
            <>
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Avatar name={otherUser?.name} src={otherUser?.avatar} />
                  <div>
                    <p className="font-semibold">{active.subject || otherUser?.name}</p>
                    <p className="text-xs text-secondary">{otherUser?.role}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {QUICK_REPLIES.map((r) => (
                    <Button key={r} size="sm" variant="ghost" className="text-xs" onClick={() => send(r)}>
                      {r.slice(0, 40)}…
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {(active.messages || []).map((m) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${isMe ? "bg-nexus-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                        <p>{m.body}</p>
                        <p className={`mt-1 text-xs ${isMe ? "text-nexus-100" : "text-secondary"}`}>{formatRelative(getMessageTime(m))}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700">
                <Input
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                  className="flex-1"
                />
                <Button loading={sending} onClick={() => send()}>Send</Button>
              </div>
            </>
          ) : (
            <EmptyState title="Select a conversation" className="m-auto" />
          )}
        </div>
      </div>
    </div>
  );
}
