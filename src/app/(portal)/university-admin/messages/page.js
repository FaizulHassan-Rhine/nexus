"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Input, Avatar, EmptyState } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { messagingService } from "@/lib/mockServices";
import { formatRelative } from "@/lib/formatters";

function getParticipants(c) {
  return c.participantIds || c.participants || [];
}

export default function MessagesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const conversations = useAppStore((s) => s.conversations);
  const users = useAppStore((s) => s.users);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");

  const mine = useMemo(
    () => conversations.filter((c) => getParticipants(c).includes(user?.id)).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)),
    [conversations, user]
  );
  const active = mine.find((c) => c.id === activeId) || mine[0];
  const peerId = active ? getParticipants(active).find((id) => id !== user?.id) : null;
  const peer = users.find((u) => u.id === peerId);

  const send = async () => {
    if (!draft.trim() || !active) return;
    await messagingService.send(active.id, draft.trim());
    setDraft("");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Communicate with students, UGC, organizations, and helpdesk" />
      <div className="grid gap-4 lg:grid-cols-3">
        <aside className="card-surface max-h-[70vh] overflow-y-auto p-2">
          {mine.map((c) => {
            const pid = getParticipants(c).find((id) => id !== user?.id);
            const p = users.find((u) => u.id === pid);
            const last = c.messages?.[c.messages.length - 1];
            return (
              <button key={c.id} type="button" onClick={() => setActiveId(c.id)} className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm ${active?.id === c.id ? "bg-nexus-50 dark:bg-nexus-950" : "hover:bg-slate-50"}`}>
                <p className="font-medium">{c.subject || p?.name}</p>
                <p className="line-clamp-1 text-xs text-secondary">{last?.body}</p>
              </button>
            );
          })}
          {!mine.length && <EmptyState title="No conversations" />}
        </aside>
        <div className="card-surface flex min-h-[400px] flex-col lg:col-span-2">
          {active ? (
            <>
              <div className="border-b px-4 py-3 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Avatar name={peer?.name} src={peer?.avatar} />
                  <div><p className="font-semibold">{active.subject || peer?.name}</p><p className="text-xs text-secondary">{peer?.role}</p></div>
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {(active.messages || []).map((m) => (
                  <div key={m.id} className={`flex ${m.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.senderId === user?.id ? "bg-nexus-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                      <p>{m.body}</p>
                      <p className="mt-1 text-xs opacity-70">{formatRelative(m.at || m.sentAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 border-t p-3 dark:border-slate-700">
                <Input className="flex-1" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === "Enter" && send()} />
                <Button onClick={send}>Send</Button>
              </div>
            </>
          ) : (
            <EmptyState title="Select a conversation" className="flex-1 border-0" />
          )}
        </div>
      </div>
    </div>
  );
}
