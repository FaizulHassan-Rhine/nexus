"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Tabs, TabList, Tab, TabPanel, Button } from "@/components/ui";
import { PageHeader } from "@/components/ui";
import { DEMO_ACCOUNTS } from "@/lib/constants";

const FLOWS = {
  student: {
    title: "Student journey",
    steps: [
      { title: "Register & verify", desc: "Create your profile with institution type and an identity document (NID, birth certificate, or passport)." },
      { title: "Build your passport", desc: "Add skills, languages, interests, availability, and documents." },
      { title: "Get matched", desc: "Discover local jobs, international remote roles, courses, and scholarships with explainable scores." },
      { title: "Apply with oversight", desc: "Submit applications routed through your university for review." },
      { title: "Track progress", desc: "Monitor status from submission through offer and completion." },
    ],
    cta: { label: "Register as student", href: "/register/student" },
    demo: "student@nexus.demo",
  },
  faculty: {
    title: "Faculty journey",
    steps: [
      { title: "Register with your institution", desc: "University faculty and school, college, or madrasa teachers all register as Faculty. Verify affiliation and identity." },
      { title: "Add teaching and research profile", desc: "List subjects, expertise, publications, and collaboration interests." },
      { title: "Discover opportunities", desc: "Joint research, exchanges, workshops, consultancy, and student support tools." },
      { title: "Apply or respond", desc: "Submit faculty applications, respond to industry problem statements, or recommend opportunities to students." },
      { title: "Track impact", desc: "Manage collaborations and see which students apply and complete programmes." },
    ],
    cta: { label: "Register as faculty", href: "/register/faculty" },
    demo: "faculty@nexus.demo",
  },
  organization: {
    title: "Organization journey",
    steps: [
      { title: "Multi-step registration", desc: "Submit organization details and verification documents." },
      { title: "Verification review", desc: "Pending state until trade license and representative checks complete." },
      { title: "Post opportunities", desc: "Jobs, internships, courses, scholarships, and research calls." },
      { title: "Receive approved candidates", desc: "Only university-reviewed applications reach your queue." },
      { title: "Co-funding & monitoring", desc: "Request UGC co-funding and track internship milestones." },
    ],
    cta: { label: "Register organization", href: "/register/organization" },
    demo: "company@nexus.demo",
  },
  "university-admin": {
    title: "Institution administrator journey",
    steps: [
      { title: "Authorization request", desc: "Register with official email and authorization document." },
      { title: "Configure institution", desc: "Set departments, focal points, and partnership preferences." },
      { title: "Review queue", desc: "Approve or request changes on matches and applications." },
      { title: "Monitor placements", desc: "Track active internships, disputes, and compliance." },
      { title: "Report & analytics", desc: "Export placement data and partnership metrics." },
    ],
    cta: { label: "Register institution admin", href: "/register/university-admin" },
    demo: "university@nexus.demo",
  },
  ugc: {
    title: "UGC administrator journey",
    steps: [
      { title: "Invitation-only access", desc: "UGC roles are provisioned by system administrators." },
      { title: "Programme oversight", desc: "Manage co-funding budgets and eligibility rules." },
      { title: "Funding review", desc: "Approve or reject co-funding requests with audit trail." },
      { title: "Dispute resolution", desc: "Escalated cases from universities and helpdesk." },
      { title: "National analytics", desc: "Demo dashboards for regional and sector metrics." },
    ],
    cta: { label: "Demo login (UGC)", href: "/login" },
    demo: "ugc@nexus.demo",
  },
};

export default function HowItWorksPage() {
  return (
    <div className="page-container py-10 sm:py-14">
      <PageHeader
        title="How it works"
        description="Step-by-step flows for each role in the Nexus ecosystem. Use demo accounts to explore portals."
      />

      <Tabs defaultValue="student">
        <TabList>
          <Tab value="student">Student</Tab>
          <Tab value="faculty">Faculty</Tab>
          <Tab value="organization">Organization</Tab>
          <Tab value="university-admin">Institution admin</Tab>
          <Tab value="ugc">UGC</Tab>
        </TabList>

        {Object.entries(FLOWS).map(([key, flow]) => (
          <TabPanel key={key} value={key}>
            <h2 className="text-xl font-semibold">{flow.title}</h2>
            <ol className="mt-6 space-y-4">
              {flow.steps.map((step, idx) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nexus-600 text-sm font-semibold text-white">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-secondary">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={flow.cta.href}>
                <Button>{flow.cta.label}</Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary">
                  Try demo: {DEMO_ACCOUNTS.find((a) => a.email === flow.demo)?.name}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
}
