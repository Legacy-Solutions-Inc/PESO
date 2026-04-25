"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, Loader2, Power, PowerOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  activateJobPosting,
  archiveJobPosting,
  closeJobPosting,
  createJobPosting,
  updateJobPosting,
} from "../actions";
import {
  JOB_DESCRIPTION_MAX,
  jobPostingInputSchema,
  type EmploymentType,
  type JobPostingInput,
  type JobStatus,
} from "@/lib/validations/job-posting";

const EMPLOYMENT_TYPE_OPTIONS: Array<{
  value: EmploymentType;
  label: string;
}> = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "INTERNSHIP", label: "Internship" },
];

interface JobsComposeFormProps {
  mode: "new" | "edit";
  initial?: {
    id: number;
    status: JobStatus;
    values: JobPostingInput;
  };
}

type SubmitIntent = "save" | "activate" | "close" | "archive";

const EMPTY_DEFAULTS: JobPostingInput = {
  title: "",
  employer_name: "",
  description: "",
  location: "",
  employment_type: "FULL_TIME",
  salary_range_min: null,
  salary_range_max: null,
  application_deadline: "",
  contact_email: null,
  contact_phone: null,
};

export function JobsComposeForm({ mode, initial }: JobsComposeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const status = initial?.status ?? "draft";
  const showActivate = mode === "edit" && status !== "active";
  const showClose = mode === "edit" && status === "active";
  const showArchive = mode === "edit" && status !== "archived";

  const form = useForm<JobPostingInput>({
    resolver: zodResolver(jobPostingInputSchema),
    defaultValues: initial?.values ?? EMPTY_DEFAULTS,
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const description = watch("description") ?? "";
  const employmentType = watch("employment_type");

  function onSubmit(intent: SubmitIntent) {
    return handleSubmit((values) => {
      setServerError(null);
      startTransition(async () => {
        const payload = {
          ...values,
          salary_range_min:
            values.salary_range_min === null ||
            (typeof values.salary_range_min === "string" &&
              (values.salary_range_min as unknown as string) === "")
              ? null
              : Number(values.salary_range_min),
          salary_range_max:
            values.salary_range_max === null ||
            (typeof values.salary_range_max === "string" &&
              (values.salary_range_max as unknown as string) === "")
              ? null
              : Number(values.salary_range_max),
        };

        let postingId = initial?.id;

        if (mode === "new") {
          const created = await createJobPosting(payload);
          if (!created.data) {
            setServerError(created.error ?? "Could not create posting");
            toast({
              title: "Could not save",
              description: created.error,
            });
            return;
          }
          postingId = created.data.id;
        } else {
          if (postingId === undefined) {
            setServerError("Internal error: missing id");
            return;
          }
          const updated = await updateJobPosting(postingId, payload);
          if (!updated.data) {
            setServerError(updated.error ?? "Could not save");
            toast({
              title: "Could not save",
              description: updated.error,
            });
            return;
          }
        }

        if (postingId === undefined) return;

        if (intent !== "save") {
          const action =
            intent === "activate"
              ? activateJobPosting
              : intent === "close"
                ? closeJobPosting
                : archiveJobPosting;
          const r = await action(postingId);
          if (r.error) {
            toast({
              title: "Status change failed",
              description: r.error,
            });
            return;
          }
        }

        toast({
          title:
            intent === "activate"
              ? "Posting activated"
              : intent === "close"
                ? "Posting closed"
                : intent === "archive"
                  ? "Posting archived"
                  : "Saved",
        });
        if (mode === "new") {
          router.replace(`/admin/jobs/${postingId}/edit`);
        } else {
          router.refresh();
        }
      });
    });
  }

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register("title")}
            disabled={isPending}
            placeholder="Job title"
          />
          {errors.title ? (
            <p className="mt-1 text-[12px] text-destructive">
              {errors.title.message}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="employer_name">Employer</Label>
          <Input
            id="employer_name"
            {...register("employer_name")}
            disabled={isPending}
            placeholder="Hiring organization"
          />
          {errors.employer_name ? (
            <p className="mt-1 text-[12px] text-destructive">
              {errors.employer_name.message}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register("location")}
            disabled={isPending}
            placeholder="City, province, or remote"
          />
          {errors.location ? (
            <p className="mt-1 text-[12px] text-destructive">
              {errors.location.message}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="employment_type">Employment type</Label>
          <Select
            value={employmentType}
            onValueChange={(v) =>
              setValue("employment_type", v as EmploymentType, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={isPending}
          >
            <SelectTrigger id="employment_type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="application_deadline">Application deadline</Label>
          <Input
            id="application_deadline"
            type="date"
            {...register("application_deadline")}
            disabled={isPending}
          />
          {errors.application_deadline ? (
            <p className="mt-1 text-[12px] text-destructive">
              {errors.application_deadline.message}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="salary_range_min">Salary minimum (PHP)</Label>
          <Input
            id="salary_range_min"
            type="number"
            min={0}
            {...register("salary_range_min", {
              setValueAs: (v) =>
                v === "" || v === null || v === undefined ? null : Number(v),
            })}
            disabled={isPending}
            placeholder="Optional"
          />
        </div>

        <div>
          <Label htmlFor="salary_range_max">Salary maximum (PHP)</Label>
          <Input
            id="salary_range_max"
            type="number"
            min={0}
            {...register("salary_range_max", {
              setValueAs: (v) =>
                v === "" || v === null || v === undefined ? null : Number(v),
            })}
            disabled={isPending}
            placeholder="Optional"
          />
          {errors.salary_range_max ? (
            <p className="mt-1 text-[12px] text-destructive">
              {errors.salary_range_max.message}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="contact_email">Contact email</Label>
          <Input
            id="contact_email"
            type="email"
            {...register("contact_email", {
              setValueAs: (v) => (v === "" ? null : v),
            })}
            disabled={isPending}
            placeholder="Optional"
          />
          {errors.contact_email ? (
            <p className="mt-1 text-[12px] text-destructive">
              {errors.contact_email.message}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="contact_phone">Contact phone</Label>
          <Input
            id="contact_phone"
            {...register("contact_phone", {
              setValueAs: (v) => (v === "" ? null : v),
            })}
            disabled={isPending}
            placeholder="Optional"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            disabled={isPending}
            rows={10}
            placeholder="Plain text — line breaks are preserved."
          />
          <div className="mt-1 flex items-center justify-between text-[12px] text-muted-foreground">
            <span>URLs become links automatically. No HTML or markdown.</span>
            <span data-tabular>
              {description.length}/{JOB_DESCRIPTION_MAX}
            </span>
          </div>
          {errors.description ? (
            <p className="mt-1 text-[12px] text-destructive">
              {errors.description.message}
            </p>
          ) : null}
        </div>
      </div>

      {serverError ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive"
        >
          {serverError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-6">
        <Button
          type="button"
          onClick={onSubmit("save")}
          disabled={isPending}
          variant="outline"
          className="gap-2"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          {mode === "new" ? "Save draft" : "Save changes"}
        </Button>
        {showActivate ? (
          <Button
            type="button"
            onClick={onSubmit("activate")}
            disabled={isPending}
            className="gap-2"
          >
            <Power className="size-4" aria-hidden />
            {status === "draft" ? "Activate" : "Re-activate"}
          </Button>
        ) : null}
        {showClose ? (
          <Button
            type="button"
            onClick={onSubmit("close")}
            disabled={isPending}
            variant="outline"
            className="gap-2"
          >
            <PowerOff className="size-4" aria-hidden />
            Close
          </Button>
        ) : null}
        {showArchive ? (
          <Button
            type="button"
            onClick={onSubmit("archive")}
            disabled={isPending}
            variant="outline"
            className="gap-2"
          >
            <Archive className="size-4" aria-hidden />
            Archive
          </Button>
        ) : null}
      </div>
    </form>
  );
}
