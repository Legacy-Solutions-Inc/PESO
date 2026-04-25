"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  activateJobPosting,
  archiveJobPosting,
  closeJobPosting,
  deleteJobPosting,
} from "../actions";
import type { JobStatus } from "@/lib/validations/job-posting";

interface Props {
  id: number;
  status: JobStatus;
}

export function JobRowActions({ id, status }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handle<T>(
    action: () => Promise<{ data: T | null; error: string | null }>,
    successMessage: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast({
          title: "Action failed",
          description: result.error,
        });
        return;
      }
      toast({ title: successMessage });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/jobs/${id}/edit`} className="gap-1.5">
          <Pencil className="size-3.5" aria-hidden />
          Edit
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            aria-label="More actions"
            disabled={isPending}
          >
            <MoreHorizontal className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {status !== "active" ? (
            <DropdownMenuItem
              onClick={() => handle(() => activateJobPosting(id), "Activated")}
            >
              Activate
            </DropdownMenuItem>
          ) : null}
          {status === "active" ? (
            <DropdownMenuItem
              onClick={() => handle(() => closeJobPosting(id), "Closed")}
            >
              Close
            </DropdownMenuItem>
          ) : null}
          {status !== "archived" ? (
            <DropdownMenuItem
              onClick={() => handle(() => archiveJobPosting(id), "Archived")}
            >
              Archive
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="mr-2 size-4" aria-hidden />
            Delete…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job posting?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the posting. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDelete(false);
                handle(() => deleteJobPosting(id), "Posting deleted");
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
