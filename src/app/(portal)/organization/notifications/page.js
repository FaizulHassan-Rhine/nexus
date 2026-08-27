"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, FilterBar } from "@/components/ui";
import { Button, Select, Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatRelative } from "@/lib/formatters";
import { getNotificationLink } from "../_lib/helpers";

export default function OrganizationNotificationsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);

  const [category, setCategory] = useState("all");
  const [readFilter, setReadFilter] = useState("all");

  const mine = useMemo(
    () =>
      notifications
        .filter((n) => n.userId === user?.id || (!n.userId && n.category === "system"))
        .filter((n) => category === "all" || n.type === category || n.category === category)
        .filter((n) => {
          if (readFilter === "unread") return !n.read;
          if (readFilter === "read") return n.read;
          return true;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [notifications, user, category, readFilter]
  );

  const openNotification = (n) => {
    markNotificationRead(n.id);
    const link = getNotificationLink(n);
    if (link) router.push(link.replace("/student/", "/organization/").replace("/university-admin/", "/organization/"));
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${mine.filter((n) => !n.read).length} unread`}
        actions={<Button variant="secondary" onClick={() => markNotificationRead("all")}>Mark all read</Button>}
      />

      <FilterBar>
        <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={[
          { value: "all", label: "All" },
          { value: "applications", label: "Applications" },
          { value: "funding", label: "Funding" },
          { value: "message", label: "Messages" },
          { value: "system", label: "System" },
        ]} />
        <Select label="Status" value={readFilter} onChange={(e) => setReadFilter(e.target.value)} options={[
          { value: "all", label: "All" },
          { value: "unread", label: "Unread" },
          { value: "read", label: "Read" },
        ]} />
      </FilterBar>

      <ul className="space-y-2">
        {mine.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => openNotification(n)}
              className={`card-surface w-full p-4 text-left ${!n.read ? "border-l-4 border-l-nexus-600" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-secondary">{n.body}</p>
                </div>
                <div className="text-right">
                  {!n.read ? <Badge tone="teal">New</Badge> : null}
                  <p className="mt-1 text-xs text-secondary">{formatRelative(n.createdAt)}</p>
                </div>
              </div>
            </button>
          </li>
        ))}
        {!mine.length && <p className="text-sm text-secondary">No notifications.</p>}
      </ul>
    </div>
  );
}
