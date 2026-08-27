export function downloadCsv(filename, rows = [], columns = []) {
  const cols = columns.length
    ? columns
    : Object.keys(rows[0] || {}).map((key) => ({ key, label: key }));
  const header = cols.map((c) => escapeCsv(c.label)).join(",");
  const body = rows
    .map((row) => cols.map((c) => escapeCsv(row[c.key])).join(","))
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

export function downloadText(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  triggerDownload(blob, filename);
}

export function downloadIcs({ title, description, start, end }) {
  const stamp = (d) =>
    new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nexus Prototype//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@nexus.demo`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start || new Date())}`,
    `DTEND:${stamp(end || new Date(Date.now() + 3600000))}`,
    `SUMMARY:${title || "Nexus event"}`,
    `DESCRIPTION:${description || "Simulated Nexus calendar event"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  downloadText(`${slug(title || "event")}.ics`, ics, "text/calendar");
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function slug(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
