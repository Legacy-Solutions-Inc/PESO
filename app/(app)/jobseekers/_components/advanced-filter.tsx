"use client";

import { useState, useId } from "react";
import {
  User,
  Briefcase,
  Target,
  Languages,
  GraduationCap,
  Award,
  FileCheck,
  Building2,
  Wrench,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SEX_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  EMPLOYED_TYPE_OPTIONS,
  UNEMPLOYED_REASON_OPTIONS,
  BOOLEAN_FILTER_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  PROFICIENCY_OPTIONS,
  CERTIFICATE_OPTIONS,
  WORK_EMPLOYMENT_STATUS_OPTIONS,
  SKILL_TYPE_OPTIONS,
  REFERRAL_PROGRAM_OPTIONS
} from "@/lib/constants";


// Sentinel for "All" / "Any" options; Select.Item cannot use value=""
const ALL_VALUE = "__all__";

const FILTER_SECTIONS = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "employment", label: "Employment", icon: Briefcase },
  { id: "job_preference", label: "Job Preference", icon: Target },
  { id: "language", label: "Language", icon: Languages },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "training", label: "Training", icon: Award },
  { id: "eligibility", label: "Eligibility", icon: FileCheck },
  { id: "work_experience", label: "Work Experience", icon: Building2 },
  { id: "skills", label: "Skills", icon: Wrench },
];

interface FilterFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "select";
  options?: readonly { label: string; value: string }[];
}

