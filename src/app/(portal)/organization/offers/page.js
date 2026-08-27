"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Input, Textarea, Select, Modal, MultiStepForm, StatusBadge, DateInput } from "@/components/ui";
import { FundingSplitCard } from "@/components/domain/Domain";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { applicationService } from "@/lib/mockServices";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { percentPair } from "@/lib/validators";
import { toast } from "sonner";
import { getOrgApplications, defaultOfferFromApplication, patchApplication } from "../_lib/helpers";

const STEPS = ["Application", "Terms", "Funding split", "Review"];

export default function OffersPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const applications = useAppStore((s) => s.applications);
  const opportunities = useAppStore((s) => s.opportunities);
  const organizations = useAppStore((s) => s.organizations);
  const users = useAppStore((s) => s.users);

  const [createOpen, setCreateOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    applicationId: "",
    role: "",
    startDate: "",
    compensation: 18000,
    currency: "BDT",
    companySharePercent: 50,
    ugcSharePercent: 50,
    terms: "",
    acceptanceDeadline: "",
  });

  const org = organizations.find((o) => o.id === user?.organizationId);
  const orgApps = useMemo(
    () => getOrgApplications(applications, opportunities, user?.organizationId),
    [applications, opportunities, user]
  );
  const offers = orgApps.filter((a) => ["Offered", "Accepted"].includes(a.status) || a.offerDetails);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const loadFromApp = (appId) => {
    const app = orgApps.find((a) => a.id === appId);
    const opp = opportunities.find((o) => o.id === app?.opportunityId);
    if (!app) return;
    const defaults = defaultOfferFromApplication(app, opp, org);
    setForm((f) => ({ ...f, applicationId: appId, ...defaults }));
  };

  const createOffer = async () => {
    const err = percentPair(form.companySharePercent, form.ugcSharePercent);
    if (form.ugcSharePercent > 0 && err) {
      toast.error(err);
      return;
    }
    const offerDetails = {
      role: form.role,
      startDate: form.startDate,
      compensation: form.compensation,
      currency: form.currency,
      companySharePercent: form.companySharePercent,
      ugcSharePercent: form.ugcSharePercent,
      terms: form.terms,
      acceptanceDeadline: form.acceptanceDeadline,
      createdAt: new Date().toISOString(),
      createdBy: user?.id,
    };
    patchApplication(form.applicationId, { offerDetails, status: "Offered" });
    await applicationService.updateStatus(form.applicationId, "Offered", "Offer letter issued", user?.role);
    toast.success("Offer created — awaiting candidate decision");
    setCreateOpen(false);
    setStep(0);
  };

  const simulateAcceptance = async (appId) => {
    patchApplication(appId, { offerDetails: { ...applications.find((a) => a.id === appId)?.offerDetails, acceptedAt: new Date().toISOString() } });
    await applicationService.updateStatus(appId, "Accepted", "Offer accepted by candidate", user?.role);
    toast.success("Candidate accepted offer");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers"
        description="Create and track offer letters with co-funding splits"
        actions={<Button onClick={() => setCreateOpen(true)}>Create offer</Button>}
      />

      <ul className="space-y-4">
        {offers.map((app) => {
          const candidate = users.find((u) => u.id === app.applicantId);
          const opp = opportunities.find((o) => o.id === app.opportunityId);
          const offer = app.offerDetails;
          return (
            <li key={app.id} className="card-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{candidate?.name}</p>
                  <p className="text-sm text-secondary">{opp?.title} · {offer?.role || "Role"}</p>
                  <p className="mt-1 text-sm">
                    {formatCurrency(offer?.compensation || opp?.compensation?.amount, offer?.currency || "BDT")} / month
                    {offer?.companySharePercent != null ? ` · Company ${offer.companySharePercent}% / UGC ${offer.ugcSharePercent}%` : null}
                  </p>
                  <p className="text-xs text-secondary">Start {formatDate(offer?.startDate)} · Accept by {formatDate(offer?.acceptanceDeadline)}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              {offer ? (
                <FundingSplitCard
                  companyShare={offer.companySharePercent || 100}
                  ugcShare={offer.ugcSharePercent || 0}
                  total={(offer.compensation || 0) * 4}
                  className="mt-4"
                />
              ) : null}
              {app.status === "Offered" ? (
                <Button className="mt-3" size="sm" variant="secondary" onClick={() => simulateAcceptance(app.id)}>
                  Simulate acceptance
                </Button>
              ) : null}
            </li>
          );
        })}
        {!offers.length && <p className="text-sm text-secondary">No offers yet.</p>}
      </ul>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create offer">
        <MultiStepForm steps={STEPS} current={step} onStepChange={setStep}>
          {step === 0 && (
            <Select
              label="Application"
              value={form.applicationId}
              onChange={(e) => loadFromApp(e.target.value)}
              options={[
                { value: "", label: "Select..." },
                ...orgApps.filter((a) => !["Rejected", "Withdrawn"].includes(a.status)).map((a) => {
                  const c = users.find((u) => u.id === a.applicantId);
                  return { value: a.id, label: `${c?.name} (${a.status})` };
                }),
              ]}
            />
          )}
          {step === 1 && (
            <div className="space-y-4">
              <Input label="Role title" value={form.role} onChange={(e) => set("role", e.target.value)} />
              <DateInput label="Start date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              <Input label="Monthly compensation" type="number" value={form.compensation} onChange={(e) => set("compensation", e.target.value)} />
              <DateInput label="Acceptance deadline" value={form.acceptanceDeadline} onChange={(e) => set("acceptanceDeadline", e.target.value)} />
              <Textarea label="Terms" rows={3} value={form.terms} onChange={(e) => set("terms", e.target.value)} />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Company share %" type="number" value={form.companySharePercent} onChange={(e) => {
                  const v = Number(e.target.value);
                  set("companySharePercent", v);
                  set("ugcSharePercent", 100 - v);
                }} />
                <Input label="UGC share %" type="number" value={form.ugcSharePercent} onChange={(e) => {
                  const v = Number(e.target.value);
                  set("ugcSharePercent", v);
                  set("companySharePercent", 100 - v);
                }} />
              </div>
              <FundingSplitCard companyShare={form.companySharePercent} ugcShare={form.ugcSharePercent} total={form.compensation * 4} />
              {percentPair(form.companySharePercent, form.ugcSharePercent) && form.ugcSharePercent > 0 ? (
                <p className="text-sm text-danger">{percentPair(form.companySharePercent, form.ugcSharePercent)}</p>
              ) : null}
            </div>
          )}
          {step === 3 && (
            <div className="text-sm space-y-2">
              <p><strong>{form.role}</strong> — {formatCurrency(form.compensation, form.currency)}/month</p>
              <p>Split: {form.companySharePercent}% company / {form.ugcSharePercent}% UGC</p>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            {step > 0 ? <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button> : null}
            {step < STEPS.length - 1 ? <Button onClick={() => setStep((s) => s + 1)}>Next</Button> : <Button onClick={createOffer}>Send offer</Button>}
          </div>
        </MultiStepForm>
      </Modal>
    </div>
  );
}
