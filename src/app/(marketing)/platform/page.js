"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Landmark,
  Microscope,
  Users,
  Sparkles,
  ShieldCheck,
  BarChart3,
  LifeBuoy,
  MessageSquare,
  Scale,
  Briefcase,
  Wallet,
  Globe2,
  FlaskConical,
  Handshake,
  Cpu,
  ClipboardCheck,
} from "lucide-react";
import { PageHeader, SectionHeader, Badge } from "@/components/ui";

const AUDIENCES = [
  { title: "Students", desc: "All recognized institutions: universities, colleges, schools, madrasas, polytechnics, and more.", href: "/register/student", icon: GraduationCap },
  { title: "Faculty", desc: "University faculty and school, college, or madrasa teachers — research, exchange, workshops, and student support.", href: "/register/faculty", icon: Users },
  { title: "Researchers", desc: "Dedicated portal for grants, datasets, collaborations, and publications.", href: "/register/researcher", icon: Microscope },
  { title: "Educational institutions", desc: "Institutional profile, review queue, placements, and partnerships.", href: "/register/university-admin", icon: Landmark },
  { title: "Companies & employers", desc: "Local jobs, internships, and international remote hiring.", href: "/register/organization", icon: Building2 },
  { title: "Training providers", desc: "Language courses, bootcamps, workshops, and professional certificates.", href: "/register/organization?type=Training%20provider", icon: Handshake },
  { title: "Industry professionals", desc: "Mentor talent and discover local or remote international roles.", href: "/register/industry-professional", icon: Briefcase },
  { title: "UGC administrators", desc: "National oversight, co-funding, and programme governance.", href: "/login", icon: ShieldCheck },
];

const MODULE_GROUPS = [
  {
    title: "Profiles",
    description: "Verified identity and capability records for every participant",
    modules: [
      { name: "Student skill profiles", href: "/student/skills", icon: GraduationCap },
      { name: "Faculty profiles", href: "/faculty/profile", icon: Users },
      { name: "Researcher profiles", href: "/researcher/profile", icon: Microscope },
      { name: "Industry & organization profiles", href: "/organization/profile", icon: Building2 },
      { name: "Institutional profiles", href: "/university-admin/institution-profile", icon: Landmark },
    ],
  },
  {
    title: "Programmes",
    description: "Opportunity lifecycle from posting through completion",
    modules: [
      { name: "Opportunity management", href: "/organization/opportunities", icon: Briefcase },
      { name: "Internship management", href: "/university-admin/internships", icon: ClipboardCheck },
      { name: "Faculty exchange", href: "/faculty/exchange", icon: Globe2 },
      { name: "Technology transfer", href: "/technology-marketplace", icon: Cpu },
      { name: "Student project funding", href: "/student/funding", icon: Wallet },
    ],
  },
  {
    title: "Intelligence",
    description: "Explainable matching and personalized recommendations",
    modules: [
      { name: "Matching engine (nexus-match-v2)", href: "/student/matches", icon: Sparkles },
      { name: "Recommendation engine", href: "/student/discover", icon: FlaskConical },
    ],
  },
  {
    title: "Governance",
    description: "Administrative review, oversight, and compliance",
    modules: [
      { name: "University review & approval workflow", href: "/university-admin/review-queue", icon: ShieldCheck },
      { name: "UGC oversight dashboard", href: "/ugc/dashboard", icon: BarChart3 },
      { name: "Monitoring & analytics", href: "/university-admin/reports", icon: BarChart3 },
      { name: "Dispute management", href: "/university-admin/disputes", icon: Scale },
    ],
  },
  {
    title: "Support",
    description: "Communication, notifications, and helpdesk services",
    modules: [
      { name: "Communication & notifications", href: "/student/messages", icon: MessageSquare },
      { name: "Helpdesk", href: "/helpdesk/dashboard", icon: LifeBuoy },
    ],
  },
];

export default function PlatformPage() {
  const moduleCount = MODULE_GROUPS.reduce((sum, g) => sum + g.modules.length, 0);

  return (
    <div className="page-container py-10 sm:py-14">
      <PageHeader
        title="Nexus platform capabilities"
        description="Section 11 core modules — connected audiences, explainable intelligence, and governed workflows across Bangladesh's national matchmaking hub."
      />

      <div className="mb-10 flex flex-wrap gap-2">
        <Badge tone="blue">{AUDIENCES.length} connected audiences</Badge>
        <Badge tone="green">{moduleCount} core modules live</Badge>
        <Badge>Matching · Recommendation · Review · UGC oversight</Badge>
      </div>

      <section className="mb-14">
        <SectionHeader title="Connected audiences" description="Each role has tailored registration, onboarding, and portal navigation." />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {AUDIENCES.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className="card-surface group p-5 transition hover:border-nexus-300 hover:shadow-md">
                <div className="mb-3 inline-flex rounded-xl bg-nexus-600 p-2.5 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-secondary">{item.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-nexus-700 group-hover:gap-2 dark:text-nexus-300">
                  Explore <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {MODULE_GROUPS.map((group) => (
        <section key={group.title} className="mb-12">
          <SectionHeader title={group.title} description={group.description} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link key={mod.name} href={mod.href} className="card-surface flex items-start gap-4 p-4 transition hover:border-nexus-300">
                  <div className="rounded-lg bg-chrome p-2 dark:bg-nexus-900">
                    <Icon className="h-5 w-5 text-nexus-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{mod.name}</h3>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-nexus-700 dark:text-nexus-300">
                      Open module <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <section className="card-surface p-6 text-center">
        <h2 className="text-lg font-semibold">Explore with demo accounts</h2>
        <p className="mt-2 text-sm text-secondary">
          Sign in with role-specific demo credentials from the login page — including the new researcher portal at{" "}
          <Link href="/researcher/dashboard" className="font-medium text-nexus-700 hover:underline dark:text-nexus-300">
            /researcher/dashboard
          </Link>
          .
        </p>
        <Link href="/login" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-nexus-700 dark:text-nexus-300">
          Go to login <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
