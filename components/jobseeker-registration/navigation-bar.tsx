"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEP_NAMES = [
  "Personal Information",
  "Employment Status",
  "Job Preference",
  "Language/Dialect",
  "Education",
  "Training",
  "Eligibility/License",
  "Work Experience",
  "Skills & Certification",
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
  /** When provided (e.g. edit mode), used for the last-step submit button instead of "Submit Registration". */
  submitLabel?: string;
  /** When false (e.g. edit mode), the Save as Draft button is hidden. */
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
  const lastStepButtonLabel = submitLabel ?? "Submit Registration";
  const lastStepButtonSubmittingLabel = submitLabel?.toLowerCase().includes("update")
    ? "Updating..."
    : "Submitting...";

  return (
    <div className="sticky bottom-0 z-30 -mx-6 mt-8 border-t border-slate-200/80 bg-white/95 px-6 py-4 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/95 lg:-mx-8 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep}
          variant="outline"
          className="font-semibold"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous Step
        </Button>

        {showSaveDraft && (
          <Button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            variant="secondary"
            className="hidden min-h-11 font-semibold sm:inline-flex"
          >
            {isSaving ? "Saving..." : "Save as Draft"}
          </Button>
        )}

        {isLastStep ? (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-h-11 bg-dashboard-primary font-bold hover:bg-dashboard-primary-hover focus-visible:ring-2 focus-visible:ring-dashboard-primary"
          >
            {isSubmitting ? lastStepButtonSubmittingLabel : lastStepButtonLabel}
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            className="bg-dashboard-primary font-bold hover:bg-dashboard-primary-hover focus-visible:ring-2 focus-visible:ring-dashboard-primary"
          >
            Next: {nextStepName}
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
