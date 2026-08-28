"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Input, Avatar, EmptyState } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { messagingService } from "@/lib/mockServices";
import { formatRelative } from "@/lib/formatters";
import { toast } from "sonner";
import { getConversationParticipants, getMessageTime } from "../_lib/helpers";

export default function ResearcherMessagesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const conversations = useAppStore((s) => s.conversations);
  const users = useAppStore((s) => s.users);

  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const myConversations = useMemo(
    () =>
      conversations
        .filter((c) => getConversationParticipants(c).includes(user?.id))
        .sort((a, b) => new Date(b.updatedAt || b.lastMessageAt || 0) - new Date(a.updatedAt || a.lastMessageAt || 0)),
    [conversations, user]
  );

  const active = myConversations.find((c) => c.id === activeId) || myConversations[0];
  const otherId = active ? getConversationParticipants(active).find((id) => id !== user?.id) : null;
  const otherUser = users.find((u) => u.id === otherId);

  const send = async () => {
    if (!draft.trim() || !active) return;
    setSending(true);
    try {
      await messagingService.send(active.id, draft.trim());
      setDraft("");
      toast.success("Message sent");
    } finally {
      setSending(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="University partners, industry collaborators, and research coordinators" />

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
            <EmptyState title="No conversations" />
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
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {(active.messages || []).map((m) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          isMe ? "bg-nexus-600 text-white" : "bg-slate-100 dark:bg-slate-800"
                        }`}
                      >
                        <p>{m.body}</p>
                        <p className={`mt-1 text-xs ${isMe ? "text-nexus-100" : "text-secondary"}`}>
                          {formatRelative(getMessageTime(m))}
                        </p>
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
                <Button loading={sending} onClick={send}>Send</Button>
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
