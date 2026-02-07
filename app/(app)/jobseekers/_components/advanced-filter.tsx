"use client";

import { useState } from "react";
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

  const handleApply = () => {
    onApply(filters);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <DialogTitle className="text-xl font-bold">Advanced Filters</DialogTitle>
          <p className="text-sm text-slate-500">
            Filter jobseekers by any field from the registration form
          </p>
        </DialogHeader>

        <Tabs
          defaultValue="basic"
          orientation="vertical"
          className="grid h-[600px] min-h-0 grid-cols-[11rem_1fr] overflow-hidden"
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
                <div>
                  <Label>Surname</Label>
                  <Input
                    value={filters.surname || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, surname: e.target.value })
                    }
                    placeholder="Search by surname"
                  />
                </div>
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={filters.firstName || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, firstName: e.target.value })
                    }
                    placeholder="Search by first name"
                  />
                </div>

                <div>
                  <Label>Age Min</Label>
                  <Input
                    type="number"
                    value={filters.ageMin || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, ageMin: e.target.value })
                    }
                    placeholder="e.g., 18"
                  />
                </div>
                <div>
                  <Label>Age Max</Label>
                  <Input
                    type="number"
                    value={filters.ageMax || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, ageMax: e.target.value })
                    }
                    placeholder="e.g., 65"
                  />
                </div>

                <div>
                  <Label>Sex</Label>
                  <Select
                    value={filters.sex || ALL_VALUE}
                    onValueChange={(value) =>
                      setFilters({ ...filters, sex: value === ALL_VALUE ? "" : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All</SelectItem>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Civil Status</Label>
                  <Select
                    value={filters.civilStatus || ALL_VALUE}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        civilStatus: value === ALL_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All</SelectItem>
                      <SelectItem value="SINGLE">Single</SelectItem>
                      <SelectItem value="MARRIED">Married</SelectItem>
                      <SelectItem value="WIDOWED">Widowed</SelectItem>
                      <SelectItem value="SEPARATED">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Barangay</Label>
                  <Input
                    value={filters.barangay || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, barangay: e.target.value })
                    }
                    placeholder="Search by barangay"
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={filters.city || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, city: e.target.value })
                    }
                    placeholder="Search by city"
                  />
                </div>
                <div>
                  <Label>Province</Label>
                  <Input
                    value={filters.province || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, province: e.target.value })
                    }
                    placeholder="Search by province"
                  />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input
                    value={filters.contactNumber || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, contactNumber: e.target.value })
                    }
                    placeholder="Search by contact"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={filters.email || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, email: e.target.value })
                    }
                    placeholder="Search by email"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Employment Tab */}
            <TabsContent value="employment" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Employment Status</Label>
                  <Select
                    value={filters.employmentStatus || ALL_VALUE}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        employmentStatus: value === ALL_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All</SelectItem>
                      <SelectItem value="EMPLOYED">Employed</SelectItem>
                      <SelectItem value="UNEMPLOYED">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Employed Type</Label>
                  <Select
                    value={filters.employedType || ALL_VALUE}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        employedType: value === ALL_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All</SelectItem>
                      <SelectItem value="WAGE">Wage Employed</SelectItem>
                      <SelectItem value="SELF_EMPLOYED">Self-Employed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Unemployed Reason</Label>
                  <Select
                    value={filters.unemployedReason || ALL_VALUE}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        unemployedReason: value === ALL_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All</SelectItem>
                      <SelectItem value="NEW_ENTRANT">New Entrant</SelectItem>
                      <SelectItem value="FINISHED_CONTRACT">Finished Contract</SelectItem>
                      <SelectItem value="RESIGNED">Resigned</SelectItem>
                      <SelectItem value="RETIRED">Retired</SelectItem>
                      <SelectItem value="TERMINATED_LOCAL">Terminated (Local)</SelectItem>
                      <SelectItem value="TERMINATED_ABROAD">Terminated (Abroad)</SelectItem>
                      <SelectItem value="TERMINATED_CALAMITY">Terminated (Calamity)</SelectItem>
                      <SelectItem value="OTHERS">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>OFW Status</Label>
                  <Select
                    value={filters.isOfw || ALL_VALUE}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        isOfw: value === ALL_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>4Ps Beneficiary</Label>
                  <Select
                    value={filters.is4PsBeneficiary || ALL_VALUE}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        is4PsBeneficiary: value === ALL_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>OFW Country</Label>
                  <Input
                    value={filters.ofwCountry || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, ofwCountry: e.target.value })
                    }
                    placeholder="Search by country"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Job Preference Tab */}
            <TabsContent value="job_preference" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Employment Type</Label>
                  <Select
                    value={filters.employmentType || ALL_VALUE}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        employmentType: value === ALL_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All</SelectItem>
                      <SelectItem value="PART_TIME">Part Time</SelectItem>
                      <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Preferred Occupation</Label>
                  <Input
                    value={filters.occupation1 || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, occupation1: e.target.value })
                    }
                    placeholder="Search by occupation"
                  />
                </div>

                <div>
                  <Label>Local Location</Label>
                  <Input
                    value={filters.localLocation || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, localLocation: e.target.value })
                    }
                    placeholder="Search by location"
                  />
                </div>

                <div>
                  <Label>Overseas Location</Label>
                  <Input
                    value={filters.overseasLocation || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, overseasLocation: e.target.value })
                    }
                    placeholder="Search by location"
                  />
                </div>
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
                  <div>
                    <Label>English</Label>
                    <Select
                      value={filters.englishProficiency || ALL_VALUE}
                      onValueChange={(value) =>
                        setFilters({
                          ...filters,
                          englishProficiency: value === ALL_VALUE ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_VALUE}>Any level</SelectItem>
                        <SelectItem value="read">Can Read</SelectItem>
                        <SelectItem value="write">Can Write</SelectItem>
                        <SelectItem value="speak">Can Speak</SelectItem>
                        <SelectItem value="understand">Can Understand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Filipino</Label>
                    <Select
                      value={filters.filipinoProficiency || ALL_VALUE}
                      onValueChange={(value) =>
                        setFilters({
                          ...filters,
                          filipinoProficiency: value === ALL_VALUE ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_VALUE}>Any level</SelectItem>
                        <SelectItem value="read">Can Read</SelectItem>
                        <SelectItem value="write">Can Write</SelectItem>
                        <SelectItem value="speak">Can Speak</SelectItem>
                        <SelectItem value="understand">Can Understand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Currently in School</Label>
                  <Select
                    value={filters.currentlyInSchool || ALL_VALUE}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        currentlyInSchool: value === ALL_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tertiary Course</Label>
                  <Input
                    value={filters.tertiaryCourse || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, tertiaryCourse: e.target.value })
                    }
                    placeholder="Search by course"
                  />
                </div>

                <div>
                  <Label>Senior High Strand</Label>
                  <Input
                    value={filters.seniorHighStrand || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, seniorHighStrand: e.target.value })
                    }
                    placeholder="Search by strand"
                  />
                </div>

                <div>
                  <Label>Graduate Course</Label>
                  <Input
                    value={filters.graduateCourse || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, graduateCourse: e.target.value })
                    }
                    placeholder="Search by course"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Training Tab */}
            <TabsContent value="training" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Training Course</Label>
                  <Input
                    value={filters.trainingCourse || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, trainingCourse: e.target.value })
                    }
                    placeholder="Search by training course"
                  />
                </div>

                <div>
                  <Label>Training Institution</Label>
                  <Input
                    value={filters.trainingInstitution || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, trainingInstitution: e.target.value })
                    }
                    placeholder="Search by institution"
                  />
                </div>

                <div>
                  <Label>Has Certificates</Label>
                  <Select
                    value={filters.hasCertificates || ALL_VALUE}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        hasCertificates: value === ALL_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All</SelectItem>
                      <SelectItem value="NC_I">NC I</SelectItem>
                      <SelectItem value="NC_II">NC II</SelectItem>
                      <SelectItem value="NC_III">NC III</SelectItem>
                      <SelectItem value="NC_IV">NC IV</SelectItem>
                      <SelectItem value="COC">COC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Eligibility Tab */}
            <TabsContent value="eligibility" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Civil Service Exam</Label>
                  <Input
                    value={filters.civilServiceExam || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, civilServiceExam: e.target.value })
                    }
                    placeholder="Search by exam name"
                  />
                </div>

                <div>
                  <Label>Professional License</Label>
                  <Input
                    value={filters.professionalLicense || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, professionalLicense: e.target.value })
                    }
                    placeholder="Search by license"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Work Experience Tab */}
            <TabsContent value="work_experience" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={filters.companyName || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, companyName: e.target.value })
                    }
                    placeholder="Search by company"
                  />
                </div>

                <div>
                  <Label>Position</Label>
                  <Input
                    value={filters.position || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, position: e.target.value })
                    }
                    placeholder="Search by position"
                  />
                </div>

                <div>
                  <Label>Work Employment Status</Label>
                  <Select
                    value={filters.workEmploymentStatus || ALL_VALUE}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        workEmploymentStatus: value === ALL_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All</SelectItem>
                      <SelectItem value="PERMANENT">Permanent</SelectItem>
                      <SelectItem value="CONTRACTUAL">Contractual</SelectItem>
                      <SelectItem value="PART_TIME">Part Time</SelectItem>
                      <SelectItem value="PROBATIONARY">Probationary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Skill Type</Label>
                  <Select
                    value={filters.skillType || ALL_VALUE}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        skillType: value === ALL_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All skills" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All skills</SelectItem>
                      <SelectItem value="auto_mechanic">Auto Mechanic</SelectItem>
                      <SelectItem value="beautician">Beautician</SelectItem>
                      <SelectItem value="carpentry_work">Carpentry Work</SelectItem>
                      <SelectItem value="computer_literate">Computer Literate</SelectItem>
                      <SelectItem value="domestic_chores">Domestic Chores</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="electrician">Electrician</SelectItem>
                      <SelectItem value="embroidery">Embroidery</SelectItem>
                      <SelectItem value="gardening">Gardening</SelectItem>
                      <SelectItem value="masonry">Masonry</SelectItem>
                      <SelectItem value="painter_artist">Painter/Artist</SelectItem>
                      <SelectItem value="painting_jobs">Painting Jobs</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="sewing_dresses">Sewing Dresses</SelectItem>
                      <SelectItem value="stenography">Stenography</SelectItem>
                      <SelectItem value="tailoring">Tailoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>PESO Referral Program</Label>
                  <Select
                    value={filters.referralProgram || ALL_VALUE}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        referralProgram: value === ALL_VALUE ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All programs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All programs</SelectItem>
                      <SelectItem value="spes">SPES</SelectItem>
                      <SelectItem value="gip">GIP</SelectItem>
                      <SelectItem value="tupad">TUPAD</SelectItem>
                      <SelectItem value="jobstart">JobStart</SelectItem>
                      <SelectItem value="dileep">DILEEP</SelectItem>
                      <SelectItem value="tesda_training">TESDA Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
