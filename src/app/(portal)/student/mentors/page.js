"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Avatar, Badge, Modal, Textarea } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { toast } from "sonner";

export default function MentorsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const users = useAppStore((s) => s.users);
  const createConversation = useAppStore((s) => s.createConversation);

  const [messageOpen, setMessageOpen] = useState(null);
  const [message, setMessage] = useState("");

  const mentors = useMemo(
    () =>
      users.filter(
        (u) =>
          u.role === "faculty" &&
          u.universityId === user?.universityId &&
          (u.availability?.open !== false)
      ),
    [users, user]
  );

  const sendMentorRequest = () => {
    if (!message.trim() || !messageOpen || !user) return;
    const conv = createConversation([user.id, messageOpen.id], `Mentorship: ${user.name}`);
    useAppStore.getState().sendMessage(conv.id, message);
    toast.success(`Message sent to ${messageOpen.name}`);
    setMessageOpen(null);
    setMessage("");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentors"
        description="Connect with faculty mentors at your university"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {mentors.map((m) => (
          <article key={m.id} className="card-surface flex gap-4 p-4">
            <Avatar name={m.name} src={m.avatar} />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold">{m.name}</h3>
              <p className="text-sm text-secondary">{m.designation} · {m.department}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(m.researchAreas || m.teachingExpertise || []).slice(0, 4).map((a) => (
                  <Badge key={a} tone="slate">{a}</Badge>
                ))}
              </div>
              {m.availability?.notes ? (
                <p className="mt-2 text-xs text-secondary">{m.availability.notes}</p>
              ) : null}
              <Button size="sm" className="mt-3" onClick={() => setMessageOpen(m)}>
                Request mentorship
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={Boolean(messageOpen)}
        onClose={() => setMessageOpen(null)}
        title={`Message ${messageOpen?.name}`}
      >
        <Textarea
          rows={4}
          placeholder="Introduce yourself and what you'd like guidance on..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setMessageOpen(null)}>Cancel</Button>
          <Button onClick={sendMentorRequest}>Send</Button>
        </div>
      </Modal>
    </div>
  );
}