function FilterField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  options,
}: FilterFieldProps) {
  const id = useId();

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {type === "select" ? (
        <Select
          value={value || ALL_VALUE}
          onValueChange={(v) => onChange(v === ALL_VALUE ? "" : v)}
        >
          <SelectTrigger id={id}>
            <SelectValue placeholder={placeholder || "All"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>{placeholder || "All"}</SelectItem>
            {options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

interface AdvancedFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: Record<string, string>) => void;
  currentFilters: Record<string, string>;
}

export function AdvancedFilter({
  open,
  onOpenChange,
  onApply,
  currentFilters,
}: AdvancedFilterProps) {
  const [filters, setFilters] = useState(currentFilters);

  const handleReset = () => {
    setFilters({});
  };

  const updateFilter = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onApply(filters);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <DialogTitle className="text-xl font-bold">Advanced Filters</DialogTitle>
          <p className="text-sm text-slate-500">
            Filter jobseekers by any field from the registration form
          </p>
        </DialogHeader>

        <Tabs
          defaultValue="basic"
          orientation="vertical"
          className="grid h-150 min-h-0 grid-cols-[11rem_1fr] overflow-hidden"
        >
          <TabsList className="flex h-full w-full flex-col justify-start gap-0.5 overflow-y-auto rounded-none border-r border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/50">
            {FILTER_SECTIONS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="w-full justify-start gap-2 rounded-md px-3 py-2 text-left"
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-w-0 overflow-hidden">
            <ScrollArea className="h-full w-full p-6">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FilterField
                  label="Surname"
                  value={filters.surname}
                  onChange={(v) => updateFilter("surname", v)}
                  placeholder="Search by surname"
                />
                <FilterField
                  label="First Name"
                  value={filters.firstName}
                  onChange={(v) => updateFilter("firstName", v)}
                  placeholder="Search by first name"
                />
                <FilterField
                  label="Age Min"
                  type="number"
                  value={filters.ageMin}
                  onChange={(v) => updateFilter("ageMin", v)}
                  placeholder="e.g., 18"
                />
                <FilterField
                  label="Age Max"
                  type="number"
                  value={filters.ageMax}
                  onChange={(v) => updateFilter("ageMax", v)}
                  placeholder="e.g., 65"
                />
                <FilterField
                  label="Sex"
                  type="select"
                  options={SEX_OPTIONS}
                  value={filters.sex}
                  onChange={(v) => updateFilter("sex", v)}
                />
                <FilterField
                  label="Civil Status"
                  type="select"
                  options={CIVIL_STATUS_OPTIONS}
                  value={filters.civilStatus}
                  onChange={(v) => updateFilter("civilStatus", v)}
                />
                <FilterField
                  label="Barangay"
                  value={filters.barangay}
                  onChange={(v) => updateFilter("barangay", v)}
                  placeholder="Search by barangay"
                />
                <FilterField
                  label="City"
                  value={filters.city}
                  onChange={(v) => updateFilter("city", v)}
                  placeholder="Search by city"
                />
                <FilterField
                  label="Province"
                  value={filters.province}
                  onChange={(v) => updateFilter("province", v)}
                  placeholder="Search by province"
                />
                <FilterField
                  label="Contact Number"
                  value={filters.contactNumber}
                  onChange={(v) => updateFilter("contactNumber", v)}
                  placeholder="Search by contact"
                />
                <FilterField
                  label="Email"
                  value={filters.email}
                  onChange={(v) => updateFilter("email", v)}
                  placeholder="Search by email"
                />
              </div>
            </TabsContent>

            {/* Employment Tab */}
            <TabsContent value="employment" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FilterField
                  label="Employment Status"
                  type="select"
                  options={EMPLOYMENT_STATUS_OPTIONS}
                  value={filters.employmentStatus}
                  onChange={(v) => updateFilter("employmentStatus", v)}
                />
                <FilterField
                  label="Employed Type"
                  type="select"
                  options={EMPLOYED_TYPE_OPTIONS}
                  value={filters.employedType}
                  onChange={(v) => updateFilter("employedType", v)}
                />
                <FilterField
                  label="Unemployed Reason"
                  type="select"
                  options={UNEMPLOYED_REASON_OPTIONS}
                  value={filters.unemployedReason}
                  onChange={(v) => updateFilter("unemployedReason", v)}
                />
                <FilterField
                  label="OFW Status"
                  type="select"
                  options={BOOLEAN_FILTER_OPTIONS}
                  value={filters.isOfw}
                  onChange={(v) => updateFilter("isOfw", v)}
                />
                <FilterField
                  label="4Ps Beneficiary"
                  type="select"
                  options={BOOLEAN_FILTER_OPTIONS}
                  value={filters.is4PsBeneficiary}
                  onChange={(v) => updateFilter("is4PsBeneficiary", v)}
                />
                <FilterField
                  label="OFW Country"
                  value={filters.ofwCountry}
                  onChange={(v) => updateFilter("ofwCountry", v)}
                  placeholder="Search by country"
                />
              </div>
            </TabsContent>

            {/* Job Preference Tab */}
            <TabsContent value="job_preference" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FilterField
                  label="Employment Type"
                  type="select"
                  options={EMPLOYMENT_TYPE_OPTIONS}
                  value={filters.employmentType}
                  onChange={(v) => updateFilter("employmentType", v)}
                />
                <FilterField
                  label="Preferred Occupation"
                  value={filters.occupation1}
                  onChange={(v) => updateFilter("occupation1", v)}
                  placeholder="Search by occupation"
                />
                <FilterField
                  label="Local Location"
                  value={filters.localLocation}
                  onChange={(v) => updateFilter("localLocation", v)}
                  placeholder="Search by location"
                />
                <FilterField
                  label="Overseas Location"
                  value={filters.overseasLocation}
                  onChange={(v) => updateFilter("overseasLocation", v)}
                  placeholder="Search by location"
                />
              </div>
            </TabsContent>

            {/* Language Tab */}
            <TabsContent value="language" className="mt-0 space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label className="text-base font-semibold">Language Proficiency</Label>
                  <p className="text-sm text-slate-500">
                    Filter by languages the jobseeker can read, write, speak, or understand
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FilterField
                    label="English"
                    type="select"
                    options={PROFICIENCY_OPTIONS}
                    value={filters.englishProficiency}
                    onChange={(v) => updateFilter("englishProficiency", v)}
                    placeholder="Any level"
                  />
                  <FilterField
                    label="Filipino"
                    type="select"
                    options={PROFICIENCY_OPTIONS}
                    value={filters.filipinoProficiency}
                    onChange={(v) => updateFilter("filipinoProficiency", v)}
                    placeholder="Any level"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FilterField
                  label="Currently in School"
                  type="select"
                  options={BOOLEAN_FILTER_OPTIONS}
                  value={filters.currentlyInSchool}
                  onChange={(v) => updateFilter("currentlyInSchool", v)}
                />
                <FilterField
                  label="Tertiary Course"
                  value={filters.tertiaryCourse}
                  onChange={(v) => updateFilter("tertiaryCourse", v)}
                  placeholder="Search by course"
                />
                <FilterField
                  label="Senior High Strand"
                  value={filters.seniorHighStrand}
                  onChange={(v) => updateFilter("seniorHighStrand", v)}
                  placeholder="Search by strand"
                />
                <FilterField
                  label="Graduate Course"
                  value={filters.graduateCourse}
                  onChange={(v) => updateFilter("graduateCourse", v)}
                  placeholder="Search by course"
                />
              </div>
            </TabsContent>

            {/* Training Tab */}
            <TabsContent value="training" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FilterField
                  label="Training Course"
                  value={filters.trainingCourse}
                  onChange={(v) => updateFilter("trainingCourse", v)}
                  placeholder="Search by training course"
                />
                <FilterField
                  label="Training Institution"
                  value={filters.trainingInstitution}
                  onChange={(v) => updateFilter("trainingInstitution", v)}
                  placeholder="Search by institution"
                />
                <FilterField
                  label="Has Certificates"
                  type="select"
                  options={CERTIFICATE_OPTIONS}
                  value={filters.hasCertificates}
                  onChange={(v) => updateFilter("hasCertificates", v)}
                />
              </div>
            </TabsContent>

            {/* Eligibility Tab */}
            <TabsContent value="eligibility" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FilterField
                  label="Civil Service Exam"
                  value={filters.civilServiceExam}
                  onChange={(v) => updateFilter("civilServiceExam", v)}
                  placeholder="Search by exam name"
                />
                <FilterField
                  label="Professional License"
                  value={filters.professionalLicense}
                  onChange={(v) => updateFilter("professionalLicense", v)}
                  placeholder="Search by license"
                />
              </div>
            </TabsContent>

            {/* Work Experience Tab */}
            <TabsContent value="work_experience" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FilterField
                  label="Company Name"
                  value={filters.companyName}
                  onChange={(v) => updateFilter("companyName", v)}
                  placeholder="Search by company"
                />
                <FilterField
                  label="Position"
                  value={filters.position}
                  onChange={(v) => updateFilter("position", v)}
                  placeholder="Search by position"
                />
                <FilterField
                  label="Work Employment Status"
                  type="select"
                  options={WORK_EMPLOYMENT_STATUS_OPTIONS}
                  value={filters.workEmploymentStatus}
                  onChange={(v) => updateFilter("workEmploymentStatus", v)}
                />
              </div>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FilterField
                  label="Skill Type"
                  type="select"
                  options={SKILL_TYPE_OPTIONS}
                  value={filters.skillType}
                  onChange={(v) => updateFilter("skillType", v)}
                  placeholder="All skills"
                />
                <FilterField
                  label="PESO Referral Program"
                  type="select"
                  options={REFERRAL_PROGRAM_OPTIONS}
                  value={filters.referralProgram}
                  onChange={(v) => updateFilter("referralProgram", v)}
                  placeholder="All programs"
                />
              </div>
            </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>

        <div className="flex justify-between border-t px-6 py-4">
          <Button variant="outline" onClick={handleReset}>
            Reset All Filters
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply Filters</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
