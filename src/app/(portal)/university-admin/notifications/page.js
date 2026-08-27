"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, FilterBar, Select, Button, Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatRelative } from "@/lib/formatters";

export default function NotificationsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const [readFilter, setReadFilter] = useState("all");

  const mine = useMemo(
    () =>
      notifications
        .filter((n) => n.userId === user?.id)
        .filter((n) => readFilter === "all" || (readFilter === "unread" ? !n.read : n.read))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [notifications, user, readFilter]
  );

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description={`${mine.filter((n) => !n.read).length} unread`} actions={<Button variant="secondary" onClick={() => markNotificationRead("all")}>Mark all read</Button>} />
      <FilterBar>
        <Select label="Status" value={readFilter} onChange={(e) => setReadFilter(e.target.value)} options={[{ value: "all", label: "All" }, { value: "unread", label: "Unread" }, { value: "read", label: "Read" }]} />
      </FilterBar>
      <ul className="space-y-2">
        {mine.map((n) => (
          <li key={n.id}>
            <button type="button" onClick={() => { markNotificationRead(n.id); if (n.link || n.href) router.push(n.link || n.href); }} className={`card-surface w-full p-4 text-left ${!n.read ? "border-l-4 border-l-nexus-600" : ""}`}>
              <div className="flex justify-between"><p className="font-medium">{n.title}</p>{!n.read ? <Badge tone="teal">New</Badge> : null}</div>
              <p className="mt-1 text-sm text-secondary">{n.body}</p>
              <p className="mt-2 text-xs text-secondary">{formatRelative(n.createdAt)}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
