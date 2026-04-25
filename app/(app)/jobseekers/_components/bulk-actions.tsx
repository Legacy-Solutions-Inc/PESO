"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { bulkDeleteJobseekers } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface BulkActionsProps {
  selectedIds: number[];
  onComplete: () => void;
  isAdmin: boolean;
}

export function BulkActions({
  selectedIds,
  onComplete,
  isAdmin,
}: BulkActionsProps) {
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

  if (!isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">
          {selectedIds.length} selected
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                aria-disabled="true"
                disabled
              >
                Bulk Actions
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Admin only</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">
          {selectedIds.length} selected
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="min-h-11"
              disabled={isPending}
            >
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
              record(s). This action cannot be undone and will be logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
