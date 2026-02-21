export const escapeCSV = (val: unknown): string => {
  if (val === null || val === undefined) return "";

  let str: string;
  if (typeof val === "string") {
    str = val;
  } else {
    str = String(val);
  }

  // Prevent CSV injection: starts with =, +, -, @
  // Optimized using charCodeAt(0)
  // = is 61, + is 43, - is 45, @ is 64
  const firstChar = str.charCodeAt(0);
  if (
    firstChar === 61 ||
    firstChar === 43 ||
    firstChar === 45 ||
    firstChar === 64
  ) {
    str = `'${str}`;
  }

  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
};

export const getTraining = (
  trainingEntries: Array<Record<string, unknown>>,
  index: number
): string[] => {
  const t = trainingEntries[index] || {};
  const certs = (t.certificates || {}) as Record<string, unknown>;
  return [
    escapeCSV(t.course),
    escapeCSV(t.hours),
    escapeCSV(t.institution),
    escapeCSV(t.skillsAcquired),
    certs.NC_I ? "Yes" : "No",
    certs.NC_II ? "Yes" : "No",
    certs.NC_III ? "Yes" : "No",
    certs.NC_IV ? "Yes" : "No",
    certs.COC ? "Yes" : "No",
  ];
};

export const getCivilService = (
  civilService: Array<Record<string, unknown>>,
  index: number
): string[] => {
  const cs = civilService[index] || {};
  return [escapeCSV(cs.name), escapeCSV(cs.dateTaken)];
};

export const getProfLicense = (
  profLicense: Array<Record<string, unknown>>,
  index: number
): string[] => {
  const pl = profLicense[index] || {};
  return [escapeCSV(pl.name), escapeCSV(pl.validUntil)];
};

export const getWorkExp = (
  workEntries: Array<Record<string, unknown>>,
  index: number
): string[] => {
  const we = workEntries[index] || {};
  return [
    escapeCSV(we.companyName),
    escapeCSV(we.address),
    escapeCSV(we.position),
    escapeCSV(we.numberOfMonths),
    escapeCSV(we.employmentStatus),
  ];
};
