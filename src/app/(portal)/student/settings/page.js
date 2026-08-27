"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Input, Textarea, Select, Switch, ConfirmDialog } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated, useLanguage, useThemePreference } from "@/hooks/useApp";
import { downloadCsv } from "@/lib/exporters";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const updateProfile = useAppStore((s) => s.updateProfile);
  const setUiPreferences = useAppStore((s) => s.setUiPreferences);
  const resetDemoData = useAppStore((s) => s.resetDemoData);
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useThemePreference();

  const [resetOpen, setResetOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    programme: user?.programme || "",
    weeklyAvailability: user?.weeklyAvailability || 20,
    expectedCompensation: user?.expectedCompensation || "",
    bio: user?.bio || "",
  });

  const notifPrefs = user?.notificationPreferences || { email: true, inApp: true, sms: false };
  const privacyPrefs = user?.privacyPreferences || { showCgpa: false, showContact: true, shareWithOrganizations: true };

  const saveProfile = () => {
    if (!user) return;
    updateProfile(user.id, {
      ...profile,
      expectedCompensation: Number(profile.expectedCompensation) || user.expectedCompensation,
      weeklyAvailability: Number(profile.weeklyAvailability) || user.weeklyAvailability,
      profileCompletion: Math.min(100, (user.profileCompletion || 85) + 2),
    });
    toast.success("Profile updated");
  };

  const saveNotif = (key, val) => {
    if (!user) return;
    updateProfile(user.id, { notificationPreferences: { ...notifPrefs, [key]: val } });
    toast.success("Notification preferences saved");
  };

  const savePrivacy = (key, val) => {
    if (!user) return;
    updateProfile(user.id, { privacyPreferences: { ...privacyPrefs, [key]: val } });
    toast.success("Privacy settings saved");
  };

  const exportData = () => {
    downloadCsv(
      "nexus-profile-export",
      [
        {
          name: user?.name,
          email: user?.email,
          programme: user?.programme,
          skills: (user?.skills || []).join("; "),
          profileCompletion: user?.profileCompletion,
        },
      ],
      [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "programme", label: "Programme" },
        { key: "skills", label: "Skills" },
        { key: "profileCompletion", label: "Profile %" },
      ]
    );
    toast.success("Profile exported");
  };

  const handleReset = () => {
    resetDemoData();
    setResetOpen(false);
    toast.success("Demo data reset");
    router.push("/login");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Account, profile, privacy, and preferences" />

      <Tabs defaultValue="account">
        <TabList>
          <Tab value="account">Account</Tab>
          <Tab value="profile">Profile</Tab>
          <Tab value="privacy">Privacy</Tab>
          <Tab value="prefs">Preferences</Tab>
          <Tab value="notifications">Notifications</Tab>
          <Tab value="language">Language</Tab>
          <Tab value="theme">Theme</Tab>
          <Tab value="export">Export</Tab>
          <Tab value="danger">Reset</Tab>
        </TabList>

        <TabPanel value="account">
          <div className="card-surface max-w-lg space-y-3 p-4 text-sm">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Student ID:</strong> {user?.studentId || "—"}</p>
            <p><strong>University:</strong> {user?.universityId}</p>
            <p><strong>Verification:</strong> {user?.verificationStatus}</p>
          </div>
        </TabPanel>

        <TabPanel value="profile">
          <div className="card-surface max-w-lg space-y-4 p-4">
            <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <Input label="Programme" value={profile.programme} onChange={(e) => setProfile({ ...profile, programme: e.target.value })} />
            <Input label="Weekly availability (hours)" type="number" value={profile.weeklyAvailability} onChange={(e) => setProfile({ ...profile, weeklyAvailability: e.target.value })} />
            <Input label="Expected compensation (BDT)" type="number" value={profile.expectedCompensation} onChange={(e) => setProfile({ ...profile, expectedCompensation: e.target.value })} />
            <Textarea label="Bio" rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            <Button onClick={saveProfile}>Save profile</Button>
          </div>
        </TabPanel>

        <TabPanel value="privacy">
          <div className="card-surface max-w-lg space-y-4 p-4">
            <Switch label="Share profile with organizations" checked={privacyPrefs.shareWithOrganizations !== false} onChange={(v) => savePrivacy("shareWithOrganizations", v)} />
            <Switch label="Show CGPA on passport" checked={Boolean(privacyPrefs.showCgpa)} onChange={(v) => savePrivacy("showCgpa", v)} />
            <Switch label="Show contact details" checked={privacyPrefs.showContact !== false} onChange={(v) => savePrivacy("showContact", v)} />
          </div>
        </TabPanel>

        <TabPanel value="prefs">
          <div className="card-surface max-w-lg space-y-4 p-4">
            <Switch
              label="Financial support need"
              checked={Boolean(user?.financialSupportNeed)}
              onChange={(v) => {
                updateProfile(user.id, { financialSupportNeed: v });
                toast.success("Preference saved");
              }}
            />
            <p className="text-sm text-secondary">Used by the match engine to prioritize funded opportunities.</p>
          </div>
        </TabPanel>

        <TabPanel value="notifications">
          <div className="card-surface max-w-lg space-y-4 p-4">
            <Switch label="Email notifications" checked={Boolean(notifPrefs.email)} onChange={(v) => saveNotif("email", v)} />
            <Switch label="In-app notifications" checked={notifPrefs.inApp !== false} onChange={(v) => saveNotif("inApp", v)} />
            <Switch label="SMS notifications" checked={Boolean(notifPrefs.sms)} onChange={(v) => saveNotif("sms", v)} />
          </div>
        </TabPanel>

        <TabPanel value="language">
          <div className="card-surface max-w-lg space-y-4 p-4">
            <Select
              label="Language"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                updateProfile(user.id, { language: e.target.value });
                toast.success("Language updated");
              }}
              options={[
                { value: "en", label: "English" },
                { value: "bn", label: "Bangla" },
              ]}
            />
          </div>
        </TabPanel>

        <TabPanel value="theme">
          <div className="card-surface max-w-lg space-y-4 p-4">
            <Select
              label="Theme"
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value);
                toast.success("Theme updated");
              }}
              options={[
                { value: "system", label: "System" },
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          </div>
        </TabPanel>

        <TabPanel value="export">
          <div className="card-surface max-w-lg p-4">
            <p className="text-sm text-secondary">Download a CSV summary of your profile data.</p>
            <Button className="mt-4" variant="secondary" onClick={exportData}>Export profile CSV</Button>
          </div>
        </TabPanel>

        <TabPanel value="danger">
          <div className="card-surface max-w-lg p-4">
            <p className="text-sm text-secondary">Reset all demo data to seed state. You will be signed out.</p>
            <Button className="mt-4" variant="danger" onClick={() => setResetOpen(true)}>Reset demo data</Button>
          </div>
        </TabPanel>
      </Tabs>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title="Reset demo data?"
        description="This clears localStorage and restores seed data. Cannot be undone."
        confirmLabel="Reset"
        danger
      />
    </div>
  );
}
