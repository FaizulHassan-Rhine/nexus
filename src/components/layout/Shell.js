"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings,
  CircleHelp,
  Sun,
  UserRound,
  X,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { ROLE_DASHBOARDS } from "@/lib/constants";
import { NAV_BY_ROLE } from "@/lib/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated, useLanguage, useThemePreference } from "@/hooks/useApp";
import { Avatar, Badge, IconButton, DropdownMenu, Input } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { NexusLogo, NexusMark } from "@/components/brand/NexusLogo";

export { NexusLogo, NexusMark };

export function PrototypeBanner() {
  return null;
}

export function ThemeToggle() {
  const { theme, setTheme } = useThemePreference();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      setDark(true);
      return;
    }
    if (theme === "light") {
      setDark(false);
      return;
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
  }, [theme]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(
        "relative mx-1 inline-flex h-7 w-14 shrink-0 items-center rounded-full px-0.5 transition-colors duration-300",
        "shadow-[inset_0_1px_2px_rgba(26,53,82,0.12)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexus-600/40",
        dark
          ? "bg-gradient-to-b from-sky to-nexus-700"
          : "bg-gradient-to-b from-[#e4d2a8] to-[#c4a36a]"
      )}
    >
      <Sun className="pointer-events-none absolute left-1.5 h-3.5 w-3.5 text-cream" strokeWidth={2.25} />
      <Moon className="pointer-events-none absolute right-1.5 h-3.5 w-3.5 text-cream" strokeWidth={2.25} />
      <span
        className={cn(
          "relative z-10 h-6 w-6 rounded-full bg-cream shadow-[0_1px_2px_rgba(26,53,82,0.16)] transition-transform duration-300",
          dark ? "translate-x-0" : "translate-x-7"
        )}
      />
    </button>
  );
}

const publicLinks = [
  { href: "/opportunities", key: "nav.opportunities" },
  { href: "/courses", key: "nav.courses" },
  { href: "/scholarships", key: "nav.scholarships" },
  { href: "/technology-marketplace", key: "nav.technology" },
  { href: "/organizations", key: "nav.organizations" },
  { href: "/universities", key: "nav.universities" },
  { href: "/platform", key: "nav.platform" },
];

