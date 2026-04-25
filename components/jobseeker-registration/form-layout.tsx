"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { List } from "lucide-react";
import { ProgressSidebar } from "./progress-sidebar";
import { NavigationBar } from "./navigation-bar";
import { StepRenderer } from "./step-renderer";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useKeyboardShortcuts, type Shortcut } from "@/hooks/use-keyboard-shortcuts";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  createJobseeker,
  saveDraft as saveDraftAction,
  loadDraft,
} from "@/app/(app)/jobseekers/register/actions";
import { updateJobseeker } from "@/app/(app)/jobseekers/actions";
import type { JobseekerRegistrationData } from "@/lib/validations/jobseeker-registration";
import { JOBSEEKER_REGISTRATION_DEFAULTS } from "@/lib/validations/jobseeker-registration-defaults";
import { toUserFacingMessage } from "@/lib/errors/user-facing";

const TOTAL_STEPS = 9;

const STEP_LABELS = [
  "Personal Information",
  "Employment Status",
  "Job Preference",
  "Language and Dialect",
  "Education",
  "Training",
  "Eligibility and License",
  "Work Experience",
  "Skills and Certification",
] as const;

const AUTOSAVE_DEBOUNCE_MS = 30_000;
const LEGACY_LOCAL_DRAFT_KEY = "jobseeker-draft";

interface FormLayoutProps {
  encoderEmail: string;
  /** When both provided, form runs in edit mode: prefilled with initialData, no draft, submit updates this jobseeker. */
  jobseekerId?: number;
  initialData?: JobseekerRegistrationData;
}

