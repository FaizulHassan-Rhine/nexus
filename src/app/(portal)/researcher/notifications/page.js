"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, FilterBar } from "@/components/ui";
import { Button, Select, Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatRelative } from "@/lib/formatters";
import { toast } from "sonner";
import { getNotificationLink } from "../_lib/helpers";

export default function ResearcherNotificationsPage() {
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
        .filter((n) => n.userId === user?.id)
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
    if (link) {
      router.push(
        link
          .replace("/student/", "/researcher/")
          .replace("/faculty/", "/researcher/")
          .replace(/^\/opportunities/, "/researcher/opportunities")
      );
    }
    toast.message("Notification opened");
  };

  const markAll = () => {
    markNotificationRead("all");
    toast.success("All notifications marked read");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${mine.filter((n) => !n.read).length} unread`}
        actions={<Button variant="secondary" onClick={markAll}>Mark all read</Button>}
      />

      <FilterBar>
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[
            { value: "all", label: "All" },
            { value: "application", label: "Applications" },
            { value: "match", label: "Matches" },
            { value: "research", label: "Research" },
            { value: "message", label: "Messages" },
            { value: "system", label: "System" },
          ]}
        />
        <Select
          label="Status"
          value={readFilter}
          onChange={(e) => setReadFilter(e.target.value)}
          options={[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread only" },
            { value: "read", label: "Read only" },
          ]}
        />
      </FilterBar>

      <ul className="space-y-2">
        {mine.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => openNotification(n)}
              className={`card-surface w-full p-4 text-left transition hover:shadow-md ${!n.read ? "border-l-4 border-l-nexus-600" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="mt-1 text-sm text-secondary">{n.body}</p>
                </div>
                {!n.read ? <Badge tone="teal">New</Badge> : null}
              </div>
              <p className="mt-2 text-xs text-secondary">{formatRelative(n.createdAt)}</p>
            </button>
          </li>
        ))}
        {!mine.length && <p className="text-center text-secondary">No notifications match your filters.</p>}
      </ul>
    </div>
  );
}
