"use client";

import { useEffect } from "react";

export type ShortcutModifier = "alt" | "ctrl" | "meta" | "shift";

export interface Shortcut {
  /** Lowercase `KeyboardEvent.key` to match (e.g. "arrowright", "s", "/"). */
  key: string;
  /** Required modifiers. Empty array = no modifiers required. */
  modifiers?: ShortcutModifier[];
  /** Handler; receives the event so it can call preventDefault. */
  handler: (event: KeyboardEvent) => void;
  /**
   * When true, the shortcut is ignored if the focused element is an input-like
   * control. Default: true. Set to false for global shortcuts that should fire
   * even while typing (e.g. Ctrl+S).
   */
  skipInEditable?: boolean;
  /**
   * Whether to call preventDefault when the shortcut matches. Default: true.
   */
  preventDefault?: boolean;
}

/**
 * Global keyboard shortcut registrar.
 *
 * Usage:
 *   useKeyboardShortcuts([
 *     { key: "arrowright", modifiers: ["alt"], handler: goNext },
 *     { key: "s", modifiers: ["ctrl"], handler: saveDraft, skipInEditable: false },
 *   ]);
 *
 * Shortcuts are matched by (key, set of modifiers). Keys are compared
 * case-insensitively via `KeyboardEvent.key.toLowerCase()`.
 */
export function useKeyboardShortcuts(
  shortcuts: Shortcut[],
  options: { enabled?: boolean } = {}
): void {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled || shortcuts.length === 0) return;

    const handler = (event: KeyboardEvent) => {
      const pressedKey = event.key.toLowerCase();

      for (const shortcut of shortcuts) {
        if (shortcut.key.toLowerCase() !== pressedKey) continue;
        if (!modifiersMatch(event, shortcut.modifiers ?? [])) continue;

        const skipInEditable = shortcut.skipInEditable ?? true;
        if (skipInEditable && isEditableTarget(event.target)) continue;

        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.handler(event);
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts, enabled]);
}

function modifiersMatch(
  event: KeyboardEvent,
  required: readonly ShortcutModifier[]
): boolean {
  const need = new Set(required);
  if (event.altKey !== need.has("alt")) return false;
  if (event.ctrlKey !== need.has("ctrl")) return false;
  if (event.metaKey !== need.has("meta")) return false;
  if (event.shiftKey !== need.has("shift")) return false;
  return true;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}
