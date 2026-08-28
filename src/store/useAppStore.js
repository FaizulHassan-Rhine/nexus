"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getInitialSeedState } from "./seedState";
import { STORE_KEY, STORE_VERSION, DEMO_PASSWORD, ROLE_DASHBOARDS } from "@/lib/constants";
import { scoreStudentOpportunity, scoreFacultyOpportunity, scoreResearcherOpportunity } from "@/lib/matchEngine";
import { slugify } from "@/lib/formatters";

function now() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function withAudit(get, set, event) {
  const entry = {
    id: id("audit"),
    timestamp: now(),
    ...event,
  };
  set({ audit: [entry, ...(get().audit || [])] });
  return entry;
}

function notify(get, set, notification) {
  const entry = {
    id: id("notif"),
    createdAt: now(),
    read: false,
    ...notification,
  };
  set({ notifications: [entry, ...(get().notifications || [])] });
  return entry;
}

function mergeSeedById(existing = [], seedRecords = [], key = "id") {
  const map = new Map(existing.map((record) => [record[key], record]));
  seedRecords.forEach((record) => {
    if (!map.has(record[key])) map.set(record[key], record);
  });
  return Array.from(map.values());
}

function findSeedUserByEmail(email) {
  const normalized = String(email).toLowerCase();
  return seed.users.find((u) => u.email.toLowerCase() === normalized) || null;
}

const seed = getInitialSeedState();

