"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Landmark,
  Search,
  ShieldCheck,
  Sparkles,
  Microscope,
  Users,
} from "lucide-react";
import { Button, Input, Select, Badge, StatCard, SectionHeader, Modal } from "@/components/ui";
import { OpportunityCard, MatchBreakdown, FundingSplitCard } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { scoreStudentOpportunity } from "@/lib/matchEngine";
import { JOURNEY_STAGES, OPPORTUNITY_TYPES, DIVISIONS } from "@/lib/constants";

const WORKFLOW_STEPS = [
  { label: "Verified profile", icon: ShieldCheck },
  { label: "Intelligent match", icon: Sparkles },
  { label: "University review", icon: GraduationCap },
  { label: "Confirmation", icon: Users },
  { label: "Monitoring", icon: Building2 },
];

const ROLE_CARDS = [
  { role: "student", title: "Student", desc: "Discover internships, scholarships, courses, and project funding matched to your profile.", icon: GraduationCap, href: "/register/student" },
  { role: "faculty", title: "Faculty", desc: "Find research collaborations, exchanges, and consultancy opportunities.", icon: Users, href: "/register/faculty" },
  { role: "researcher", title: "Researcher", desc: "Access grants, datasets, joint research calls, and technology transfer pathways.", icon: Microscope, href: "/register/researcher" },
  { role: "organization", title: "Organization", desc: "Post opportunities, access UGC co-funding, and hire verified talent.", icon: Building2, href: "/register/organization" },
  { role: "university-admin", title: "University", desc: "Review matches, verify profiles, and monitor student placements.", icon: Landmark, href: "/register/university-admin" },
];

const CATEGORY_GROUPS = [
  { label: "Jobs & internships", types: ["Paid internship", "Full-time job", "Part-time job", "Micro-internship"] },
  { label: "Learning", types: ["Free course", "Paid course", "Bootcamp", "Mentorship"] },
  { label: "Funding", types: ["Scholarship", "Student project funding", "Research grant"] },
  { label: "Research & innovation", types: ["Joint research", "Competition/hackathon", "Technology licensing"] },
];

const JOURNEY_CONTENT = {
  "first-year": { title: "First year", items: ["Financial support programmes", "Part-time campus jobs", "Foundational skill courses"] },
  "middle-years": { title: "Second & third year", items: ["Training bootcamps", "Industry projects", "Mentorship circles", "Regional exposure"] },
  "final-year": { title: "Final year", items: ["Paid internships", "Graduate jobs", "Scholarships", "Higher-study pathways"] },
  alumni: { title: "Graduate & alumni", items: ["Reskilling courses", "Mentoring opportunities", "Hiring programmes", "Startup support"] },
};

const BENEFITS = [
  { title: "Students", points: ["Explainable match scores", "UGC co-funded stipends", "University-approved applications", "Career passport"] },
  { title: "Faculty", points: ["Research matchmaking", "Industry problem statements", "Technology transfer listings", "Exchange programmes"] },
  { title: "Organizations", points: ["Verified talent pipeline", "50/50 UGC co-funding", "Compliance monitoring", "Multi-campus reach"] },
  { title: "Universities", points: ["Centralized review queue", "Placement analytics", "Partnership management", "Audit trail"] },
];

const TESTIMONIALS = [
  { name: "Prototype story — Ayesha R.", role: "Final-year CSE, BUET", quote: "The match breakdown helped me understand why the fintech internship fit my React and Node.js skills before applying." },
  { name: "Prototype story — Dr. Rafiqul I.", role: "Professor, BUET", quote: "Joint research listings connected our NLP lab with health-tech partners without cold outreach." },
  { name: "Prototype story — Nusrat J.", role: "HR, BengalTech", quote: "UGC co-funding made it feasible to expand our intern programme across three divisions." },
];

const PARTNER_TYPES = ["Public universities", "Private universities", "Technology companies", "NGOs & development", "Scholarship providers", "Government agencies"];

const bandChrome = "border-y border-[#d5e3df] bg-chrome dark:border-nexus-800 dark:bg-nexus-900/40";
const bandWhite = "bg-white dark:bg-nexus-950";