export function JobseekerRegistrationFormLayout({
  encoderEmail,
  jobseekerId,
  initialData,
}: FormLayoutProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = jobseekerId != null && initialData != null;

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() =>
    isEditMode ? new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]) : new Set()
  );
  const [formData, setFormData] = useState<Partial<JobseekerRegistrationData>>({});
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const stepRegionRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  const progressPercentage = (completedSteps.size / TOTAL_STEPS) * 100;

  const formMethods = useForm({
    mode: "onBlur",
    defaultValues: isEditMode
      ? initialData
      : { ...JOBSEEKER_REGISTRATION_DEFAULTS, ...formData },
  });

  const { handleSubmit, getValues } = formMethods;

  const resetForm = useCallback(() => {
    formMethods.reset(JOBSEEKER_REGISTRATION_DEFAULTS);
    setFormData({});
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setLastSaved(undefined);
    // Clear any legacy localStorage draft left over from before the server-only migration.
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LEGACY_LOCAL_DRAFT_KEY);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast({
      title: "Form reset",
      description: "Ready to register a new jobseeker.",
      duration: 3000,
    });
  }, [formMethods, toast]);

  const saveDraft = useCallback(
    async (options: { silent?: boolean } = {}): Promise<void> => {
      if (isEditMode) return;
      setIsSaving(true);
      try {
        const currentFormData = {
          ...formData,
          ...getValues(),
        } as Partial<JobseekerRegistrationData>;

        const result = await saveDraftAction(
          currentFormData,
          currentStep,
          Array.from(completedSteps)
        );

        if (result.error) {
          throw new Error(result.error);
        }

        setLastSaved(new Date());

        if (!options.silent) {
          toast({
            title: "Draft saved",
            description: "Your progress is safe.",
            duration: 2500,
          });
        }
      } catch (error) {
        toast({
          title: "Save failed",
          description: toUserFacingMessage(error),
          duration: 5000,
        });
      } finally {
        setIsSaving(false);
      }
    },
    [formData, getValues, currentStep, completedSteps, toast, isEditMode]
  );

  // Keep latest saveDraft in a ref so the debounced autosave always uses fresh state.
  const saveDraftRef = useRef(saveDraft);
  useEffect(() => {
    saveDraftRef.current = saveDraft;
  }, [saveDraft]);

  // Debounced autosave: every user change resets a 30s timer. When the timer
  // fires we save silently (no toast). No timer exists while the form is idle.
  useEffect(() => {
    if (isEditMode) return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const subscription = formMethods.watch(() => {
      if (!formMethods.formState.isDirty) return;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveDraftRef.current({ silent: true });
        timeoutId = null;
      }, AUTOSAVE_DEBOUNCE_MS);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [formMethods, isEditMode]);

  // One-time: load the server draft and delete any stale localStorage draft
  // from before the server-only migration.
  useEffect(() => {
    if (isEditMode) return;

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LEGACY_LOCAL_DRAFT_KEY);
    }

    const fixTrainingCertificates = (data: Partial<JobseekerRegistrationData>) => {
      if (data?.training?.entries && Array.isArray(data.training.entries)) {
        data.training.entries = data.training.entries.map(
          (entry: Record<string, unknown>) => {
            if (Array.isArray(entry.certificates)) {
              return {
                ...entry,
                certificates: {
                  NC_I: false,
                  NC_II: false,
                  NC_III: false,
                  NC_IV: false,
                  COC: false,
                },
              };
            }
            return entry;
          }
        );
      }
      return data;
    };

    const loadDraftData = async () => {
      const serverDraft = await loadDraft();
      if (!serverDraft) return;

      const fixedData = fixTrainingCertificates(serverDraft.data || {});
      setFormData(fixedData);
      setCurrentStep(serverDraft.currentStep || 1);
      setCompletedSteps(new Set(serverDraft.completedSteps || []));
      setLastSaved(new Date());
      formMethods.reset(fixedData);
    };

    void loadDraftData();
  }, [encoderEmail, formMethods, isEditMode]);

  const goToStep = useCallback(
    (step: number) => {
      if (step < 1 || step > TOTAL_STEPS) return;
      const currentFormData = getValues();
      setFormData(
        (prev) =>
          ({ ...prev, ...currentFormData }) as Partial<JobseekerRegistrationData>
      );
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [getValues]
  );

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      goToStep(currentStep + 1);
    }
  }, [currentStep, goToStep]);

  // After step renders, move focus to the step heading and announce the change.
  useEffect(() => {
    const heading = stepRegionRef.current?.querySelector<HTMLElement>(
      "[data-step-heading]"
    );
    if (heading) {
      heading.focus({ preventScroll: true });
    }
    const label = STEP_LABELS[currentStep - 1] ?? "";
    setLiveAnnouncement(`Step ${currentStep} of ${TOTAL_STEPS}: ${label}`);
  }, [currentStep]);

  // Global keyboard shortcuts. Alt+arrows step; Alt+digit jumps; Ctrl/Cmd+S saves;
  // Esc closes the mobile step drawer.
  const shortcuts: Shortcut[] = [
    { key: "arrowright", modifiers: ["alt"], handler: handleNext },
    { key: "arrowleft", modifiers: ["alt"], handler: handlePrevious },
    ...Array.from({ length: TOTAL_STEPS }, (_, i): Shortcut => {
      const step = i + 1;
      return {
        key: String(step),
        modifiers: ["alt"],
        handler: () => goToStep(step),
      };
    }),
    {
      key: "s",
      modifiers: ["ctrl"],
      handler: () => {
        if (!isEditMode) void saveDraft();
      },
      skipInEditable: false,
    },
    {
      key: "s",
      modifiers: ["meta"],
      handler: () => {
        if (!isEditMode) void saveDraft();
      },
      skipInEditable: false,
    },
    {
      key: "escape",
      handler: () => setStepsOpen(false),
    },
  ];
  useKeyboardShortcuts(shortcuts);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const finalData = { ...formData, ...data } as JobseekerRegistrationData;

      if (isEditMode && jobseekerId != null) {
        const result = await updateJobseeker(jobseekerId, finalData);
        if (result.error) {
          if (result.details && result.details.length > 0) {
            const errorList = result.details
              .map((err) => `• ${err.field}: ${err.message}`)
              .join("\n");
            toast({
              title: "Validation error",
              description: (
                <div className="space-y-2">
                  <p className="font-medium">Please fix the following:</p>
                  <div className="text-sm whitespace-pre-line">{errorList}</div>
                </div>
              ),
              duration: 10000,
            });
          } else {
            toast({
              title: "Update failed",
              description: toUserFacingMessage(result.error),
              duration: 7000,
            });
          }
          return;
        }
        toast({
          title: "Profile updated",
          description: "Redirecting to the jobseeker profile.",
          duration: 3000,
        });
        router.push(`/jobseekers/${jobseekerId}`);
        return;
      }

      const result = await createJobseeker(finalData);
      if (result.error) {
        if (result.details && result.details.length > 0) {
          const errorList = result.details
            .map((err) => `• ${err.field}: ${err.message}`)
            .join("\n");
          toast({
            title: "Missing required fields",
            description: (
              <div className="space-y-2">
                <p className="font-medium">Please fill in the following:</p>
                <div className="text-sm whitespace-pre-line">{errorList}</div>
              </div>
            ),
            duration: 10000,
          });
        } else {
          toast({
            title: "Submission failed",
            description: toUserFacingMessage(result.error),
            duration: 7000,
          });
        }
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(LEGACY_LOCAL_DRAFT_KEY);
      }

      toast({
        title: "Registration submitted",
        description: (
          <div className="space-y-3">
            <p>Jobseeker #{result.id} has been registered.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => resetForm()}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
              >
                Register another
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/jobseekers";
                }}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
              >
                View records
              </button>
            </div>
          </div>
        ),
        duration: 10000,
      });
      setTimeout(() => resetForm(), 10000);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: toUserFacingMessage(error),
        duration: 7000,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const mainContent = (
    <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <FormProvider {...formMethods}>
          <form onSubmit={onSubmit} className="space-y-8" noValidate>
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {liveAnnouncement}
            </div>
            <div
              ref={stepRegionRef}
              role="region"
              aria-labelledby="wizard-step-heading"
              data-wizard
            >
              <StepRenderer currentStep={currentStep} />
            </div>

            <NavigationBar
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSaveDraft={saveDraft}
              isFirstStep={currentStep === 1}
              isLastStep={currentStep === TOTAL_STEPS}
              isSubmitting={isSubmitting}
              isSaving={isSaving}
              submitLabel={isEditMode ? "Update profile" : undefined}
              showSaveDraft={!isEditMode}
            />
          </form>
        </FormProvider>
      </div>
    </main>
  );

  if (isMobile) {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 shadow-sm">
          <div className="min-w-0">
            <p className="truncate text-base font-medium text-foreground">
              {isEditMode ? "Edit profile" : "Registration"}
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="default"
            className="min-h-11 shrink-0"
            onClick={() => setStepsOpen(true)}
            aria-label="Open steps menu"
          >
            <List className="size-4" aria-hidden />
            Steps
          </Button>
        </header>

        <Sheet open={stepsOpen} onOpenChange={setStepsOpen}>
          <SheetContent
            side="left"
            className="flex max-h-full flex-col overflow-hidden p-0 sm:max-w-70"
          >
            <ProgressSidebar
              variant="drawer"
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={(step) => {
                goToStep(step);
                setStepsOpen(false);
              }}
              onSaveDraft={() => saveDraft()}
              isSaving={isSaving}
              lastSaved={lastSaved}
              title={isEditMode ? "Edit profile" : undefined}
              subtitle={isEditMode ? "Update jobseeker record" : undefined}
              showSaveDraft={!isEditMode}
            />
          </SheetContent>
        </Sheet>

        <div className="flex min-h-0 flex-1 flex-col">{mainContent}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh bg-background">
      <ProgressSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
        onSaveDraft={() => saveDraft()}
        isSaving={isSaving}
        lastSaved={lastSaved}
        title={isEditMode ? "Edit profile" : undefined}
        subtitle={isEditMode ? "Update jobseeker record" : undefined}
        showSaveDraft={!isEditMode}
      />
      {mainContent}
    </div>
  );
}
