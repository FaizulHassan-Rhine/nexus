"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Tabs, TabList, Tab, TabPanel, Button, Input, Select, Switch, ConfirmDialog } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated, useLanguage, useThemePreference } from "@/hooks/useApp";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const updateProfile = useAppStore((s) => s.updateProfile);
  const resetDemoData = useAppStore((s) => s.resetDemoData);
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useThemePreference();
  const [resetOpen, setResetOpen] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "", designation: user?.designation || "" });

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="University administrator preferences" />
      <Tabs defaultValue="account">
        <TabList><Tab value="account">Account</Tab><Tab value="profile">Profile</Tab><Tab value="prefs">Preferences</Tab><Tab value="danger">Reset</Tab></TabList>
        <TabPanel value="account">
          <div className="card-surface max-w-lg space-y-2 p-4 text-sm">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>University:</strong> {user?.universityId}</p>
            <p><strong>Employee ID:</strong> {user?.employeeId}</p>
          </div>
        </TabPanel>
        <TabPanel value="profile">
          <div className="card-surface max-w-lg space-y-4 p-4">
            <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <Input label="Designation" value={profile.designation} onChange={(e) => setProfile({ ...profile, designation: e.target.value })} />
            <Button onClick={() => { updateProfile(user.id, profile); toast.success("Profile saved"); }}>Save</Button>
          </div>
        </TabPanel>
        <TabPanel value="prefs">
          <div className="card-surface max-w-lg space-y-4 p-4">
            <Select label="Language" value={language} onChange={(e) => setLanguage(e.target.value)} options={[{ value: "en", label: "English" }, { value: "bn", label: "Bangla" }]} />
            <Select label="Theme" value={theme} onChange={(e) => setTheme(e.target.value)} options={[{ value: "system", label: "System" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
            <Switch label="Email notifications" checked={user?.notificationPreferences?.email !== false} onChange={(v) => updateProfile(user.id, { notificationPreferences: { ...user.notificationPreferences, email: v } })} />
          </div>
        </TabPanel>
        <TabPanel value="danger">
          <div className="card-surface max-w-lg p-4">
            <Button variant="danger" onClick={() => setResetOpen(true)}>Reset demo data</Button>
          </div>
        </TabPanel>
      </Tabs>
      <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={() => { resetDemoData(); router.push("/login"); }} title="Reset demo data?" description="Clears localStorage and restores seed state." confirmLabel="Reset" danger />
    </div>
  );
}
