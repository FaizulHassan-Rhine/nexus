export const helpArticles = [
  {
    id: "article-001",
    slug: "getting-started-with-nexus",
    title: "Getting Started with Nexus",
    category: "Onboarding",
    roles: ["student", "faculty", "organization", "university-admin"],
    topics: ["Registration", "Profile", "Verification"],
    summary: "Learn how to create your Nexus profile, verify your identity, and explore opportunities.",
    content: `
Nexus connects students, faculty, organizations, and universities across Bangladesh. After registration, complete your profile to at least 80% to unlock intelligent matching.

**Steps:**
1. Register with your institutional email or use TIGERfed mock SSO
2. Complete profile fields including skills, interests, and documents
3. Browse opportunities or let Nexus suggest matches
4. Apply — most internships require university approval before reaching organizations

This is a prototype environment. All data is simulated.
    `.trim(),
    popular: true,
    createdAt: "2024-06-01T06:00:00+06:00",
    updatedAt: "2026-07-01T06:00:00+06:00",
  },
  {
    id: "article-002",
    slug: "understanding-match-scores",
    title: "Understanding Match Scores",
    category: "Matching",
    roles: ["student", "faculty"],
    topics: ["Matching", "Skills", "Fairness"],
    summary: "How Nexus calculates 0–100 match scores and what each breakdown component means.",
    content: `
Nexus uses a deterministic matching engine (not random scores) based on seven components:

- **Skills (30 pts)** — Required and preferred skill alignment
- **Eligibility (20 pts)** — Study year and department fit
- **Career (15 pts)** — Interests and opportunity type preferences
- **Location (10 pts)** — Division and work mode preferences
- **Schedule (10 pts)** — Weekly availability vs opportunity hours
- **Compensation (10 pts)** — Pay alignment and financial need programmes
- **Track record (5 pts)** — Projects, certifications, and verified experience

Scores below 40 indicate low match. The UI shows reasons, gaps, and suggested courses to improve fit.

Nexus never scores based on religion, ethnicity, or political affiliation.
    `.trim(),
    popular: true,
    createdAt: "2024-06-15T06:00:00+06:00",
    updatedAt: "2026-06-01T06:00:00+06:00",
  },
  {
    id: "article-003",
    slug: "ugc-co-funding-internships",
    title: "UGC Co-Funded Internships Explained",
    category: "Funding",
    roles: ["student", "organization", "university-admin", "ugc"],
    topics: ["UGC", "Co-funding", "Stipends"],
    summary: "How the 50/50 company–UGC co-funding model works for eligible internships.",
    content: `
Verified organizations in the UGC co-funding programme share internship stipend costs equally with UGC.

**Example:** BDT 18,000/month stipend
- Company pays: BDT 9,000 (50%)
- UGC pays: BDT 9,000 (50%)

**Eligibility steps:**
1. Apply to a UGC co-funding eligible paid internship
2. Receive university approval
3. Co-funding request is generated automatically
4. UGC reviews financial need and academic standing
5. Milestone payments released monthly upon verification

Company share plus UGC share must always equal 100%.
    `.trim(),
    popular: true,
    createdAt: "2024-07-01T06:00:00+06:00",
    updatedAt: "2026-07-01T06:00:00+06:00",
  },
  {
    id: "article-004",
    slug: "university-approval-workflow",
    title: "University Approval Workflow",
    category: "Applications",
    roles: ["student", "university-admin"],
    topics: ["Applications", "University review"],
    summary: "Why university approval is required and how long it typically takes.",
    content: `
Most internships, scholarships, and research placements require university approval before organizations receive your application.

**University administrators review:**
- Profile verification status
- Academic standing
- Document completeness
- Internship load vs academic schedule

Typical turnaround is 2–5 working days. You will receive notifications at each status change.

If changes are requested, upload the required documents and resubmit.
    `.trim(),
    popular: false,
    createdAt: "2024-08-01T06:00:00+06:00",
    updatedAt: "2025-06-01T06:00:00+06:00",
  },
  {
    id: "article-005",
    slug: "organization-verification",
    title: "Organization Verification Process",
    category: "Trust & Safety",
    roles: ["organization", "university-admin", "ugc"],
    topics: ["Verification", "Organizations"],
    summary: "How organizations become verified partners on Nexus.",
    content: `
Organizations register with trade license or NGOAB documentation, complete profile details, and undergo verification review.

**Verification checks:**
- Registration document authenticity (simulated in prototype)
- Contact and headquarters confirmation
- Past hiring metrics (self-reported)
- Risk assessment

Verified organizations display a badge on opportunity listings. UGC co-funding eligibility requires additional programme enrollment.
    `.trim(),
    popular: false,
    createdAt: "2024-09-01T06:00:00+06:00",
    updatedAt: "2025-09-01T06:00:00+06:00",
  },
  {
    id: "article-006",
    slug: "helpdesk-sla-and-escalation",
    title: "Helpdesk SLA and Escalation",
    category: "Support",
    roles: ["student", "faculty", "organization", "university-admin", "helpdesk"],
    topics: ["Tickets", "SLA", "Escalation"],
    summary: "Nexus targets 95% of helpdesk tickets resolved within 24 hours.",
    content: `
**Priority levels:**
- Critical (payment, safety): 4-hour initial response
- High: 8-hour initial response
- Medium: 24-hour initial response
- Low: 48-hour initial response

Escalation levels:
- Level 0: Helpdesk officer
- Level 1: University or organization focal point
- Level 2: UGC oversight (payments, disputes)

Create a ticket from any portal or email helpdesk@nexus.demo (simulated).
    `.trim(),
    popular: true,
    createdAt: "2024-10-01T06:00:00+06:00",
    updatedAt: "2026-01-01T06:00:00+06:00",
  },
  {
    id: "article-007",
    slug: "dispute-resolution-process",
    title: "Dispute Resolution Process",
    category: "Trust & Safety",
    roles: ["student", "faculty", "university-admin", "ugc"],
    topics: ["Disputes", "Payments", "Safety"],
    summary: "How to open a dispute and what happens at each review stage.",
    content: `
Disputes can be opened for payment delays, safety concerns, application fairness, and IP licensing disagreements.

**Process:**
1. Student or faculty opens dispute with evidence
2. University reviews and decides (5–10 working days)
3. Either party may appeal to UGC
4. UGC mediation or investigation for escalated cases
5. Resolution recorded in audit log

Payment disputes automatically hold pending UGC co-funding milestones.
    `.trim(),
    popular: false,
    createdAt: "2025-01-01T06:00:00+06:00",
    updatedAt: "2026-03-01T06:00:00+06:00",
  },
  {
    id: "article-008",
    slug: "demo-accounts-and-role-switch",
    title: "Demo Accounts and Role Switch",
    category: "Onboarding",
    roles: ["student", "faculty", "organization", "university-admin", "ugc", "helpdesk"],
    topics: ["Demo", "Login", "Prototype"],
    summary: "Use demo accounts to explore every portal without separate registrations.",
    content: `
**Demo credentials (password: demo123):**
- student@nexus.demo — Final-year CSE student
- faculty@nexus.demo — BUET professor
- company@nexus.demo — BengalTech HR lead
- university@nexus.demo — BUET admin
- ugc@nexus.demo — UGC officer
- helpdesk@nexus.demo — Support officer

Use **Switch role** in the user menu to explore other portals without logging out.

All users, opportunities, and financial records are simulated prototype data.
    `.trim(),
    popular: true,
    createdAt: "2024-06-01T06:00:00+06:00",
    updatedAt: "2026-08-01T06:00:00+06:00",
  },
  {
    id: "article-009",
    slug: "faculty-research-and-licensing",
    title: "Faculty Research and Technology Licensing",
    category: "Faculty",
    roles: ["faculty", "organization", "university-admin"],
    topics: ["Research", "Patents", "Licensing"],
    summary: "How faculty publish technologies and connect with industry licensing opportunities.",
    content: `
Faculty can list patents, prototypes, and laboratory capabilities in the Technology Marketplace.

**Collaboration types:**
- Joint research
- Technology licensing
- Consultancy
- Faculty exchange

University technology transfer offices mediate licensing disputes. UGC provides national oversight for publicly funded IP.
    `.trim(),
    popular: false,
    createdAt: "2025-03-01T06:00:00+06:00",
    updatedAt: "2026-05-01T06:00:00+06:00",
  },
];
