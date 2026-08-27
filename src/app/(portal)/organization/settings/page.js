"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Input, Textarea, Select, Switch, ConfirmDialog } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated, useLanguage, useThemePreference } from "@/hooks/useApp";
import { downloadCsv } from "@/lib/exporters";
import { toast } from "sonner";
import { getOrg, updateOrganization } from "../_lib/helpers";

export default function OrganizationSettingsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const organizations = useAppStore((s) => s.organizations);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const setUiPreferences = useAppStore((s) => s.setUiPreferences);
  const resetDemoData = useAppStore((s) => s.resetDemoData);
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useThemePreference();

  const org = getOrg(organizations, user?.organizationId);

  const [resetOpen, setResetOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    designation: user?.designation || "",
    department: user?.department || "",
  });
  const [orgPrefs, setOrgPrefs] = useState({
    autoPublishMatches: org?.settings?.autoPublishMatches ?? false,
    requireUniversityApproval: org?.settings?.requireUniversityApproval ?? true,
    notifyOnApplication: org?.settings?.notifyOnApplication ?? true,
  });

  const notifPrefs = user?.notificationPreferences || { email: true, inApp: true, sms: false };

  const saveProfile = () => {
    if (!user) return;
    updateProfile(user.id, profile);
    toast.success("Profile updated");
  };

  const saveOrgPrefs = () => {
    if (!org) return;
    updateOrganization(org.id, { settings: orgPrefs });
    toast.success("Organization preferences saved");
  };

  const saveNotif = (key, val) => {
    if (!user) return;
    updateProfile(user.id, { notificationPreferences: { ...notifPrefs, [key]: val } });
    toast.success("Notification preferences saved");
  };

  const exportData = () => {
    downloadCsv(
      "nexus-org-export",
      [{
        organization: org?.name,
        user: user?.name,
        email: user?.email,
        opportunities: org?.publishedOpportunityCount,
        verification: org?.verificationStatus,
      }],
      [
        { key: "organization", label: "Organization" },
        { key: "user", label: "User" },
        { key: "email", label: "Email" },
        { key: "opportunities", label: "Opportunities" },
        { key: "verification", label: "Verification" },
      ]
    );
    toast.success("Data exported");
  };

  const handleReset = () => {
    resetDemoData();
    setResetOpen(false);
    toast.success("Demo data reset");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description={`${org?.name || "Organization"} portal preferences`} />

      <Tabs defaultValue="profile">
        <TabList>
          <Tab value="profile">Your profile</Tab>
          <Tab value="organization">Organization</Tab>
          <Tab value="notifications">Notifications</Tab>
          <Tab value="appearance">Appearance</Tab>
          <Tab value="data">Data</Tab>
        </TabList>

        <TabPanel value="profile" className="mt-4 space-y-4">
          <div className="card-surface grid gap-4 p-4 sm:grid-cols-2">
            <Input label="Name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
            <Input label="Phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            <Input label="Designation" value={profile.designation} onChange={(e) => setProfile((p) => ({ ...p, designation: e.target.value }))} />
            <Input label="Department" value={profile.department} onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))} />
          </div>
          <Button onClick={saveProfile}>Save profile</Button>
        </TabPanel>

        <TabPanel value="organization" className="mt-4 space-y-4">
          <div className="card-surface space-y-4 p-4">
            <Switch label="Notify on new applications" checked={orgPrefs.notifyOnApplication} onChange={(v) => setOrgPrefs((p) => ({ ...p, notifyOnApplication: v }))} />
            <Switch label="Require university approval by default" checked={orgPrefs.requireUniversityApproval} onChange={(v) => setOrgPrefs((p) => ({ ...p, requireUniversityApproval: v }))} />
            <Switch label="Auto-surface high matches to recruiters" checked={orgPrefs.autoPublishMatches} onChange={(v) => setOrgPrefs((p) => ({ ...p, autoPublishMatches: v }))} />
          </div>
          <Button onClick={saveOrgPrefs}>Save organization settings</Button>
        </TabPanel>

        <TabPanel value="notifications" className="mt-4">
          <div className="card-surface space-y-4 p-4">
            <Switch label="Email notifications" checked={notifPrefs.email} onChange={(v) => saveNotif("email", v)} />
            <Switch label="In-app notifications" checked={notifPrefs.inApp} onChange={(v) => saveNotif("inApp", v)} />
            <Switch label="SMS alerts (simulated)" checked={notifPrefs.sms} onChange={(v) => saveNotif("sms", v)} />
          </div>
        </TabPanel>

        <TabPanel value="appearance" className="mt-4">
          <div className="card-surface grid gap-4 p-4 sm:grid-cols-2">
            <Select label="Theme" value={theme} onChange={(e) => setTheme(e.target.value)} options={[
              { value: "system", label: "System" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]} />
            <Select label="Language" value={language} onChange={(e) => setLanguage(e.target.value)} options={[
              { value: "en", label: "English" },
              { value: "bn", label: "Bangla" },
            ]} />
          </div>
        </TabPanel>

        <TabPanel value="data" className="mt-4 space-y-4">
          <div className="card-surface p-4">
            <p className="text-sm text-secondary">Export organization activity or reset prototype data.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={exportData}>Export CSV</Button>
              <Button variant="ghost" onClick={() => setResetOpen(true)}>Reset demo data</Button>
            </div>
          </div>
        </TabPanel>
      </Tabs>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title="Reset demo data?"
        description="This clears local prototype state and restores seed data."
        confirmLabel="Reset"
        danger
      />
    </div>
  );
}
