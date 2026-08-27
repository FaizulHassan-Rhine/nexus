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

export default function FacultySettingsPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const updateProfile = useAppStore((s) => s.updateProfile);
  const resetDemoData = useAppStore((s) => s.resetDemoData);
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useThemePreference();

  const [resetOpen, setResetOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    designation: user?.designation || "",
    department: user?.department || "",
    exchangePreference: user?.exchangePreference ?? true,
    bio: user?.bio || "",
  });

  const notifPrefs = user?.notificationPreferences || { email: true, inApp: true, sms: false };
  const privacyPrefs = user?.privacyPreferences || { shareWithOrganizations: true, showContact: true };

  const saveProfile = () => {
    if (!user) return;
    updateProfile(user.id, {
      ...profile,
      profileCompletion: Math.min(100, (user.profileCompletion || 90) + 1),
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
      "nexus-faculty-profile-export",
      [
        {
          name: user?.name,
          email: user?.email,
          department: user?.department,
          researchAreas: (user?.researchAreas || []).join("; "),
          profileCompletion: user?.profileCompletion,
        },
      ],
      [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "department", label: "Department" },
        { key: "researchAreas", label: "Research areas" },
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
      <PageHeader title="Settings" description="Account, research profile, privacy, and preferences" />

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
            <p><strong>Employee ID:</strong> {user?.employeeId || "—"}</p>
            <p><strong>University:</strong> {user?.universityId}</p>
            <p><strong>Verification:</strong> {user?.verificationStatus}</p>
          </div>
        </TabPanel>

        <TabPanel value="profile">
          <div className="card-surface max-w-lg space-y-4 p-4">
            <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <Input label="Designation" value={profile.designation} onChange={(e) => setProfile({ ...profile, designation: e.target.value })} />
            <Input label="Department" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} />
            <Textarea label="Bio" rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            <Button onClick={saveProfile}>Save profile</Button>
          </div>
        </TabPanel>

        <TabPanel value="privacy">
          <div className="card-surface max-w-lg space-y-4 p-4">
            <Switch label="Share profile with industry partners" checked={privacyPrefs.shareWithOrganizations !== false} onChange={(v) => savePrivacy("shareWithOrganizations", v)} />
            <Switch label="Show contact details on technology listings" checked={privacyPrefs.showContact !== false} onChange={(v) => savePrivacy("showContact", v)} />
          </div>
        </TabPanel>

        <TabPanel value="prefs">
          <div className="card-surface max-w-lg space-y-4 p-4">
            <Switch
              label="Open to faculty exchange"
              checked={Boolean(profile.exchangePreference)}
              onChange={(v) => {
                setProfile({ ...profile, exchangePreference: v });
                updateProfile(user.id, { exchangePreference: v });
                toast.success("Exchange preference saved");
              }}
            />
            <p className="text-sm text-secondary">Used for exchange and visiting faculty match eligibility.</p>
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
            <p className="text-sm text-secondary">Download a CSV summary of your faculty profile.</p>
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
