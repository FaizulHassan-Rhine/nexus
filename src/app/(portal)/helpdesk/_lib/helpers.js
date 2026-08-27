export function ticketStats(tickets) {
  const open = tickets.filter((t) => !["Resolved", "Closed"].includes(t.status));
  const unassigned = open.filter((t) => !t.assignedTo);
  const now = Date.now();
  const slaDue = open.filter((t) => {
    if (!t.slaDeadline) return false;
    const rem = new Date(t.slaDeadline).getTime() - now;
    return rem > 0 && rem < 4 * 3600000;
  });
  const breached = open.filter((t) => t.slaDeadline && new Date(t.slaDeadline).getTime() < now);
  const resolved24h = tickets.filter((t) => {
    if (!t.resolvedAt) return false;
    return new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime() <= 24 * 3600000;
  });
  const resolved = tickets.filter((t) => t.resolvedAt);
  const rate24h = resolved.length ? Math.round((resolved24h.length / resolved.length) * 100) : 0;
  const withRating = tickets.filter((t) => t.satisfactionRating != null);
  const satisfaction = withRating.length
    ? (withRating.reduce((s, t) => s + t.satisfactionRating, 0) / withRating.length).toFixed(1)
    : "—";

  const frtSamples = tickets.filter((t) => t.conversation?.length > 1 || t.replies?.length);
  let frtHours = "—";
  if (frtSamples.length) {
    const total = frtSamples.reduce((sum, t) => {
      const firstReply = t.conversation?.[1] || t.replies?.[0];
      if (!firstReply) return sum;
      const at = firstReply.at || firstReply.sentAt;
      return sum + (new Date(at) - new Date(t.createdAt));
    }, 0);
    frtHours = (total / frtSamples.length / 3600000).toFixed(1);
  }

  const categories = {};
  tickets.forEach((t) => {
    categories[t.category] = (categories[t.category] || 0) + 1;
  });

  return { open: open.length, unassigned: unassigned.length, slaDue: slaDue.length, breached: breached.length, rate24h, frtHours, satisfaction, categories };
}

export function agentWorkload(tickets, users) {
  const agents = users.filter((u) => u.role === "helpdesk");
  return agents.map((a) => ({
    agent: a,
    assigned: tickets.filter((t) => t.assignedTo === a.id && !["Resolved", "Closed"].includes(t.status)).length,
    resolved: tickets.filter((t) => t.resolvedBy === a.id).length,
  }));
}

export function suggestArticles(ticket, articles) {
  if (!ticket) return [];
  const q = `${ticket.subject} ${ticket.category} ${ticket.description}`.toLowerCase();
  return articles
    .filter((a) => {
      const text = `${a.title} ${a.summary} ${a.category}`.toLowerCase();
      return a.topics?.some((t) => q.includes(t.toLowerCase())) || text.split(" ").some((w) => w.length > 4 && q.includes(w));
    })
    .slice(0, 3);
}

export function normalizeConversation(ticket) {
  if (ticket.conversation?.length) return ticket.conversation;
  return (ticket.replies || []).map((r) => ({ at: r.at || r.sentAt, by: r.authorId || r.by, body: r.body, type: "public" }));
}
