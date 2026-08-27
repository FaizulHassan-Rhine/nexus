"use client";

import { PageHeader, Button, Badge, StatusBadge, DataTable } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useApp";
import { formatDate, formatRelative } from "@/lib/formatters";
import { toast } from "sonner";

export default function ErpIntegrationPage() {
  const hydrated = useHydrated();
  const erp = useAppStore((s) => s.erpIntegration);
  const runErpSync = useAppStore((s) => s.runErpSync);
  const updateErpIntegration = useAppStore((s) => s.updateErpIntegration);

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ERP integration"
        description="Mock sync control centre — no real ERP system is connected. All operations are simulated for demo purposes."
      />

      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
        <strong>Prototype notice:</strong> This page simulates ERP connectivity only. No student records are read from or written to any live university ERP.
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-surface p-4">
          <p className="text-xs text-secondary uppercase">Connection</p>
          <p className="mt-2 text-lg font-semibold">{erp.connected ? "Connected (mock)" : "Disconnected"}</p>
          <p className="text-sm text-secondary">{erp.systemName}</p>
          <Button className="mt-4" size="sm" variant="secondary" onClick={() => { updateErpIntegration({ connected: !erp.connected }); toast.message(erp.connected ? "Disconnected mock ERP" : "Connected mock ERP"); }}>
            Toggle connection
          </Button>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs text-secondary uppercase">Last sync</p>
          <p className="mt-2 text-lg font-semibold">{formatRelative(erp.lastSync)}</p>
          <p className="text-sm text-secondary">{formatDate(erp.lastSync, "dd MMM yyyy HH:mm")}</p>
          <Badge tone={erp.syncStatus === "error" ? "red" : "green"} className="mt-2">{erp.syncStatus || "idle"}</Badge>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs text-secondary uppercase">Records synced</p>
          <p className="mt-2 text-lg font-semibold">{erp.recordsSynced?.toLocaleString() || 0}</p>
          {erp.lastError ? <p className="mt-2 text-sm text-red-600">{erp.lastError}</p> : null}
        </div>
      </div>

      <div className="card-surface p-4">
        <h3 className="font-semibold">Field mapping</h3>
        <DataTable
          columns={[
            { key: "nexusField", label: "Nexus field" },
            { key: "erpField", label: "Mock ERP field" },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={(erp.mappings || []).map((m, i) => ({ ...m, id: String(i) }))}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => { const r = runErpSync(false); toast.success(r.ok ? "Mock sync completed" : r.error); }}>Run mock sync</Button>
        <Button variant="danger" onClick={() => { runErpSync(true); toast.error("Simulated ERP error injected"); }}>Simulate sync error</Button>
      </div>
    </div>
  );
}
