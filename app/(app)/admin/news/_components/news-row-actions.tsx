"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
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
  archiveNewsPost,
  deleteNewsPost,
  pinNewsPost,
  publishNewsPost,
  unpinNewsPost,
  unpublishNewsPost,
} from "../actions";
import type { NewsPostStatus } from "@/lib/validations/news-post";

interface Props {
  id: number;
  status: NewsPostStatus;
  isPinned: boolean;
}

export function NewsRowActions({ id, status, isPinned }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handle<T>(action: () => Promise<{ data: T | null; error: string | null }>, successMessage: string) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast({ title: "Action failed", description: result.error });
        return;
      }
      toast({ title: successMessage });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/news/${id}/edit`} className="gap-1.5">
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
        <DropdownMenuContent align="end" className="w-52">
          {status !== "published" ? (
            <DropdownMenuItem onClick={() => handle(() => publishNewsPost(id), "Published")}>
              Publish
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handle(() => unpublishNewsPost(id), "Moved to draft")}>
              Move to draft
            </DropdownMenuItem>
          )}
          {status !== "archived" ? (
            <DropdownMenuItem onClick={() => handle(() => archiveNewsPost(id), "Archived")}>
              Archive
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          {isPinned ? (
            <DropdownMenuItem onClick={() => handle(() => unpinNewsPost(id), "Unpinned")}>
              <PinOff className="mr-2 size-4" aria-hidden />
              Unpin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handle(() => pinNewsPost(id), "Pinned")}>
              <Pin className="mr-2 size-4" aria-hidden />
              Pin to top
            </DropdownMenuItem>
          )}
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
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the post and its uploaded photos.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDelete(false);
                handle(() => deleteNewsPost(id), "Post deleted");
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
