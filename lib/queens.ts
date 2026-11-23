export const QUEENS_DOMAIN = "queensu.ca";

/** True for queensu.ca and any subdomain (e.g. cs.queensu.ca). */
export function isQueensEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return domain === QUEENS_DOMAIN || domain.endsWith(`.${QUEENS_DOMAIN}`);
}

export const FACULTIES = [
  { value: "ARTSCI", label: "Artsci" },
  { value: "ENGINEERING", label: "Engineering" },
  { value: "COMMERCE", label: "Commerce" },
  { value: "HEALTH_SCI", label: "Health Sci" },
  { value: "LAW", label: "Law" },
  { value: "GRAD", label: "Grad" },
  { value: "ALUMNI", label: "Alumni" },
] as const;

export const VENUE_PRESETS = [
  "Leonard Hall",
  "Grant Hall",
  "The ARC",
  "Richardson Stadium",
  "Clark Hall Pub",
  "The Mansion",
  "Ale House",
  "Stages",
  "Campus residences",
] as const;
