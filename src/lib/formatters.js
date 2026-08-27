import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";
import { MATCH_BANDS, DEFAULT_CURRENCY } from "./constants";

export function formatDate(value, pattern = "dd MMM yyyy") {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "—";
  return format(date, pattern);
}

export function formatRelative(value) {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatCurrency(amount, currency = DEFAULT_CURRENCY) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  } catch {
    return `${currency} ${Number(amount).toLocaleString("en-BD")}`;
  }
}

export function formatPercent(value) {
  if (value == null) return "—";
  return `${Math.round(Number(value))}%`;
}

export function getMatchBand(score) {
  const s = Number(score) || 0;
  return MATCH_BANDS.find((b) => s >= b.min && s <= b.max) || MATCH_BANDS[MATCH_BANDS.length - 1];
}

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(text, length = 120) {
  const s = String(text || "");
  if (s.length <= length) return s;
  return `${s.slice(0, length - 1)}…`;
}

export function fileSizeLabel(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
