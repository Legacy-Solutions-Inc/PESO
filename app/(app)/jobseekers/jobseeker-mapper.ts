export interface RecentJobseeker {
  id: number;
  name: string;
  initials: string;
  sex: string;
  age: number | null;
  barangay: string;
  employmentStatus: string;
  dateRegistered: string;
}

export interface OptimizedJobseekerDBRecord {
  id: number;
  created_at: string;
  surname: string | null;
  first_name: string | null;
  date_of_birth: string | null;
  sex: string | null;
  barangay: string | null;
  employment_status: string | null;
}

/** Pure transformation function for testing */
export function mapRecentJobseeker(
  j: OptimizedJobseekerDBRecord
): RecentJobseeker {
  const surname = j.surname || "";
  const firstName = j.first_name || "";
  const name = [surname, firstName].filter(Boolean).join(", ") || "—";
  const initials =
    ((surname[0] || "") + (firstName[0] || "")).toUpperCase() || "—";

  const dateOfBirth = j.date_of_birth;
  let age: number | null = null;
  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
  }

  const sex = j.sex || "—";
  const barangay = j.barangay || "—";
  const employmentStatus =
    j.employment_status === "EMPLOYED"
      ? "Employed"
      : j.employment_status === "UNEMPLOYED"
        ? "Unemployed"
        : "—";

  const dateRegistered = new Date(j.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    id: j.id,
    name,
    initials,
    sex,
    age,
    barangay,
    employmentStatus,
    dateRegistered,
  };
}
