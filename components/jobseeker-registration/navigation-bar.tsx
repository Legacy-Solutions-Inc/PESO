"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEP_NAMES = [
  "Personal information",
  "Employment status",
  "Job preference",
  "Language / dialect",
  "Education",
  "Training",
  "Eligibility / license",
  "Work experience",
  "Skills & certification",
] as const;

interface NavigationBarProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  isSaving: boolean;
  /** When provided (e.g. edit mode), used for the last-step submit button instead of "Submit registration". */
  submitLabel?: string;
  /** When false (e.g. edit mode), the Save draft button is hidden. */
  showSaveDraft?: boolean;
}

export function NavigationBar({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSaveDraft,
  isFirstStep,
  isLastStep,
  isSubmitting,
  isSaving,
  submitLabel,
  showSaveDraft = true,
}: NavigationBarProps) {
  const nextStepName = currentStep < totalSteps ? STEP_NAMES[currentStep] : null;
  const lastStepButtonLabel = submitLabel ?? "Submit registration";
  const lastStepButtonSubmittingLabel = submitLabel?.toLowerCase().includes("update")
    ? "Updating…"
    : "Submitting…";

  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t border-border bg-card/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:-mx-6 sm:px-6 sm:py-4 lg:-mx-8 lg:px-8">
      <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:justify-between sm:gap-4">
        <Button
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep}
          variant="outline"
          className="min-h-11"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </Button>

        {showSaveDraft && (
          <Button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            variant="secondary"
            className="hidden min-h-11 sm:inline-flex"
          >
            {isSaving ? "Saving…" : "Save draft"}
          </Button>
        )}

        {isLastStep ? (
          <Button type="submit" disabled={isSubmitting} className="min-h-11">
            <span className="truncate">
              {isSubmitting ? lastStepButtonSubmittingLabel : lastStepButtonLabel}
            </span>
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </Button>
        ) : (
          <Button type="button" onClick={onNext} className="min-h-11">
            <span className="truncate">
              {nextStepName ? `Next: ${nextStepName}` : "Next"}
            </span>
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
