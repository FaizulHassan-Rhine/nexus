import { ROLES } from "./constants";

export function canBrowsePublic() {
  return true;
}

export function canSaveOrApply(user) {
  return Boolean(user);
}

export function canAccessRole(user, role) {
  if (!user) return false;
  return user.role === role;
}

export function canViewCandidate(viewer, candidate) {
  if (!viewer || !candidate) return false;
  if (viewer.role === ROLES.UGC) return true;
  if (viewer.role === ROLES.UNIVERSITY_ADMIN) {
    return viewer.universityId === candidate.universityId;
  }
  if (viewer.role === ROLES.ORGANIZATION) {
    return candidate.privacyPreferences?.shareWithOrganizations !== false;
  }
  if (viewer.role === ROLES.FACULTY || viewer.role === ROLES.RESEARCHER) {
    return viewer.universityId === candidate.universityId;
  }
  if (viewer.role === ROLES.STUDENT) {
    return viewer.id === candidate.id;
  }
  if (viewer.role === ROLES.HELPDESK) {
    return true;
  }
  return false;
}

export function canManageOpportunity(user, opportunity) {
  if (!user || !opportunity) return false;
  if (user.role === ROLES.ORGANIZATION) {
    return user.organizationId === opportunity.organizationId;
  }
  if (user.role === ROLES.UGC || user.role === ROLES.UNIVERSITY_ADMIN) return true;
  return false;
}

export function canReviewMatch(user) {
  return user?.role === ROLES.UNIVERSITY_ADMIN || user?.role === ROLES.UGC;
}

export function canApproveFunding(user) {
  return user?.role === ROLES.UGC || user?.role === ROLES.UNIVERSITY_ADMIN;
}

export function canAccessPortal(user, portalRole) {
  return Boolean(user && user.role === portalRole);
}

export function getUnauthorizedMessage(role) {
  return `This area is restricted to ${role} accounts. Switch demo role or sign in with the correct credentials.`;
}
