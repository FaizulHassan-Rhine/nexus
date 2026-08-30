"use client";

import { Input, Select } from "@/components/ui";
import { IDENTITY_DOCUMENT_TYPES, identityNumberField } from "@/lib/ecosystem";

export function IdentityVerificationFields({
  identityType,
  onIdentityTypeChange,
  identityNumber,
  onIdentityNumberChange,
  errors = {},
}) {
  const options = IDENTITY_DOCUMENT_TYPES.map((doc) => ({
    value: doc.value,
    label: doc.label,
  }));
  const numberField = identityNumberField(identityType);

  return (
    <div className="sm:col-span-2 space-y-4 rounded-xl border border-[#d5e3df] bg-chrome/60 p-4 dark:border-nexus-800 dark:bg-nexus-900/40">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Identity verification</h3>
        <p className="mt-1 text-xs text-secondary">
          Choose a document type and enter the ID number. National ID, birth certificate, and passport are accepted.
        </p>
      </div>
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
        <Select
          label="Identity document"
          options={options}
          value={identityType}
          onChange={(e) => onIdentityTypeChange(e.target.value)}
          error={errors.identityType}
          placeholder="Select document"
          required
        />
        <Input
          label={numberField.label}
          value={identityNumber}
          onChange={(e) => onIdentityNumberChange(e.target.value)}
          error={errors.identityNumber}
          placeholder={numberField.placeholder}
          required
        />
      </div>
    </div>
  );
}
