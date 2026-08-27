export function required(value, label = "This field") {
  if (value == null || String(value).trim() === "") return `${label} is required`;
  return "";
}

export function email(value) {
  if (!value) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email";
  return "";
}

export function password(value) {
  if (!value) return "Password is required";
  if (String(value).length < 6) return "Password must be at least 6 characters";
  return "";
}

export function percentPair(companyShare, ugcShare) {
  const a = Number(companyShare);
  const b = Number(ugcShare);
  if (Number.isNaN(a) || Number.isNaN(b)) return "Shares must be numbers";
  if (a < 0 || b < 0 || a > 100 || b > 100) return "Shares must be between 0 and 100";
  if (Math.round(a + b) !== 100) return "Company share plus UGC share must equal 100%";
  return "";
}

export function dateOrder(start, end) {
  if (!start || !end) return "";
  if (new Date(end) < new Date(start)) return "End date cannot be before start date";
  return "";
}

export function validateLogin(values) {
  return {
    email: email(values.email),
    password: password(values.password),
  };
}
