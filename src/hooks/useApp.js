"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useAppStore } from "@/store/useAppStore";

const emptySubscribe = () => () => {};

export function useHydrated() {
  const hydrated = useAppStore((s) => s.hydrated);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  return mounted && hydrated;
}

export function useCurrentUser() {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  return users.find((u) => u.id === currentUserId) || null;
}

export function usePermissions() {
  const user = useCurrentUser();
  return {
    user,
    isGuest: !user,
    isStudent: user?.role === "student",
    isFaculty: user?.role === "faculty",
    isOrganization: user?.role === "organization",
    isUniversityAdmin: user?.role === "university-admin",
    isUgc: user?.role === "ugc",
    isHelpdesk: user?.role === "helpdesk",
  };
}

export function useDebounce(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export function useLanguage() {
  const language = useAppStore((s) => s.uiPreferences.language);
  const setUiPreferences = useAppStore((s) => s.setUiPreferences);
  return {
    language,
    setLanguage: (language) => setUiPreferences({ language }),
  };
}

export function useThemePreference() {
  const theme = useAppStore((s) => s.uiPreferences.theme);
  const setUiPreferences = useAppStore((s) => s.setUiPreferences);
  return {
    theme,
    setTheme: (theme) => setUiPreferences({ theme }),
  };
}
