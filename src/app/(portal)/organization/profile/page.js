"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, SectionHeader } from "@/components/ui";
import { Button, Input, Textarea, Select, Tabs, TabList, Tab, TabPanel, Badge, FileUploader } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { getOrg, getPartnerUniversities, updateOrganization } from "../_lib/helpers";

export default function OrganizationProfilePage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const organizations = useAppStore((s) => s.organizations);
  const universities = useAppStore((s) => s.universities);

  const org = useMemo(() => getOrg(organizations, user?.organizationId), [organizations, user]);
  const partners = useMemo(() => getPartnerUniversities(universities, org), [universities, org]);

  const [form, setForm] = useState(null);
  const [preview, setPreview] = useState(false);
  const [policies, setPolicies] = useState({
    equalOpportunity: "We provide equal opportunity regardless of gender, religion, or background.",
    internshipPolicy: "All internships follow university approval and UGC co-funding guidelines where applicable.",
    dataPrivacy: "Candidate data is used only for recruitment and deleted upon request.",
  });
  const [benefits, setBenefits] = useState(org?.benefits || []);
  const [newBenefit, setNewBenefit] = useState("");
  const [doc, setDoc] = useState(org?.registrationDocument || null);

  const data = form || org || {};
  const set = (key, val) => setForm((f) => ({ ...(f || org), [key]: val }));

  const save = () => {
    if (!org || !user) return;
    updateOrganization(org.id, {
      name: data.name,
      about: data.about,
      website: data.website,
      email: data.email,
      phone: data.phone,
      industry: data.industry,
      size: data.size,
      benefits,
      registrationDocument: doc,
      policies,
    });
    setForm(null);
    toast.success("Organization profile updated");
  };

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    setBenefits((b) => [...b, newBenefit.trim()]);
    setNewBenefit("");
  };

  if (!hydrated || !org) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Organization profile"
        description="Manage your public presence, documents, and policies"
        actions={
          <>
            <Button variant="secondary" onClick={() => setPreview((v) => !v)}>
              {preview ? "Edit mode" : "Public preview"}
            </Button>
            <Button onClick={save}>Save changes</Button>
          </>
        }
      />

      {preview ? (
        <article className="card-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge tone="teal">{org.type}</Badge>
              <h2 className="mt-2 text-2xl font-semibold">{data.name}</h2>
              <p className="text-secondary">{data.industry} · {data.size} employees</p>
            </div>
            <Badge tone={org.verificationStatus === "Verified" ? "green" : "amber"}>{org.verificationStatus}</Badge>
          </div>
          <p className="mt-4 text-secondary">{data.about}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {benefits.map((b) => (
              <Badge key={b} tone="slate">{b}</Badge>
            ))}
          </div>
          <p className="mt-4 text-sm">
            <Link href={data.website || "#"} className="text-nexus-700">{data.website}</Link>
            {" · "}{data.email} · {data.phone}
          </p>
          <p className="mt-2 text-sm text-secondary">
            {data.headquarters?.address} · Operating: {(data.operatingLocations || []).join(", ")}
          </p>
          <Link href={`/organizations/${org.slug}`} className="mt-4 inline-block text-sm text-nexus-700">
            View marketing profile →
          </Link>
        </article>
      ) : (
        <Tabs defaultValue="general">
          <TabList>
            <Tab value="general">General</Tab>
            <Tab value="locations">Locations</Tab>
            <Tab value="documents">Documents</Tab>
            <Tab value="policies">Policies</Tab>
            <Tab value="benefits">Benefits</Tab>
            <Tab value="partners">Partners</Tab>
          </TabList>

          <TabPanel value="general" className="mt-4 space-y-4">
            <div className="card-surface grid gap-4 p-4 sm:grid-cols-2">
              <Input label="Organization name" value={data.name || ""} onChange={(e) => set("name", e.target.value)} />
              <Input label="Industry" value={data.industry || ""} onChange={(e) => set("industry", e.target.value)} />
              <Select label="Size" value={data.size || ""} onChange={(e) => set("size", e.target.value)} options={[
                { value: "1-10", label: "1-10" },
                { value: "11-50", label: "11-50" },
                { value: "51-200", label: "51-200" },
                { value: "201-500", label: "201-500" },
                { value: "501-1000", label: "501-1000" },
                { value: "1000+", label: "1000+" },
              ]} />
              <Input label="Website" value={data.website || ""} onChange={(e) => set("website", e.target.value)} />
              <Input label="Careers email" value={data.email || ""} onChange={(e) => set("email", e.target.value)} />
              <Input label="Phone" value={data.phone || ""} onChange={(e) => set("phone", e.target.value)} />
              <Textarea className="sm:col-span-2" label="About" rows={4} value={data.about || ""} onChange={(e) => set("about", e.target.value)} />
            </div>
          </TabPanel>

          <TabPanel value="locations" className="mt-4">
            <div className="card-surface space-y-3 p-4">
              <Input label="Headquarters address" value={data.headquarters?.address || ""} onChange={(e) => set("headquarters", { ...data.headquarters, address: e.target.value })} />
              <Input label="Division" value={data.headquarters?.division || ""} onChange={(e) => set("headquarters", { ...data.headquarters, division: e.target.value })} />
              <p className="text-sm text-secondary">Operating locations: {(data.operatingLocations || []).join(", ")}</p>
            </div>
          </TabPanel>

          <TabPanel value="documents" className="mt-4">
            <div className="card-surface p-4">
              <SectionHeader title="Verification documents" description="Trade license, registration, or partnership certificates" />
              <FileUploader label="Registration document" value={doc} onChange={setDoc} onRemove={() => setDoc(null)} accept=".pdf,.jpg,.png" />
              {doc ? <p className="mt-2 text-sm">Status: <Badge tone="green">{doc.status || "Uploaded"}</Badge></p> : null}
            </div>
          </TabPanel>

          <TabPanel value="policies" className="mt-4 space-y-4">
            {Object.entries(policies).map(([key, val]) => (
              <Textarea
                key={key}
                label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                rows={3}
                value={val}
                onChange={(e) => setPolicies((p) => ({ ...p, [key]: e.target.value }))}
              />
            ))}
          </TabPanel>

          <TabPanel value="benefits" className="mt-4">
            <div className="card-surface p-4">
              <div className="flex gap-2">
                <Input className="flex-1" placeholder="Add benefit..." value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)} />
                <Button onClick={addBenefit}>Add</Button>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {benefits.map((b) => (
                  <li key={b}>
                    <Badge tone="teal">
                      {b}
                      <button type="button" className="ml-2" onClick={() => setBenefits((list) => list.filter((x) => x !== b))}>×</button>
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </TabPanel>

          <TabPanel value="partners" className="mt-4">
            <div className="card-surface p-4">
              <SectionHeader title="Partner universities" />
              <ul className="mt-3 space-y-2">
                {partners.map((u) => (
                  <li key={u.id} className="flex items-center justify-between text-sm">
                    <span>{u.name}</span>
                    <Badge tone="slate">{u.slug}</Badge>
                  </li>
                ))}
              </ul>
              <Button className="mt-4" variant="secondary" onClick={() => toast.message("Partnership requests managed on Partnerships page")}>
                Request new partnership
              </Button>
            </div>
          </TabPanel>
        </Tabs>
      )}

      <section className="card-surface p-4">
        <SectionHeader title="Risk & compliance" />
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Badge tone={org.riskLevel === "Low" ? "green" : "amber"}>Risk: {org.riskLevel}</Badge>
          <span className="text-secondary">Complaints: {org.complaintCount}</span>
          <span className="text-secondary">Member since {formatDate(org.createdAt)}</span>
          {org.ugcCoFundingEligible ? <Badge tone="violet">UGC co-funding eligible</Badge> : null}
        </div>
      </section>
    </div>
  );
}
