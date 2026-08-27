# Nexus — National Digital Matchmaking Hub

Frontend-only prototype of Bangladesh's national opportunity-matching ecosystem.

## Stack

- Next.js (App Router)
- JavaScript (no TypeScript)
- Tailwind CSS v4
- Zustand + localStorage persistence (`nexus-demo-v1`)
- Recharts, Lucide, Sonner, React Hook Form, Zod

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

Password for all accounts: `demo123`

| Role | Email |
|------|-------|
| Student | `student@nexus.demo` |
| Faculty | `faculty@nexus.demo` |
| Organization | `company@nexus.demo` |
| University Admin | `university@nexus.demo` |
| UGC Admin | `ugc@nexus.demo` |
| Helpdesk | `helpdesk@nexus.demo` |

On the login page, use the demo account cards for one-click sign-in. Use **Switch role** in the portal user menu to move between portals without logging out.

Demo OTP for registration: `123456`

## Scripts

```bash
npm run dev
npm run lint
npm run build
node scripts/verify-flows.mjs
```

## Notes

- All data is simulated. There is no backend, database, or real SSO/ERP/payment integration.
- State persists in the browser via `localStorage` and can be reset from Settings.
- Match scores are computed deterministically by `src/lib/matchEngine.js` (demo student × opp-001 = **88%**).
- Prototype notice appears in the public header/footer and portal chrome.

## Scope

~131 routes covering public marketplace, auth/onboarding, and six role portals (student, faculty, organization, university admin, UGC, helpdesk) with shared end-to-end workflows for applications, co-funding, disputes, and helpdesk SLA.