export default function LandingPage() {
  const router = useRouter();
  const opportunities = useAppStore((s) => s.opportunities);
  const users = useAppStore((s) => s.users);
  const journeyStage = useAppStore((s) => s.journeyStage);
  const setJourneyStage = useAppStore((s) => s.setJourneyStage);

  const [searchQ, setSearchQ] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchDivision, setSearchDivision] = useState("");
  const [searchStage, setSearchStage] = useState("");
  const [matchModalOpen, setMatchModalOpen] = useState(false);

  const featured = useMemo(
    () => opportunities.filter((o) => o.featured || o.metrics?.saves > 50).slice(0, 6),
    [opportunities]
  );

  const demoStudent = users.find((u) => u.id === "user-demo-student");
  const demoOpp = opportunities.find((o) => o.id === "opp-001");
  const demoScore = useMemo(() => {
    if (!demoStudent || !demoOpp) return null;
    return scoreStudentOpportunity(demoStudent, demoOpp);
  }, [demoStudent, demoOpp]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQ) params.set("q", searchQ);
    if (searchType) params.set("type", searchType);
    if (searchDivision) params.set("division", searchDivision);
    if (searchStage) params.set("studyStage", searchStage);
    router.push(`/opportunities${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div>
      {/* Hero — full viewport below sticky navbar */}
      <section className="relative isolate flex min-h-[calc(100dvh-4rem)] overflow-hidden border-b border-[#d5e3df] dark:border-nexus-800">
        <Image
          src="/images/hero-campus.jpg"
          alt="Students collaborating on campus"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-nexus-950/75 via-nexus-900/70 to-nexus-950/85"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(102,163,191,0.22),_transparent_55%)]" aria-hidden />

        <div className="relative page-container flex w-full flex-1 flex-col justify-start pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-base font-semibold tracking-[0.22em] text-nexus-200 uppercase sm:text-lg">
              National Digital Matchmaking Hub
            </p>
            <h1 className="mt-5 text-6xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
              Nexus
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-2xl font-medium text-balance text-white sm:text-3xl">
              Connect Bangladesh&apos;s talent with verified opportunities
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-nexus-100/90 sm:text-xl">
              Explainable matching for students, faculty, universities, and organizations — with university oversight.
            </p>
          </div>

          <form
            onSubmit={handleHeroSearch}
            className="mx-auto mt-12 w-full max-w-5xl rounded-2xl border border-white/15 bg-white/95 p-3 shadow-[0_20px_50px_rgba(18,36,56,0.35)] backdrop-blur-sm sm:p-4 dark:border-nexus-700 dark:bg-nexus-900/95"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <Input
                  placeholder="Keyword, skill, or role..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  aria-label="Search keyword"
                />
              </div>
              <div className="min-w-0 lg:w-[150px]">
                <Select label="" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                  <option value="">All types</option>
                  {OPPORTUNITY_TYPES.slice(0, 12).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div className="min-w-0 lg:w-[140px]">
                <Select label="" value={searchDivision} onChange={(e) => setSearchDivision(e.target.value)}>
                  <option value="">All locations</option>
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </div>
              <div className="min-w-0 lg:w-[150px]">
                <Select label="" value={searchStage} onChange={(e) => setSearchStage(e.target.value)}>
                  <option value="">Any study stage</option>
                  {JOURNEY_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </Select>
              </div>
              <Button type="submit" className="w-full shrink-0 lg:w-auto">
                <Search className="h-4 w-4" />
                Search opportunities
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Role selector */}
      <section className={bandChrome}>
        <div className="page-container py-16">
          <SectionHeader title="Choose your role" description="Tailored registration and dashboards for every participant in the ecosystem." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {ROLE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.role} href={card.href} className="card-surface group p-5 transition hover:border-nexus-300 hover:shadow-md">
                  <div className="mb-3 inline-flex rounded-xl bg-nexus-600 p-2.5 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm text-secondary">{card.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-nexus-700 group-hover:gap-2 dark:text-nexus-300">
                    Register <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trusted workflow */}
      <section className={`${bandWhite} py-12`}>
        <div className="page-container">
          <p className="text-center text-sm font-medium text-secondary">Trusted workflow</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {WORKFLOW_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-full border border-[#d5e3df] bg-chrome px-4 py-2 text-sm dark:border-nexus-700 dark:bg-nexus-900">
                    <Icon className="h-4 w-4 text-nexus-600" />
                    <span>{step.label}</span>
                  </div>
                  {idx < WORKFLOW_STEPS.length - 1 ? <ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block" /> : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={bandChrome}>
        <div className="page-container py-16">
          <SectionHeader title="Opportunity categories" description="Browse by type — from campus jobs to technology licensing." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.label} className="card-surface p-4">
                <h3 className="font-semibold">{group.label}</h3>
                <ul className="mt-3 space-y-2">
                  {group.types.map((type) => (
                    <li key={type}>
                      <Link href={`/opportunities?type=${encodeURIComponent(type)}`} className="text-sm text-nexus-700 hover:underline dark:text-nexus-300">
                        {type}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey lifecycle */}
      <section className={`${bandWhite} py-16`}>
        <div className="page-container">
          <SectionHeader title="Your journey with Nexus" description="Support at every stage — from first year through alumni careers." />
          <div className="mb-6 flex flex-wrap gap-2">
            {JOURNEY_STAGES.map((stage) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => setJourneyStage(stage.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  journeyStage === stage.id
                    ? "bg-nexus-600 text-white"
                    : "bg-nexus-400 text-white hover:bg-nexus-600"
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>
          <div className="card-surface p-6">
            <h3 className="text-lg font-semibold">{JOURNEY_CONTENT[journeyStage]?.title}</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {JOURNEY_CONTENT[journeyStage]?.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-nexus-600" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={`/opportunities?studyStage=${journeyStage}`} className="mt-4 inline-flex text-sm font-medium text-nexus-700 dark:text-nexus-300">
              View opportunities for this stage →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured opportunities */}
      <section className={bandChrome}>
        <div className="page-container py-16">
          <SectionHeader
            title="Featured opportunities"
            description="Highlighted roles from verified organizations across Bangladesh."
            actions={
              <Link href="/opportunities">
                <Button variant="secondary" size="sm">View all</Button>
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        </div>
      </section>

      {/* Explainable match demo */}
      <section className={`${bandWhite} py-16`}>
        <div className="page-container">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge tone="violet" className="mb-3">Explainable matching</Badge>
              <h2 className="text-2xl font-semibold">See why a match score is calculated</h2>
              <p className="mt-3 text-secondary">
                Nexus uses a deterministic seven-component engine — skills, eligibility, career fit, location, schedule, compensation, and track record. No sensitive attributes are used.
              </p>
              {demoOpp && demoScore ? (
                <div className="mt-4 card-surface p-4">
                  <p className="text-sm font-medium">{demoOpp.title}</p>
                  <p className="text-xs text-secondary">Demo: Ayesha Rahman (BUET CSE, final year) × {demoOpp.type}</p>
                  <Button className="mt-3" size="sm" onClick={() => setMatchModalOpen(true)}>
                    View match breakdown
                  </Button>
                </div>
              ) : null}
            </div>
            {demoScore ? (
              <div className="card-surface p-6">
                <MatchBreakdown scoreResult={demoScore} />
              </div>
            ) : null}
          </div>
        </div>
        <Modal open={matchModalOpen} onClose={() => setMatchModalOpen(false)} title="Match breakdown demo" size="lg">
          {demoScore ? <MatchBreakdown scoreResult={demoScore} /> : null}
        </Modal>
      </section>

      {/* UGC 50/50 */}
      <section className={bandChrome}>
        <div className="page-container py-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div>
              <Badge tone="violet" className="mb-3">UGC co-funding</Badge>
              <h2 className="text-2xl font-semibold">50/50 internship co-funding explained</h2>
              <p className="mt-3 text-secondary">
                Verified organizations in the UGC programme share internship stipend costs equally. For a BDT 18,000/month internship, the company pays BDT 9,000 and UGC pays BDT 9,000 — making quality placements accessible nationwide.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-secondary">
                <li>• Apply to a UGC-eligible paid internship</li>
                <li>• Receive university approval</li>
                <li>• Co-funding request generated automatically</li>
                <li>• Milestone payments released monthly</li>
              </ul>
              <Link href="/help/articles/ugc-co-funding-internships" className="mt-4 inline-block text-sm font-medium text-nexus-700 dark:text-nexus-300">
                Read the full guide →
              </Link>
            </div>
            <FundingSplitCard companyShare={50} ugcShare={50} total={18000} />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className={`${bandWhite} py-16`}>
        <div className="page-container">
          <SectionHeader title="Benefits for every participant" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="card-surface p-5">
                <h3 className="font-semibold">{b.title}</h3>
                <ul className="mt-3 space-y-2">
                  {b.points.map((p) => (
                    <li key={p} className="text-sm text-secondary">• {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* National impact metrics */}
      <section className={bandChrome}>
        <div className="page-container py-16">
          <SectionHeader title="National impact" description="Demo metrics from the prototype seed dataset — not official government statistics." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Published opportunities" value={String(opportunities.length)} hint="Across all types" tone="teal" />
            <StatCard label="Partner universities" value="12" hint="Active on Nexus" tone="blue" />
            <StatCard label="Verified organizations" value="18" hint="Including UGC co-funding partners" tone="violet" />
            <StatCard label="Match reviews" value="847" hint="University approvals this quarter (demo)" tone="green" />
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className={`${bandWhite} py-12`}>
        <div className="page-container">
          <p className="text-center text-sm text-secondary">Partner types represented in this prototype (placeholder logos — not endorsement claims)</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {PARTNER_TYPES.map((type) => (
              <div key={type} className="flex h-16 w-36 items-center justify-center rounded-xl border border-dashed border-nexus-400/50 bg-chrome px-3 text-center text-xs text-secondary dark:border-nexus-600 dark:bg-nexus-900">
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={bandChrome}>
        <div className="page-container py-16">
          <SectionHeader title="Prototype stories" description="Simulated testimonials for demonstration purposes only." />
          <div className="grid gap-4 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="card-surface p-5">
                <p className="text-sm text-secondary">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-secondary">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Helpdesk SLA */}
      <section className={`${bandWhite} py-12`}>
        <div className="page-container text-center">
          <Badge tone="green" className="mb-3">Helpdesk SLA target</Badge>
          <h2 className="text-xl font-semibold">95% of tickets answered within 24 hours</h2>
          <p className="mt-2 text-sm text-secondary">Prototype helpdesk with simulated SLA tracking. Escalation paths to university and UGC administrators.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/help"><Button variant="secondary" size="sm">Help centre</Button></Link>
            <Link href="/contact"><Button size="sm">Contact support</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
