"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Input, Textarea, Select, PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout/Shell";
import { supportService } from "@/lib/mockServices";
import { useCurrentUser } from "@/hooks/useApp";
import { toast } from "sonner";

export default function ContactPage() {
  const user = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    category: "General",
    priority: "Medium",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    await supportService.createTicket({
      subject: form.subject,
      category: form.category,
      priority: form.priority,
      description: form.description,
    });
    setLoading(false);
    toast.success("Message sent! Ticket created — 95% SLA target within 24 hours.");
    setForm((f) => ({ ...f, subject: "", description: "" }));
  };

  return (
    <div className="page-container py-10 sm:py-14">
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />}
        title="Contact support"
        description="Submit a message and we'll create a helpdesk ticket. Prototype SLA: 95% within 24 hours."
      />

      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6 lg:col-span-3">
          <Input
            label="Full name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Subject"
            required
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              <option value="General">General</option>
              <option value="Account">Account</option>
              <option value="Applications">Applications</option>
              <option value="Funding">Funding</option>
              <option value="Safety">Safety</option>
              <option value="Technical">Technical</option>
            </Select>
            <Select label="Priority" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </Select>
          </div>
          <Textarea
            label="Message"
            required
            rows={6}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe your question or issue..."
          />
          <Button type="submit" loading={loading}>Send message</Button>
        </form>

        <aside className="space-y-4 lg:col-span-2">
          <div className="card-surface p-5">
            <h3 className="font-semibold">Helpdesk SLA</h3>
            <p className="mt-2 text-sm text-secondary">95% of tickets answered within 24 hours. Urgent safety issues escalated immediately.</p>
          </div>
          <div className="card-surface p-5">
            <h3 className="font-semibold">Other resources</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/help" className="text-nexus-700 dark:text-nexus-300">Help centre</Link></li>
              <li><Link href="/faq" className="text-nexus-700 dark:text-nexus-300">FAQ</Link></li>
              <li><Link href="/safety" className="text-nexus-700 dark:text-nexus-300">Safety & reporting</Link></li>
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40">
            <p className="font-medium text-amber-900 dark:text-amber-100">Prototype notice</p>
            <p className="mt-1 text-amber-800 dark:text-amber-200">Form submissions create simulated tickets in local storage — no email is sent.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
