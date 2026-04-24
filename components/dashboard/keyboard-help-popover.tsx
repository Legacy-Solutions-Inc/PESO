"use client";

import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShortcutRow {
  keys: string[];
  description: string;
  context?: string;
}

const SHORTCUTS: ShortcutRow[] = [
  {
    keys: ["?"],
    description: "Show this keyboard shortcut list",
    context: "Anywhere",
  },
  {
    keys: ["Alt", "→"],
    description: "Next step",
    context: "Jobseeker registration",
  },
  {
    keys: ["Alt", "←"],
    description: "Previous step",
    context: "Jobseeker registration",
  },
  {
    keys: ["Alt", "1–9"],
    description: "Jump to a specific step",
    context: "Jobseeker registration",
  },
  {
    keys: ["Ctrl", "S"],
    description: "Save draft",
    context: "Jobseeker registration",
  },
  {
    keys: ["Esc"],
    description: "Close dialogs and side drawers",
    context: "Anywhere",
  },
];

export function KeyboardHelpPopover() {
  const [open, setOpen] = useState(false);

  useKeyboardShortcuts([
    {
      key: "?",
      modifiers: ["shift"],
      handler: () => setOpen((prev) => !prev),
    },
    {
      key: "/",
      modifiers: ["shift"],
      handler: () => setOpen((prev) => !prev),
    },
  ]);

  // Some keyboard layouts report "?" without Shift. Add a fallback.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "?" && !event.altKey && !event.ctrlKey && !event.metaKey) {
        const target = event.target;
        if (target instanceof HTMLElement) {
          const tag = target.tagName;
          if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
        }
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        aria-label="Show keyboard shortcuts (? key)"
        onClick={() => setOpen(true)}
      >
        <Keyboard className="size-4" aria-hidden />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>
              Use these shortcuts to work faster without reaching for the mouse.
            </DialogDescription>
          </DialogHeader>
          <ul className="divide-y divide-border">
            {SHORTCUTS.map((row) => (
              <li
                key={row.description}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{row.description}</p>
                  {row.context && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {row.context}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {row.keys.map((key, index) => (
                    <span key={index} className="flex items-center gap-1">
                      {index > 0 && (
                        <span
                          aria-hidden
                          className="text-xs text-muted-foreground"
                        >
                          +
                        </span>
                      )}
                      <kbd className="inline-flex min-w-[1.75rem] items-center justify-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                        {key}
                      </kbd>
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