export const useAppStore = create(
  persist(
    (set, get) => ({
      version: STORE_VERSION,
      hydrated: false,
      currentUserId: null,
      users: seed.users,
      universities: seed.universities,
      organizations: seed.organizations,
      opportunities: seed.opportunities,
      applications: seed.applications,
      matches: seed.matches,
      courses: seed.courses,
      scholarships: seed.scholarships,
      projects: seed.projects,
      technologies: seed.technologies,
      funding: seed.funding?.requests || seed.fundingRequests || [],
      payments: seed.funding?.payments || seed.paymentRecords || [],
      conversations: seed.messages || seed.conversations || [],
      tickets: seed.tickets,
      disputes: seed.disputes,
      notifications: seed.notifications,
      audit: seed.audit || seed.auditEvents || [],
      helpArticles: seed.helpArticles || [],
      policies: seed.policies || [],
      reviewAssignments: {},
      riskActions: {},
      erpIntegration: seed.erpIntegration || {
        connected: true,
        systemName: "BUET Mock ERP (simulated)",
        lastSync: "2026-08-27T06:00:00+06:00",
        syncStatus: "idle",
        mappings: [
          { nexusField: "studentId", erpField: "REG_NO", status: "mapped" },
          { nexusField: "programme", erpField: "PROG_CODE", status: "mapped" },
          { nexusField: "department", erpField: "DEPT_ID", status: "mapped" },
          { nexusField: "cgpa", erpField: "GPA_CUR", status: "mapped" },
          { nexusField: "facultyId", erpField: "EMP_ID", status: "mapped" },
        ],
        lastError: null,
        recordsSynced: 1247,
      },
      programmes: seed.programmes || [
        {
          id: "prog-001",
          name: "50/50 Internship Co-Funding",
          status: "Active",
          budget: 50000000,
          used: 12500000,
        },
        {
          id: "prog-002",
          name: "Graduate Apprenticeship Support",
          status: "Active",
          budget: 20000000,
          used: 4200000,
        },
        {
          id: "prog-003",
          name: "Women in Technology Internship Support",
          status: "Active",
          budget: 15000000,
          used: 3100000,
        },
        {
          id: "prog-004",
          name: "Regional Talent Mobility Grant",
          status: "Active",
          budget: 10000000,
          used: 1800000,
        },
        {
          id: "prog-005",
          name: "Student Innovation Matching Grant",
          status: "Active",
          budget: 12000000,
          used: 2500000,
        },
        {
          id: "prog-006",
          name: "Certification and Employability Voucher",
          status: "Active",
          budget: 8000000,
          used: 1900000,
        },
        {
          id: "prog-007",
          name: "Faculty–Industry Research Grant",
          status: "Active",
          budget: 25000000,
          used: 6700000,
        },
      ],
      savedOpportunityIds: seed.ui?.savedOpportunityIds || [],
      compareOpportunityIds: [],
      journeyStage: "final-year",
      uiPreferences: {
        theme: "system",
        language: "en",
        sidebarCollapsed: false,
        ...(seed.uiPreferences || {}),
      },

      setHydrated: (value) => set({ hydrated: value }),

      getCurrentUser: () => {
        const { currentUserId, users } = get();
        return users.find((u) => u.id === currentUserId) || null;
      },

      login: (email, password) => {
        if (password !== DEMO_PASSWORD) {
          return { ok: false, error: "Invalid email or password" };
        }

        const normalized = String(email).toLowerCase();
        let user = get().users.find((u) => u.email.toLowerCase() === normalized);
        if (!user) {
          const seedUser = findSeedUserByEmail(normalized);
          if (seedUser) {
            const users = [...get().users, seedUser];
            set({ users });
            user = seedUser;
          }
        }

        if (!user) {
          return { ok: false, error: "Invalid email or password" };
        }

        if (!ROLE_DASHBOARDS[user.role]) {
          return { ok: false, error: "This role is not available yet" };
        }

        set({ currentUserId: user.id });
        withAudit(get, set, {
          actorId: user.id,
          action: "login",
          entityType: "user",
          entityId: user.id,
          details: "User signed in",
        });
        return { ok: true, user, redirect: ROLE_DASHBOARDS[user.role] };
      },

      logout: () => {
        const user = get().getCurrentUser();
        if (user) {
          withAudit(get, set, {
            actorId: user.id,
            action: "logout",
            entityType: "user",
            entityId: user.id,
            details: "User signed out",
          });
        }
        set({ currentUserId: null });
      },

      switchDemoRole: (email) => {
        let user = get().users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
        if (!user) {
          const seedUser = findSeedUserByEmail(email);
          if (seedUser) {
            const users = [...get().users, seedUser];
            set({ users });
            user = seedUser;
          }
        }
        if (!user || !ROLE_DASHBOARDS[user.role]) return { ok: false };
        set({ currentUserId: user.id });
        return { ok: true, user, redirect: ROLE_DASHBOARDS[user.role] };
      },

      registerUser: (payload) => {
        const exists = get().users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase());
        if (exists) return { ok: false, error: "An account with this email already exists" };
        const user = {
          id: id(`user-${payload.role}`),
          verificationStatus: payload.role === "student" || payload.role === "faculty" || payload.role === "researcher" ? "Pending" : "Pending",
          profileCompletion: 35,
          language: "en",
          lastActiveAt: now(),
          notificationPreferences: { email: true, inApp: true },
          privacyPreferences: { shareWithOrganizations: true },
          password: DEMO_PASSWORD,
          ...payload,
        };
        set({ users: [user, ...get().users], currentUserId: user.id });
        withAudit(get, set, {
          actorId: user.id,
          action: "register",
          entityType: "user",
          entityId: user.id,
          details: `Registered as ${payload.role}`,
        });
        return { ok: true, user };
      },

      completeOnboarding: (userId, updates) => {
        set({
          users: get().users.map((u) =>
            u.id === userId
              ? { ...u, ...updates, profileCompletion: 100, onboardingComplete: true }
              : u
          ),
        });
        withAudit(get, set, {
          actorId: userId,
          action: "complete_onboarding",
          entityType: "user",
          entityId: userId,
          details: "Onboarding completed",
        });
      },

      updateProfile: (userId, updates) => {
        set({
          users: get().users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
        });
      },

      setJourneyStage: (stage) => {
        const user = get().getCurrentUser();
        const yearMap = {
          "first-year": 1,
          "middle-years": 2,
          "final-year": 4,
          alumni: 5,
        };
        set({ journeyStage: stage });
        if (user?.role === "student") {
          get().updateProfile(user.id, {
            currentYear: yearMap[stage] || user.currentYear,
            journeyStage: stage,
          });
          get().recalculateMatchesForUser(user.id);
        }
      },

      toggleSavedOpportunity: (opportunityId) => {
        const saved = get().savedOpportunityIds || [];
        const next = saved.includes(opportunityId)
          ? saved.filter((id) => id !== opportunityId)
          : [...saved, opportunityId];
        set({ savedOpportunityIds: next });
      },

      toggleCompareOpportunity: (opportunityId) => {
        const list = get().compareOpportunityIds || [];
        if (list.includes(opportunityId)) {
          set({ compareOpportunityIds: list.filter((id) => id !== opportunityId) });
          return;
        }
        if (list.length >= 3) return;
        set({ compareOpportunityIds: [...list, opportunityId] });
      },

      submitApplication: (payload) => {
        const user = get().getCurrentUser();
        const application = {
          id: id("app"),
          status: "University review",
          submittedAt: now(),
          updatedAt: now(),
          timeline: [
            { at: now(), status: "Submitted", note: "Application submitted by candidate" },
            { at: now(), status: "University review", note: "Routed to university administrator" },
          ],
          documents: payload.documents || [],
          answers: payload.answers || {},
          applicantId: user?.id,
          ...payload,
        };
        set({ applications: [application, ...get().applications] });
        withAudit(get, set, {
          actorId: user?.id,
          action: "submit_application",
          entityType: "application",
          entityId: application.id,
          details: `Applied to ${payload.opportunityId}`,
        });
        notify(get, set, {
          userId: user?.id,
          category: "applications",
          title: "Application submitted",
          body: "Your application is now under university review.",
          href: `/student/applications/${application.id}`,
        });
        return application;
      },

      updateApplicationStatus: (applicationId, status, note = "", actorRole = "system") => {
        const user = get().getCurrentUser();
        set({
          applications: get().applications.map((app) => {
            if (app.id !== applicationId) return app;
            return {
              ...app,
              status,
              updatedAt: now(),
              timeline: [
                ...(app.timeline || []),
                { at: now(), status, note, actorRole },
              ],
            };
          }),
        });
        withAudit(get, set, {
          actorId: user?.id,
          action: "update_application_status",
          entityType: "application",
          entityId: applicationId,
          details: `Status → ${status}`,
          previousStatus: undefined,
          newStatus: status,
        });
        const app = get().applications.find((a) => a.id === applicationId);
        if (app?.applicantId) {
          notify(get, set, {
            userId: app.applicantId,
            category: "applications",
            title: `Application ${status}`,
            body: note || `Your application status is now ${status}.`,
            href: `/student/applications/${applicationId}`,
          });
        }
      },

      withdrawApplication: (applicationId) => {
        get().updateApplicationStatus(applicationId, "Withdrawn", "Withdrawn by applicant", "student");
      },

      approveMatch: (matchId, note = "Approved by university") => {
        const user = get().getCurrentUser();
        set({
          matches: get().matches.map((m) =>
            m.id === matchId
              ? { ...m, universityReviewStatus: "Approved", updatedAt: now(), reviewNote: note }
              : m
          ),
        });
        withAudit(get, set, {
          actorId: user?.id,
          action: "approve_match",
          entityType: "match",
          entityId: matchId,
          details: note,
        });
      },

      rejectMatch: (matchId, note = "Rejected") => {
        const user = get().getCurrentUser();
        set({
          matches: get().matches.map((m) =>
            m.id === matchId
              ? { ...m, universityReviewStatus: "Rejected", updatedAt: now(), reviewNote: note }
              : m
          ),
        });
        withAudit(get, set, {
          actorId: user?.id,
          action: "reject_match",
          entityType: "match",
          entityId: matchId,
          details: note,
        });
      },

      requestChanges: (entityType, entityId, note) => {
        const user = get().getCurrentUser();
        if (entityType === "application") {
          get().updateApplicationStatus(entityId, "Changes requested", note, user?.role);
        } else if (entityType === "match") {
          set({
            matches: get().matches.map((m) =>
              m.id === entityId
                ? { ...m, universityReviewStatus: "Changes requested", reviewNote: note }
                : m
            ),
          });
        }
        withAudit(get, set, {
          actorId: user?.id,
          action: "request_changes",
          entityType,
          entityId,
          details: note,
        });
      },

      setMatchInterest: (matchId, interest) => {
        set({
          matches: get().matches.map((m) =>
            m.id === matchId ? { ...m, studentInterestStatus: interest } : m
          ),
        });
      },

      createOpportunity: (payload) => {
        const user = get().getCurrentUser();
        const opportunity = {
          id: id("opp"),
          slug: slugify(payload.title) + "-" + Date.now().toString(36).slice(-4),
          status: payload.status || "Draft",
          verificationStatus: "Pending",
          createdAt: now(),
          ownerUserId: user?.id,
          organizationId: user?.organizationId,
          metrics: { views: 0, applications: 0, saves: 0 },
          ...payload,
        };
        set({ opportunities: [opportunity, ...get().opportunities] });
        withAudit(get, set, {
          actorId: user?.id,
          action: "create_opportunity",
          entityType: "opportunity",
          entityId: opportunity.id,
          details: opportunity.title,
        });
        return opportunity;
      },

      editOpportunity: (opportunityId, updates) => {
        set({
          opportunities: get().opportunities.map((o) =>
            o.id === opportunityId ? { ...o, ...updates, updatedAt: now() } : o
          ),
        });
      },

      publishOpportunity: (opportunityId) => {
        get().editOpportunity(opportunityId, { status: "Published", publishedAt: now() });
      },

      closeOpportunity: (opportunityId) => {
        get().editOpportunity(opportunityId, { status: "Closed" });
      },

      enrollInCourse: (courseId) => {
        const user = get().getCurrentUser();
        if (!user) return;
        const enrollment = {
          courseId,
          enrolledAt: now(),
          progress: 0,
          status: "In progress",
        };
        get().updateProfile(user.id, {
          courseEnrollments: [...(user.courseEnrollments || []), enrollment],
        });
      },

      completeCourse: (courseId) => {
        const user = get().getCurrentUser();
        if (!user) return;
        const course = get().courses.find((c) => c.id === courseId);
        const enrollments = (user.courseEnrollments || []).map((e) =>
          e.courseId === courseId ? { ...e, progress: 100, status: "Completed", completedAt: now() } : e
        );
        const skills = Array.from(new Set([...(user.skills || []), ...(course?.skills || course?.skillsTaught || [])]));
        const certifications = [
          ...(user.certifications || []),
          {
            name: `${course?.title || "Course"} Certificate`,
            issuer: course?.provider || "Nexus",
            issuedAt: now(),
          },
        ];
        get().updateProfile(user.id, { courseEnrollments: enrollments, skills, certifications });
        get().recalculateMatchesForUser(user.id);
        withAudit(get, set, {
          actorId: user.id,
          action: "complete_course",
          entityType: "course",
          entityId: courseId,
          details: `Completed ${course?.title}`,
        });
      },

      recalculateMatchesForUser: (userId) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) return;
        const scorer =
          user.role === "faculty"
            ? scoreFacultyOpportunity
            : user.role === "researcher"
              ? scoreResearcherOpportunity
              : scoreStudentOpportunity;
        const relevant = get().opportunities.filter((o) => o.status === "Published" || o.status === "Open" || !o.status || o.status === "Active");
        const existing = get().matches.filter((m) => m.candidateId !== userId);
        const generated = relevant.slice(0, 25).map((opportunity) => {
          const score = scorer(user, opportunity);
          const prior = get().matches.find((m) => m.candidateId === userId && m.opportunityId === opportunity.id);
          return {
            id: prior?.id || id("match"),
            candidateId: userId,
            candidateRole: user.role,
            opportunityId: opportunity.id,
            overallScore: score.total,
            scoreBreakdown: score.breakdown,
            reasons: score.reasons,
            missingRequirements: score.gaps,
            suggestedCourses: score.recommendedActions,
            fairnessNotes: "Sensitive attributes are not used in scoring.",
            algorithmVersion: score.algorithmVersion,
            createdAt: prior?.createdAt || now(),
            studentInterestStatus: prior?.studentInterestStatus || "None",
            universityReviewStatus: prior?.universityReviewStatus || "Pending",
            organizationStatus: prior?.organizationStatus || "Pending",
            finalConfirmationStatus: prior?.finalConfirmationStatus || "Pending",
          };
        });
        set({ matches: [...generated, ...existing] });
      },

      createProject: (payload) => {
        const user = get().getCurrentUser();
        const project = {
          id: id("proj"),
          createdAt: now(),
          status: "Active",
          ownerId: user?.id,
          team: [{ userId: user?.id, role: "Lead" }],
          milestones: payload.milestones || [],
          ...payload,
        };
        set({ projects: [project, ...get().projects] });
        return project;
      },

      submitFundingRequest: (payload) => {
        const user = get().getCurrentUser();
        const request = {
          id: id("fund"),
          status: "University verification",
          createdAt: now(),
          studentId: user?.role === "student" ? user.id : payload.studentId,
          organizationId: user?.organizationId || payload.organizationId,
          universityId: user?.universityId || payload.universityId,
          timeline: [{ at: now(), status: "Submitted", note: "Funding request submitted" }],
          ...payload,
        };
        set({ funding: [request, ...get().funding] });
        withAudit(get, set, {
          actorId: user?.id,
          action: "submit_funding",
          entityType: "funding",
          entityId: request.id,
          details: `Requested ${payload.requestedAmount || payload.totalStipend}`,
        });
        return request;
      },

      reviewFundingRequest: (fundingId, status, updates = {}) => {
        const user = get().getCurrentUser();
        set({
          funding: get().funding.map((f) =>
            f.id === fundingId
              ? {
                  ...f,
                  status,
                  ...updates,
                  timeline: [...(f.timeline || []), { at: now(), status, note: updates.note || status }],
                }
              : f
          ),
        });
        withAudit(get, set, {
          actorId: user?.id,
          action: "review_funding",
          entityType: "funding",
          entityId: fundingId,
          details: status,
        });
      },

      recordPaymentMilestone: (payload) => {
        const user = get().getCurrentUser();
        const payment = {
          id: id("pay"),
          createdAt: now(),
          status: payload.status || "Paid",
          recordedBy: user?.id,
          ...payload,
        };
        set({ payments: [payment, ...get().payments] });
        withAudit(get, set, {
          actorId: user?.id,
          action: "record_payment",
          entityType: "payment",
          entityId: payment.id,
          details: `${payment.amount} ${payment.currency || "BDT"}`,
        });
        return payment;
      },

      sendMessage: (conversationId, body) => {
        const user = get().getCurrentUser();
        set({
          conversations: get().conversations.map((c) => {
            if (c.id !== conversationId) return c;
            return {
              ...c,
              updatedAt: now(),
              messages: [
                ...(c.messages || []),
                { id: id("msg"), senderId: user?.id, body, at: now() },
              ],
            };
          }),
        });
      },

      createConversation: (participantIds, subject) => {
        const conversation = {
          id: id("conv"),
          subject,
          participantIds,
          createdAt: now(),
          updatedAt: now(),
          messages: [],
        };
        set({ conversations: [conversation, ...get().conversations] });
        return conversation;
      },

      markNotificationRead: (notificationId) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === notificationId || notificationId === "all" ? { ...n, read: true } : n
          ),
        });
      },

      createTicket: (payload) => {
        const user = get().getCurrentUser();
        const ticket = {
          id: id("ticket"),
          status: "Open",
          priority: payload.priority || "Medium",
          createdAt: now(),
          slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          requesterId: user?.id,
          conversation: [{ at: now(), by: user?.id, body: payload.description, type: "public" }],
          ...payload,
        };
        set({ tickets: [ticket, ...get().tickets] });
        withAudit(get, set, {
          actorId: user?.id,
          action: "create_ticket",
          entityType: "ticket",
          entityId: ticket.id,
          details: ticket.subject,
        });
        return ticket;
      },

      replyToTicket: (ticketId, body, internal = false) => {
        const user = get().getCurrentUser();
        set({
          tickets: get().tickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  updatedAt: now(),
                  conversation: [
                    ...(t.conversation || []),
                    { at: now(), by: user?.id, body, type: internal ? "internal" : "public" },
                  ],
                }
              : t
          ),
        });
      },

      escalateTicket: (ticketId, to = "university") => {
        get().updateTicket(ticketId, { status: "Escalated", escalatedTo: to });
      },

      updateTicket: (ticketId, updates) => {
        set({
          tickets: get().tickets.map((t) => (t.id === ticketId ? { ...t, ...updates, updatedAt: now() } : t)),
        });
      },

      resolveTicket: (ticketId, resolution) => {
        const user = get().getCurrentUser();
        get().updateTicket(ticketId, {
          status: "Resolved",
          resolution,
          resolvedAt: now(),
          resolvedBy: user?.id,
        });
      },

      createDispute: (payload) => {
        const user = get().getCurrentUser();
        const dispute = {
          id: id("dispute"),
          status: "Intake",
          createdAt: now(),
          raisedBy: user?.id,
          timeline: [{ at: now(), status: "Intake", note: "Dispute filed" }],
          ...payload,
        };
        set({ disputes: [dispute, ...get().disputes] });
        withAudit(get, set, {
          actorId: user?.id,
          action: "create_dispute",
          entityType: "dispute",
          entityId: dispute.id,
          details: dispute.issueType,
        });
        return dispute;
      },

      resolveDispute: (disputeId, resolution) => {
        const user = get().getCurrentUser();
        set({
          disputes: get().disputes.map((d) =>
            d.id === disputeId
              ? {
                  ...d,
                  status: "Resolved",
                  resolution,
                  resolvedAt: now(),
                  timeline: [...(d.timeline || []), { at: now(), status: "Resolved", note: resolution.summary }],
                }
              : d
          ),
        });
        withAudit(get, set, {
          actorId: user?.id,
          action: "resolve_dispute",
          entityType: "dispute",
          entityId: disputeId,
          details: resolution.summary,
        });
      },

      updateDispute: (disputeId, updates) => {
        set({
          disputes: get().disputes.map((d) =>
            d.id === disputeId
              ? {
                  ...d,
                  ...updates,
                  timeline: updates.status
                    ? [...(d.timeline || []), { at: now(), status: updates.status, note: updates.note || updates.status }]
                    : d.timeline,
                }
              : d
          ),
        });
      },

      createTechnology: (payload) => {
        const user = get().getCurrentUser();
        const tech = {
          id: id("tech"),
          createdAt: now(),
          status: "University review",
          ownerUserId: user?.id,
          universityId: user?.universityId,
          ...payload,
        };
        set({ technologies: [tech, ...get().technologies] });
        return tech;
      },

      updateTechnology: (techId, updates) => {
        set({
          technologies: get().technologies.map((t) => (t.id === techId ? { ...t, ...updates } : t)),
        });
      },

      setUiPreferences: (updates) => {
        set({ uiPreferences: { ...get().uiPreferences, ...updates } });
      },

      addAuditEvent: (event) => withAudit(get, set, event),

      assignReviewItem: (itemKey, updates) => {
        const user = get().getCurrentUser();
        set({
          reviewAssignments: {
            ...get().reviewAssignments,
            [itemKey]: { ...get().reviewAssignments[itemKey], ...updates, updatedAt: now(), updatedBy: user?.id },
          },
        });
        withAudit(get, set, {
          actorId: user?.id,
          action: "assign_review",
          entityType: "review",
          entityId: itemKey,
          details: `Priority ${updates.priority || "—"} · ${updates.assignedTo || "unassigned"}`,
        });
      },

      verifyUserProfile: (userId, status, note = "") => {
        const user = get().getCurrentUser();
        set({
          users: get().users.map((u) =>
            u.id === userId ? { ...u, verificationStatus: status, verificationNote: note, verifiedAt: now() } : u
          ),
        });
        withAudit(get, set, {
          actorId: user?.id,
          action: "verify_profile",
          entityType: "user",
          entityId: userId,
          details: `${status}${note ? `: ${note}` : ""}`,
        });
      },

      updateOrganization: (orgId, updates) => {
        const user = get().getCurrentUser();
        set({
          organizations: get().organizations.map((o) => (o.id === orgId ? { ...o, ...updates, updatedAt: now() } : o)),
        });
        withAudit(get, set, {
          actorId: user?.id,
          action: "update_organization",
          entityType: "organization",
          entityId: orgId,
          details: updates.nexusStatus || updates.verificationStatus || "Updated",
        });
      },

      updateUniversity: (uniId, updates) => {
        const user = get().getCurrentUser();
        set({
          universities: get().universities.map((u) => (u.id === uniId ? { ...u, ...updates } : u)),
        });
        withAudit(get, set, {
          actorId: user?.id,
          action: "update_university",
          entityType: "university",
          entityId: uniId,
          details: updates.nexusStatus || "Updated",
        });
      },

      updateProgramme: (programmeId, updates) => {
        const user = get().getCurrentUser();
        set({
          programmes: get().programmes.map((p) => (p.id === programmeId ? { ...p, ...updates, updatedAt: now() } : p)),
        });
        withAudit(get, set, {
          actorId: user?.id,
          action: "update_programme",
          entityType: "programme",
          entityId: programmeId,
          details: updates.status || updates.name || "Updated",
        });
      },

      createProgramme: (payload) => {
        const user = get().getCurrentUser();
        const programme = {
          id: id("prog"),
          status: "Draft",
          budget: 0,
          used: 0,
          createdAt: now(),
          ...payload,
        };
        set({ programmes: [programme, ...get().programmes] });
        withAudit(get, set, {
          actorId: user?.id,
          action: "create_programme",
          entityType: "programme",
          entityId: programme.id,
          details: programme.name,
        });
        return programme;
      },

      updatePolicy: (policyId, updates) => {
        const user = get().getCurrentUser();
        set({
          policies: get().policies.map((p) => (p.id === policyId ? { ...p, ...updates, updatedAt: now() } : p)),
        });
        withAudit(get, set, {
          actorId: user?.id,
          action: "update_policy",
          entityType: "policy",
          entityId: policyId,
          details: updates.status || "Updated",
        });
      },

      createPolicy: (payload) => {
        const user = get().getCurrentUser();
        const policy = { id: id("policy"), status: "Draft", version: "0.1", createdAt: now(), authorId: user?.id, ...payload };
        set({ policies: [policy, ...get().policies] });
        withAudit(get, set, {
          actorId: user?.id,
          action: "create_policy",
          entityType: "policy",
          entityId: policy.id,
          details: policy.title,
        });
        return policy;
      },

      updateHelpArticle: (articleId, updates) => {
        set({
          helpArticles: get().helpArticles.map((a) => (a.id === articleId ? { ...a, ...updates, updatedAt: now() } : a)),
        });
      },

      createHelpArticle: (payload) => {
        const article = {
          id: id("article"),
          slug: slugify(payload.title) + "-" + Date.now().toString(36).slice(-4),
          createdAt: now(),
          popular: false,
          ...payload,
        };
        set({ helpArticles: [article, ...get().helpArticles] });
        return article;
      },

      setRiskAction: (alertId, action, note = "") => {
        const user = get().getCurrentUser();
        set({
          riskActions: {
            ...get().riskActions,
            [alertId]: { action, note, at: now(), by: user?.id },
          },
        });
        withAudit(get, set, {
          actorId: user?.id,
          action: `risk_${action}`,
          entityType: "risk_alert",
          entityId: alertId,
          details: note || action,
        });
      },

      runErpSync: (simulateError = false) => {
        const user = get().getCurrentUser();
        if (simulateError) {
          set({
            erpIntegration: {
              ...get().erpIntegration,
              syncStatus: "error",
              lastError: "Simulated ERP timeout — no real system connected",
              lastSyncAttempt: now(),
            },
          });
          withAudit(get, set, {
            actorId: user?.id,
            action: "erp_sync_error",
            entityType: "erp",
            entityId: "mock-erp",
            details: "Simulated error",
          });
          return { ok: false, error: "Simulated ERP connection failure" };
        }
        set({
          erpIntegration: {
            ...get().erpIntegration,
            syncStatus: "success",
            lastSync: now(),
            lastError: null,
            recordsSynced: (get().erpIntegration.recordsSynced || 0) + Math.floor(Math.random() * 12) + 3,
          },
        });
        withAudit(get, set, {
          actorId: user?.id,
          action: "erp_sync",
          entityType: "erp",
          entityId: "mock-erp",
          details: "Mock sync completed",
        });
        return { ok: true };
      },

      updateErpIntegration: (updates) => {
        set({ erpIntegration: { ...get().erpIntegration, ...updates } });
      },

      resetDemoData: () => {
        const fresh = getInitialSeedState();
        set({
          currentUserId: null,
          users: fresh.users,
          universities: fresh.universities,
          organizations: fresh.organizations,
          opportunities: fresh.opportunities,
          applications: fresh.applications,
          matches: fresh.matches,
          courses: fresh.courses,
          scholarships: fresh.scholarships,
          projects: fresh.projects,
          technologies: fresh.technologies,
          funding: fresh.funding?.requests || [],
          payments: fresh.funding?.payments || [],
          conversations: fresh.conversations || [],
          tickets: fresh.tickets,
          disputes: fresh.disputes,
          notifications: fresh.notifications,
          audit: fresh.audit || [],
          helpArticles: fresh.helpArticles || [],
          policies: fresh.policies || [],
          reviewAssignments: {},
          riskActions: {},
          erpIntegration: fresh.erpIntegration || get().erpIntegration,
          programmes: fresh.programmes || get().programmes,
          savedOpportunityIds: [],
          compareOpportunityIds: [],
          journeyStage: "final-year",
          uiPreferences: {
            theme: get().uiPreferences.theme,
            language: get().uiPreferences.language,
            sidebarCollapsed: false,
          },
        });
      },
    }),
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { hydrated, getCurrentUser, ...rest } = state;
        // strip functions
        return Object.fromEntries(
          Object.entries(rest).filter(([, v]) => typeof v !== "function")
        );
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.(true);
      },
      migrate: (persistedState, version) => {
        if (!persistedState) return persistedState;
        if (version < STORE_VERSION) {
          return {
            ...persistedState,
            version: STORE_VERSION,
            users: mergeSeedById(persistedState.users, seed.users),
            matches: mergeSeedById(persistedState.matches, seed.matches),
          };
        }
        return persistedState;
      },
    }
  )
);
