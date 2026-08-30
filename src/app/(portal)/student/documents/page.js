"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { Button, Input, Select, FileUploader, Badge } from "@/components/ui";
import { DataTable } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { formatDate, fileSizeLabel } from "@/lib/formatters";
import { toast } from "sonner";

export default function DocumentsPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [docType, setDocType] = useState("CV");
  const [upload, setUpload] = useState(null);

  const documents = user?.documents || [];

  const saveDocument = () => {
    if (!upload || !user) {
      toast.error("Upload a file first");
      return;
    }
    const doc = {
      id: `doc-${Date.now()}`,
      name: upload.name,
      type: docType,
      size: upload.size,
      uploadedAt: upload.uploadedAt || new Date().toISOString(),
    };
    updateProfile(user.id, { documents: [...documents, doc] });
    setUpload(null);
    toast.success("Document metadata saved");
  };

  const removeDocument = (docId) => {
    if (!user) return;
    updateProfile(user.id, { documents: documents.filter((d) => d.id !== docId) });
    toast.message("Document removed");
  };

  const columns = [
    { key: "name", label: "File name" },
    { key: "type", label: "Type", render: (row) => <Badge tone="slate">{row.type}</Badge> },
    { key: "uploadedAt", label: "Uploaded", render: (row) => formatDate(row.uploadedAt) },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <Button size="sm" variant="ghost" onClick={() => removeDocument(row.id)}>
          Remove
        </Button>
      ),
    },
  ];

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Documents"
        description="Upload CVs, transcripts, and identity documents (NID, birth certificate, or passport) used for verification"
      />

      <section className="card-surface max-w-xl space-y-4 p-4">
        <h2 className="font-semibold">Upload document</h2>
        <Select
          label="Document type"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          options={["CV", "Transcript", "Cover letter", "Portfolio", "Income certificate", "National ID Card", "Birth Certificate", "Passport", "Other"]}
        />
        <FileUploader
          label="File"
          accept=".pdf,.doc,.docx,.jpg,.png"
          value={upload}
          onChange={setUpload}
          onRemove={() => setUpload(null)}
        />
        {upload ? <p className="text-xs text-secondary">Size: {fileSizeLabel(upload.size)}</p> : null}
        <Button onClick={saveDocument}>Save to profile</Button>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Your documents</h2>
        <DataTable columns={columns} rows={documents} emptyMessage="No documents uploaded yet." />
      </section>
    </div>
  );
}
