"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { deleteJobseeker } from "../actions";

interface DeleteRowActionProps {
  id: number;
  surname: string;
  firstName: string;
  isAdmin: boolean;
}

export function DeleteRowAction({
  id,
  surname,
  firstName,
  isAdmin,
}: DeleteRowActionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const label = `Delete record for ${firstName} ${surname}`;
  const nsrpId = `NSRP-${id}`;

  if (!isAdmin) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 text-red-600"
              aria-label={label}
              aria-disabled="true"
              disabled
            >
              <Trash2 className="size-4" />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Admin only</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await deleteJobseeker(id);

      if (result.error) {
        toast({
          title: "❌ Delete failed",
          description: result.error,
          duration: 5000,
        });
        return;
      }

      toast({
        title: "✅ Record deleted",
        description: nsrpId,
        duration: 3000,
      });
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 text-red-600 hover:bg-red-50 hover:text-red-700"
            aria-label={label}
            onClick={() => setOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete record</p>
        </TooltipContent>
      </Tooltip>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete jobseeker record?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete{" "}
              <span className="font-medium">
                {surname}, {firstName}
              </span>{" "}
              ({nsrpId}). This action cannot be undone and will be logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800"
            >
              {isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
