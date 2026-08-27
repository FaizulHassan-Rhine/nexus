"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { downloadIcs } from "@/lib/exporters";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { calendarEvents } from "../_lib/helpers";

export default function CalendarPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const applications = useAppStore((s) => s.applications);
  const opportunities = useAppStore((s) => s.opportunities);
  const funding = useAppStore((s) => s.funding);

  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const events = useMemo(() => {
    const userApps = applications.filter((a) => a.applicantId === user?.id);
    return calendarEvents(user, userApps, opportunities, funding);
  }, [user, applications, opportunities, funding]);

  const monthEvents = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return events.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === y && d.getMonth() + 1 === m;
    });
  }, [events, month]);

  const downloadEvent = (event) => {
    downloadIcs({
      title: event.title,
      description: `${event.type} — Nexus calendar`,
      start: event.date,
      end: new Date(new Date(event.date).getTime() + 3600000),
    });
    toast.success("ICS downloaded");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Interviews, deadlines, and payment milestones"
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              if (events[0]) downloadEvent(events[0]);
              else toast.message("No events to export");
            }}
          >
            Download sample ICS
          </Button>
        }
      />

      <Tabs defaultValue="month">
        <TabList>
          <Tab value="month">Month view</Tab>
          <Tab value="list">List view</Tab>
        </TabList>

        <TabPanel value="month">
          <div className="card-surface p-4">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mb-4 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
            />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {monthEvents.map((e) => (
                <div key={e.id} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                  <Badge tone="teal">{e.type}</Badge>
                  <p className="mt-1 font-medium">{e.title}</p>
                  <p className="text-secondary">{formatDate(e.date, "dd MMM yyyy HH:mm")}</p>
                  <Button size="sm" variant="ghost" className="mt-2" onClick={() => downloadEvent(e)}>
                    Download ICS
                  </Button>
                </div>
              ))}
              {!monthEvents.length && <p className="text-secondary">No events this month.</p>}
            </div>
          </div>
        </TabPanel>

        <TabPanel value="list">
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.id} className="card-surface flex items-center justify-between p-3 text-sm">
                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-secondary">{formatDate(e.date)} · {e.type}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => downloadEvent(e)}>ICS</Button>
              </li>
            ))}
          </ul>
        </TabPanel>
      </Tabs>
    </div>
  );
}
