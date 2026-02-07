"use client";

import { useState, useTransition } from "react";
import { Trash2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { bulkDeleteJobseekers, bulkArchiveJobseekers } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface BulkActionsProps {
  selectedIds: number[];
  onComplete: () => void;
}

export function BulkActions({ selectedIds, onComplete }: BulkActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleBulkDelete = async () => {
    startTransition(async () => {
      const result = await bulkDeleteJobseekers(selectedIds);

      if (result.error) {
        toast({
          title: "❌ Delete Failed",
          description: result.error,
          duration: 5000,
        });
        return;
      }

      toast({
        title: "✅ Deleted Successfully",
        description: `${selectedIds.length} jobseeker(s) deleted`,
        duration: 3000,
      });

      setIsDeleteDialogOpen(false);
      onComplete();
      router.refresh();
    });
  };

  const handleBulkArchive = async () => {
    startTransition(async () => {
      const result = await bulkArchiveJobseekers(selectedIds);

      if (result.error) {
        toast({
          title: "❌ Archive Failed",
          description: result.error,
          duration: 5000,
        });
        return;
      }

      toast({
        title: "✅ Archived Successfully",
        description: `${selectedIds.length} jobseeker(s) archived`,
        duration: 3000,
      });

      onComplete();
      router.refresh();
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">
          {selectedIds.length} selected
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isPending}>
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleBulkArchive} disabled={isPending}>
              <Archive className="mr-2 size-4" />
              Archive Selected
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-600 focus:text-red-600"
              disabled={isPending}
            >
              <Trash2 className="mr-2 size-4" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedIds.length} jobseeker
              record(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
