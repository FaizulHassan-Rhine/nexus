import { useAppStore } from "@/store/useAppStore";
import { scoreStudentOpportunity, scoreFacultyOpportunity, scoreResearcherOpportunity } from "@/lib/matchEngine";

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms + Math.floor(Math.random() * 200)));

function store() {
  return useAppStore.getState();
}

export const authService = {
  async login(email, password) {
    await delay();
    return store().login(email, password);
  },
  async logout() {
    await delay(200);
    store().logout();
    return { ok: true };
  },
  async register(payload) {
    await delay();
    return store().registerUser(payload);
  },
  async switchRole(email) {
    await delay(250);
    return store().switchDemoRole(email);
  },
};

export const opportunityService = {
  async search(filters = {}) {
    await delay();
    let items = [...store().opportunities];
    if (filters.q) {
      const q = filters.q.toLowerCase();
      items = items.filter(
        (o) =>
          o.title?.toLowerCase().includes(q) ||
          o.description?.toLowerCase().includes(q) ||
          o.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filters.type) items = items.filter((o) => o.type === filters.type);
    if (filters.division) items = items.filter((o) => o.division === filters.division);
    if (filters.workMode) items = items.filter((o) => o.workMode === filters.workMode);
    if (filters.verifiedOnly) items = items.filter((o) => o.verificationStatus === "Verified");
    if (filters.ugcOnly) items = items.filter((o) => o.ugcProgrammeId || String(o.fundingModel || "").includes("UGC"));
    if (filters.department) items = items.filter((o) => o.departments?.includes(filters.department));
    return { items, total: items.length };
  },
  async getBySlug(slug) {
    await delay(250);
    return store().opportunities.find((o) => o.slug === slug) || null;
  },
  async create(payload) {
    await delay();
    return store().createOpportunity(payload);
  },
  async publish(id) {
    await delay();
    store().publishOpportunity(id);
    return { ok: true };
  },
};

export const applicationService = {
  async submit(payload) {
    await delay(500);
    return store().submitApplication(payload);
  },
  async updateStatus(id, status, note) {
    await delay();
    store().updateApplicationStatus(id, status, note);
    return { ok: true };
  },
  async withdraw(id) {
    await delay();
    store().withdrawApplication(id);
    return { ok: true };
  },
};

export const matchService = {
  async calculate(candidateId, opportunityId) {
    await delay(300);
    const candidate = store().users.find((u) => u.id === candidateId);
    const opportunity = store().opportunities.find((o) => o.id === opportunityId);
    if (!candidate || !opportunity) return null;
    if (candidate.role === "faculty") return scoreFacultyOpportunity(candidate, opportunity);
    if (candidate.role === "researcher") return scoreResearcherOpportunity(candidate, opportunity);
    return scoreStudentOpportunity(candidate, opportunity);
  },
  async forUser(userId) {
    await delay();
    return store()
      .matches.filter((m) => m.candidateId === userId)
      .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
  },
  async approve(matchId, note) {
    await delay();
    store().approveMatch(matchId, note);
    return { ok: true };
  },
  async reject(matchId, note) {
    await delay();
    store().rejectMatch(matchId, note);
    return { ok: true };
  },
};

export const fundingService = {
  async submit(payload) {
    await delay(500);
    return store().submitFundingRequest(payload);
  },
  async review(id, status, updates) {
    await delay();
    store().reviewFundingRequest(id, status, updates);
    return { ok: true };
  },
  async recordPayment(payload) {
    await delay();
    return store().recordPaymentMilestone(payload);
  },
};

export const supportService = {
  async createTicket(payload) {
    await delay();
    return store().createTicket(payload);
  },
  async reply(ticketId, body, internal) {
    await delay(250);
    store().replyToTicket(ticketId, body, internal);
    return { ok: true };
  },
  async resolve(ticketId, resolution) {
    await delay();
    store().resolveTicket(ticketId, resolution);
    return { ok: true };
  },
  async escalate(ticketId, to) {
    await delay();
    store().escalateTicket(ticketId, to);
    return { ok: true };
  },
};

export const disputeService = {
  async create(payload) {
    await delay();
    return store().createDispute(payload);
  },
  async resolve(id, resolution) {
    await delay();
    store().resolveDispute(id, resolution);
    return { ok: true };
  },
  async update(id, updates) {
    await delay();
    store().updateDispute(id, updates);
    return { ok: true };
  },
};

export const courseService = {
  async enroll(courseId) {
    await delay();
    store().enrollInCourse(courseId);
    return { ok: true };
  },
  async complete(courseId) {
    await delay(500);
    store().completeCourse(courseId);
    return { ok: true };
  },
};

export const messagingService = {
  async send(conversationId, body) {
    await delay(200);
    store().sendMessage(conversationId, body);
    return { ok: true };
  },
};

export const technologyService = {
  async create(payload) {
    await delay(500);
    return store().createTechnology(payload);
  },
  async update(id, updates) {
    await delay();
    store().updateTechnology(id, updates);
    return { ok: true };
  },
};

export const projectService = {
  async create(payload) {
    await delay();
    return store().createProject(payload);
  },
  async join(projectId, userId, role = "Collaborator") {
    await delay();
    const { projects } = store();
    const project = projects.find((p) => p.id === projectId);
    if (!project) return { ok: false };
    if ((project.teamMembers || []).includes(userId)) return { ok: true };
    useAppStore.setState({
      projects: projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              teamMembers: [...(p.teamMembers || []), userId],
              team: [...(p.team || []), { userId, role }],
            }
          : p
      ),
    });
    return { ok: true };
  },
};
