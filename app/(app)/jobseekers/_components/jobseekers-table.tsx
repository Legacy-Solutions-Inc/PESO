"use client";

import { useState, useTransition, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return `${m} ${d.toString().padStart(2, "0")}, ${y}`;
}
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdvancedFilter } from "./advanced-filter";
import { ExportButton } from "./export-button";
import { BulkActions } from "./bulk-actions";

interface JobseekerRecord {
  id: number;
  surname: string;
  first_name: string;
  sex: string;
  employment_status: string;
  city: string;
  province: string;
  is_ofw: boolean;
  is_4ps_beneficiary: boolean;
  created_at: string;
  personal_info: {
    dateOfBirth?: string;
    address?: {
      barangay?: string;
    };
  };
}

interface JobseekersTableProps {
  initialData: JobseekerRecord[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
}

export function JobseekersTable({
  initialData,
  initialTotal,
  initialPage,
  pageSize,
}: JobseekersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dob: string | undefined) => {
    if (!dob) return "N/A";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSearch = useCallback(
    (search: string) => {
      const params = new URLSearchParams(searchParams);
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      startTransition(() => {
        router.push(`/jobseekers?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleFilterApply = (filters: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });
    params.set("page", "1");
    startTransition(() => {
      router.push(`/jobseekers?${params.toString()}`);
    });
    setIsFilterOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    startTransition(() => {
      router.push(`/jobseekers?${params.toString()}`);
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === initialData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(initialData.map((j) => j.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Extract current filters from URL
  const currentFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== "page") {
        filters[key] = value;
      }
    });
    return filters;
  }, [searchParams]);

  const totalPages = Math.ceil(initialTotal / pageSize);
  const startRecord = (initialPage - 1) * pageSize + 1;
  const endRecord = Math.min(initialPage * pageSize, initialTotal);

  return (
    <>
      {/* Search & Actions Bar */}
      <div className="glass-panel mb-6 flex flex-col gap-4 rounded-xl p-4 md:flex-row">
        <div className="group relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, ID, or email..."
            aria-label="Search jobseekers"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);

              if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
              }

              searchTimeoutRef.current = setTimeout(() => {
                handleSearch(value);
              }, 500);
            }}
            className="pl-10"
          />
        </div>

        <div className="flex w-full items-center gap-3 md:w-auto">
          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <Filter className="size-4" />
            Filter
          </Button>

          <ExportButton
            filters={Object.fromEntries(
              Object.entries(currentFilters).filter(
                ([k]) => k !== "page" && k !== "pageSize"
              )
            )}
          />

          {selectedIds.size > 0 && (
            <BulkActions
              selectedIds={Array.from(selectedIds)}
              onComplete={() => setSelectedIds(new Set())}
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedIds.size === initialData.length &&
                      initialData.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Barangay</TableHead>
                <TableHead>Employment Status</TableHead>
                <TableHead>Date Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-slate-500">No jobseekers found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchValue("");
                          router.push("/jobseekers");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                initialData.map((jobseeker) => {
                  const age = calculateAge(jobseeker.personal_info?.dateOfBirth);
                  const barangay =
                    jobseeker.personal_info?.address?.barangay || "N/A";

                  return (
                    <TableRow
                      key={jobseeker.id}
                      className="hover:bg-primary/5"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(jobseeker.id)}
                          onCheckedChange={() => toggleSelect(jobseeker.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {jobseeker.surname[0]}
                              {jobseeker.first_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">
                              {jobseeker.surname}, {jobseeker.first_name}
                            </div>
                            <div className="text-xs text-slate-500">
                              ID: NSRP-{jobseeker.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">{age}</TableCell>
                      <TableCell>{jobseeker.sex}</TableCell>
                      <TableCell>{barangay}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            jobseeker.employment_status === "EMPLOYED"
                              ? "default"
                              : "secondary"
                          }
                          className={cn(
                            jobseeker.employment_status === "EMPLOYED" &&
                              "bg-emerald-500 hover:bg-emerald-600",
                            jobseeker.employment_status === "UNEMPLOYED" &&
                              "bg-rose-500 hover:bg-rose-600"
                          )}
                        >
                          {jobseeker.employment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(new Date(jobseeker.created_at))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View details"
                            aria-label={`View details for ${jobseeker.first_name} ${jobseeker.surname}`}
                            asChild
                          >
                            <Link href={`/jobseekers/${jobseeker.id}`}>
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit record"
                            aria-label={`Edit record for ${jobseeker.first_name} ${jobseeker.surname}`}
                            asChild
                          >
                            <Link href={`/jobseekers/${jobseeker.id}/edit`}>
                              <Edit className="size-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {initialTotal > 0 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-slate-500">
              Showing {startRecord} to {endRecord} of {initialTotal} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(initialPage - 1)}
                disabled={initialPage <= 1 || isPending}
                aria-label="Go to previous page"
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (initialPage <= 3) {
                    pageNum = i + 1;
                  } else if (initialPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = initialPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={initialPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isPending}
                      className="min-w-10"
                      aria-label={
                        initialPage === pageNum
                          ? `Current page, page ${pageNum}`
                          : `Go to page ${pageNum}`
                      }
                      aria-current={initialPage === pageNum ? "page" : undefined}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(initialPage + 1)}
                disabled={initialPage >= totalPages || isPending}
                aria-label="Go to next page"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filter Dialog */}
      <AdvancedFilter
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onApply={handleFilterApply}
        currentFilters={currentFilters}
      />
    </>
  );
}
