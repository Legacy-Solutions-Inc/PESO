import type {
  EmploymentType,
  JobStatus,
} from "@/lib/validations/job-posting";

/** Shape of a job_postings row as returned by Supabase / Server Actions. */
export interface JobPostingRow {
  id: number;
  title: string;
  employer_name: string;
  description: string;
  location: string;
  employment_type: EmploymentType;
  salary_range_min: number | null;
  salary_range_max: number | null;
  application_deadline: string;
  contact_email: string | null;
  contact_phone: string | null;
  status: JobStatus;
  posted_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface JobListFilters {
  status?: JobStatus | "all";
  /** When set, only include rows whose deadline is within this many days. */
  deadlineWithinDays?: number;
  page: number;
  pageSize: number;
}

export interface JobListResult {
  jobs: JobPostingRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
