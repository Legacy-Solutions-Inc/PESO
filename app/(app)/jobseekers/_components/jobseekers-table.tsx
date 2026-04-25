"use client";

import { useState, useTransition, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, Eye, Edit, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
import { DeleteRowAction } from "./delete-row-action";

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
  currentUserRole: "admin" | "encoder" | "viewer";
}

export function JobseekersTable({
  initialData,
  initialTotal,
  initialPage,
  pageSize,
  currentUserRole,
}: JobseekersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const isAdmin = currentUserRole === "admin";
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleClearSearch = () => {
    setSearchValue("");
    handleSearch("");
    inputRef.current?.focus();
  };

  const handleFilterApply = (filters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
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
    <TooltipProvider>
      {/* Search & Actions Bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-sm md:flex-row">
        <div className="group relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            ref={inputRef}
            type="search"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search by surname or first name…"
            aria-label="Search jobseekers by name"
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
            className="pl-10 pr-8"
          />
          {searchValue && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 min-h-11 min-w-11 -translate-y-1/2 text-slate-400 hover:text-slate-600 active:bg-slate-100 active:opacity-80"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear search</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(true)}
            className="min-h-11"
          >
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
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {isPending && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-card/60 backdrop-blur-[1px]"
          >
            <span className="rounded-md bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              Loading…
            </span>
          </div>
        )}
        <div
          className={cn("overflow-x-auto transition-opacity", isPending && "opacity-50")}
          aria-busy={isPending}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 py-3">
                  <Checkbox
                    checked={
                      selectedIds.size === initialData.length &&
                      initialData.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Age</TableHead>
                <TableHead className="hidden lg:table-cell">Sex</TableHead>
                <TableHead className="hidden md:table-cell">Barangay</TableHead>
                <TableHead>Employment Status</TableHead>
                <TableHead className="hidden lg:table-cell">Date Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                      <p className="text-slate-500">No jobseekers found</p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-11"
                          onClick={() => {
                            setSearchValue("");
                            router.push("/jobseekers");
                          }}
                        >
                          Clear Filters
                        </Button>
                        {initialPage > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-h-11"
                            onClick={() => handlePageChange(initialPage - 1)}
                          >
                            Go to previous page
                          </Button>
                        )}
                      </div>
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
                      className="hover:bg-primary/5 active:bg-primary/10 focus-within:bg-primary/5"
                    >
                      <TableCell className="py-3">
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
                              <span className="hidden sm:inline">ID: </span>NSRP-{jobseeker.id}
                            </div>
                            <div className="mt-0.5 text-xs text-slate-500 md:hidden">
                              {age} · {jobseeker.sex} · {barangay}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden tabular-nums md:table-cell">{age}</TableCell>
                      <TableCell className="hidden lg:table-cell">{jobseeker.sex}</TableCell>
                      <TableCell className="hidden md:table-cell">{barangay}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                            jobseeker.employment_status === "EMPLOYED" &&
                              "border-status-positive/30 bg-status-positive/10 text-status-positive",
                            jobseeker.employment_status === "UNEMPLOYED" &&
                              "border-status-warning/30 bg-status-warning/10 text-status-warning",
                            jobseeker.employment_status !== "EMPLOYED" &&
                              jobseeker.employment_status !== "UNEMPLOYED" &&
                              "border-border bg-muted text-muted-foreground"
                          )}
                        >
                          {jobseeker.employment_status}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatDate(new Date(jobseeker.created_at))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="min-h-11 min-w-11"
                                aria-label={`View details for ${jobseeker.first_name} ${jobseeker.surname}`}
                                asChild
                              >
                                <Link
                                  href={`/jobseekers/${jobseeker.id}`}
                                  aria-label={`View details for ${jobseeker.first_name} ${jobseeker.surname}`}
                                >
                                  <Eye className="size-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View details</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="min-h-11 min-w-11"
                                aria-label={`Edit record for ${jobseeker.first_name} ${jobseeker.surname}`}
                                asChild
                              >
                                <Link
                                  href={`/jobseekers/${jobseeker.id}/edit`}
                                  aria-label={`Edit record for ${jobseeker.first_name} ${jobseeker.surname}`}
                                >
                                  <Edit className="size-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit record</p>
                            </TooltipContent>
                          </Tooltip>

                          <DeleteRowAction
                            id={jobseeker.id}
                            surname={jobseeker.surname}
                            firstName={jobseeker.first_name}
                            isAdmin={isAdmin}
                          />
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
          <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="text-sm text-slate-500">
              Showing {startRecord} to {endRecord} of {initialTotal} results
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="min-h-11 min-w-11 sm:min-w-0"
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
                      className="min-h-11 min-w-11"
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
                className="min-h-11 min-w-11 sm:min-w-0"
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
    </TooltipProvider>
  );
}