export function PublicHeader() {
  const { language } = useLanguage();
  const user = useCurrentUser();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const mobileMenu =
    open && typeof document !== "undefined" ? (
      <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Site menu">
        <button
          type="button"
          className="absolute inset-0 bg-nexus-950/55"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
        <div className="absolute inset-y-0 right-0 flex h-dvh w-[min(20rem,88vw)] flex-col bg-chrome shadow-2xl dark:bg-nexus-900">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#d5e3df] px-4 dark:border-nexus-800">
            <NexusLogo />
            <IconButton label="Close" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </IconButton>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="Mobile">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium text-nexus-800 hover:bg-ocean hover:text-white dark:text-nexus-100 dark:hover:bg-sky dark:hover:text-nexus-950",
                  pathname?.startsWith(link.href) && "bg-ocean text-white dark:bg-ocean"
                )}
                onClick={() => setOpen(false)}
              >
                {t(link.key, language)}
              </Link>
            ))}
            {hydrated && user ? (
              <Link
                href={ROLE_DASHBOARDS[user.role] || "/"}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-nexus-800 hover:bg-ocean hover:text-white dark:text-nexus-100"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-nexus-800 hover:bg-ocean hover:text-white dark:text-nexus-100"
                onClick={() => setOpen(false)}
              >
                {t("nav.login", language)}
              </Link>
            )}
          </nav>
        </div>
      </div>
    ) : null;

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-[#d5e3df] bg-chrome/95 backdrop-blur dark:border-nexus-800 dark:bg-nexus-900/95">
      <div className="page-container grid h-16 grid-cols-[1fr_auto] items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <div className="justify-self-start">
          <NexusLogo />
        </div>
        <nav className="hidden items-center justify-center gap-5 lg:flex" aria-label="Primary">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "whitespace-nowrap text-sm text-slate-600 hover:text-nexus-700 dark:text-slate-300 dark:hover:text-nexus-300",
                pathname?.startsWith(link.href) && "font-medium text-nexus-700 dark:text-nexus-300"
              )}
            >
              {t(link.key, language)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end justify-self-end gap-1">
          <Link href="/opportunities" className="hidden sm:inline-flex" aria-label="Search opportunities">
            <IconButton label="Search">
              <Search className="h-4 w-4" />
            </IconButton>
          </Link>
          <ThemeToggle />
          {hydrated && user ? (
            <Link href={ROLE_DASHBOARDS[user.role] || "/"}>
              <Button size="sm" variant="primary">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="primary">
                {t("nav.login", language)}
              </Button>
            </Link>
          )}
          <IconButton label="Open menu" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </IconButton>
        </div>
      </div>
    </header>
    {mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}

export function PublicFooter() {
  const { language } = useLanguage();
  return (
    <footer className="mt-auto border-t border-[#d5e3df] bg-chrome dark:border-nexus-800 dark:bg-nexus-900">
      <div className="page-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <NexusLogo />
          <p className="mt-3 text-sm text-secondary">{t("app.tagline", language)}</p>
        </div>
        {[
          {
            title: "Explore",
            links: [
              ["/opportunities", "Opportunities"],
              ["/courses", "Courses"],
              ["/scholarships", "Scholarships"],
              ["/projects", "Projects"],
            ],
          },
          {
            title: "Network",
            links: [
              ["/organizations", "Organizations"],
              ["/universities", "Universities"],
              ["/technology-marketplace", "Technology"],
              ["/how-it-works", "How it works"],
            ],
          },
          {
            title: "Support",
            links: [
              ["/help", "Help centre"],
              ["/faq", "FAQ"],
              ["/contact", "Contact"],
              ["/safety", "Safety"],
              ["/privacy", "Privacy"],
              ["/terms", "Terms"],
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-secondary hover:text-nexus-700">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-secondary dark:border-slate-800">
        © {new Date().getFullYear()} Nexus — National Digital Matchmaking Hub
      </div>
    </footer>
  );
}

export function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-secondary">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, idx) => (
          <li key={item.href || item.label} className="inline-flex items-center gap-1">
            {idx > 0 ? <span>/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-nexus-700">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-800 dark:text-slate-200">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CommandPalette({ open, onClose }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const opportunities = useAppStore((s) => s.opportunities);
  const helpArticles = useAppStore((s) => s.helpArticles);
  const user = useCurrentUser();

  const results = useMemo(() => {
    const query = q.toLowerCase().trim();
    const pages = [
      ...(NAV_BY_ROLE[user?.role] || []).map((n) => ({ type: "Page", label: n.label, href: n.href })),
      { type: "Page", label: "Opportunities", href: "/opportunities" },
      { type: "Page", label: "Help", href: "/help" },
      { type: "Action", label: "Post opportunity", href: "/organization/opportunities/new" },
      { type: "Action", label: "Create ticket", href: user ? `/${user.role === "university-admin" ? "university-admin" : user.role}/support` : "/contact" },
    ];
    const opps = opportunities.slice(0, 40).map((o) => ({ type: "Opportunity", label: o.title, href: `/opportunities/${o.slug}` }));
    const articles = (helpArticles || []).map((a) => ({ type: "Help", label: a.title, href: `/help/articles/${a.slug}` }));
    return [...pages, ...opps, ...articles]
      .filter((r) => !query || r.label.toLowerCase().includes(query))
      .slice(0, 12);
  }, [q, opportunities, helpArticles, user]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 p-4 pt-[12vh]">
      <button type="button" className="absolute inset-0" aria-label="Close command palette" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-[#d5e3df] bg-cream shadow-2xl dark:border-nexus-700 dark:bg-nexus-900">
        <div className="border-b border-slate-200 p-3 dark:border-slate-700">
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages, opportunities, help..."
            aria-label="Command search"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.map((r) => (
            <li key={`${r.type}-${r.href}-${r.label}`}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-ocean hover:text-white dark:hover:bg-sky dark:hover:text-nexus-950"
                onClick={() => {
                  onClose();
                  router.push(r.href);
                }}
              >
                <span>{r.label}</span>
                <Badge tone="slate">{r.type}</Badge>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RoleSidebar({ role, collapsed, onNavigate }) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE[role] || [];
  return (
    <nav aria-label="Portal" className="space-y-1 p-3">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-ocean font-semibold text-white dark:bg-ocean dark:text-white"
                : "text-nexus-800 hover:bg-ocean hover:text-white dark:text-nexus-200 dark:hover:bg-sky dark:hover:text-nexus-950",
              collapsed && "justify-center px-2"
            )}
            title={item.label}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

const ROLE_LABELS = {
  student: "Student",
  faculty: "Faculty",
  researcher: "Researcher",
  organization: "Organization",
  "university-admin": "University admin",
  ugc: "UGC officer",
  helpdesk: "Helpdesk",
};

function profilePath(role) {
  if (role === "faculty") return "/faculty/profile";
  if (role === "researcher") return "/researcher/profile";
  if (role === "organization") return "/organization/profile";
  if (role === "university-admin") return "/university-admin/institution-profile";
  return `/${role === "university-admin" ? "university-admin" : role}/settings`;
}

function profileMeta(user, university, organization) {
  if (user.role === "student") {
    return [university?.shortName, user.department, user.studentId].filter(Boolean).join(" · ");
  }
  if (user.role === "organization") {
    return [user.designation, organization?.name || organization?.shortName].filter(Boolean).join(" · ");
  }
  return [user.designation, university?.shortName, user.department].filter(Boolean).join(" · ");
}

export function PortalShell({ role, children, title }) {
  const user = useCurrentUser();
  const hydrated = useHydrated();
  const router = useRouter();
  const logout = useAppStore((s) => s.logout);
  const universities = useAppStore((s) => s.universities);
  const organizations = useAppStore((s) => s.organizations);
  const notifications = useAppStore((s) => s.notifications);
  const setUiPreferences = useAppStore((s) => s.setUiPreferences);
  const collapsed = useAppStore((s) => s.uiPreferences.sidebarCollapsed);
  const { language } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      router.replace(ROLE_DASHBOARDS[user.role] || "/login");
    }
  }, [hydrated, user, role, router]);

  const unread = notifications.filter((n) => !n.read && (!user || n.userId === user.id || !n.userId)).length;
  const university = user ? universities.find((u) => u.id === user.universityId) : null;
  const organization = user ? organizations.find((o) => o.id === user.organizationId) : null;
  const userMeta = user ? profileMeta(user, university, organization) : "";

  if (!hydrated || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-nexus-600 border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-nexus-950">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 border-r border-[#d5e3df] bg-chrome lg:flex lg:flex-col dark:border-nexus-800 dark:bg-nexus-900",
            collapsed ? "w-[72px]" : "w-64"
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-[#d5e3df] px-3 dark:border-nexus-800">
            {!collapsed ? <NexusLogo /> : <Link href="/" className="mx-auto inline-flex" aria-label="Nexus home"><NexusMark size={32} /></Link>}
          </div>
          <div className="flex-1 overflow-y-auto">
            <RoleSidebar role={role} collapsed={collapsed} />
          </div>
          <div className="border-t border-[#d5e3df] p-2 dark:border-nexus-800">
            <IconButton
              label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setUiPreferences({ sidebarCollapsed: !collapsed })}
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </IconButton>
          </div>
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" className="absolute inset-0 bg-slate-950/50" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
            <div className="absolute top-0 left-0 h-full w-72 bg-chrome shadow-xl dark:bg-nexus-900">
              <div className="flex h-14 items-center justify-between border-b border-[#d5e3df] px-3 dark:border-nexus-800">
                <NexusLogo />
                <IconButton label="Close" onClick={() => setMobileOpen(false)}>
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
              <RoleSidebar role={role} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[#d5e3df] bg-chrome/95 px-4 backdrop-blur dark:border-nexus-800 dark:bg-nexus-900/95">
            <div className="flex items-center gap-2">
              <IconButton label="Open navigation" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </IconButton>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{title || "Portal"}</p>
                  <Badge tone="teal">{user.role}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="secondary" onClick={() => setPaletteOpen(true)} className="hidden sm:inline-flex">
                <Search className="h-4 w-4" />
                <span className="text-xs text-white/90">Ctrl/Cmd+K</span>
              </Button>
              <Link href={`/${role === "university-admin" ? "university-admin" : role}/messages`}>
                <IconButton label={t("nav.messages", language)}>
                  <MessageSquare className="h-4 w-4" />
                </IconButton>
              </Link>
              <Link href={`/${role === "university-admin" ? "university-admin" : role}/notifications`}>
                <IconButton label={t("nav.notifications", language)}>
                  <span className="relative">
                    <Bell className="h-4 w-4" />
                    {unread > 0 ? <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-danger" /> : null}
                  </span>
                </IconButton>
              </Link>
              <ThemeToggle />
              <DropdownMenu
                className="min-w-72"
                trigger={
                  <button type="button" className="inline-flex items-center gap-2 rounded-full border border-slate-200 py-1 pr-2 pl-1 text-sm dark:border-slate-700">
                    <Avatar name={user.name} src={user.avatar} size="sm" />
                    <span className="hidden max-w-[120px] truncate md:inline">{user.name}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                }
                items={[
                  {
                    header: true,
                    content: (
                      <div className="flex items-start gap-3">
                        <Avatar name={user.name} src={user.avatar} size="md" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-nexus-900 dark:text-cream">{user.name}</p>
                          <p className="truncate text-xs text-secondary">{user.email}</p>
                          <p className="mt-1 text-xs font-medium text-nexus-700 dark:text-nexus-300">
                            {ROLE_LABELS[user.role] || user.role}
                          </p>
                          {userMeta ? <p className="mt-0.5 truncate text-[11px] text-secondary">{userMeta}</p> : null}
                        </div>
                      </div>
                    ),
                  },
                  { divider: true },
                  {
                    label: "View profile",
                    icon: <UserRound className="h-4 w-4" />,
                    onClick: () => router.push(profilePath(role)),
                  },
                  {
                    label: t("nav.settings", language),
                    icon: <Settings className="h-4 w-4" />,
                    onClick: () => router.push(`/${role === "university-admin" ? "university-admin" : role}/settings`),
                  },
                  {
                    label: t("nav.help", language),
                    icon: <CircleHelp className="h-4 w-4" />,
                    onClick: () => router.push("/help"),
                  },
                  { divider: true },
                  {
                    label: t("nav.logout", language),
                    icon: <LogOut className="h-4 w-4" />,
                    danger: true,
                    onClick: () => {
                      logout();
                      router.push("/login");
                    },
                  },
                ]}
              />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
