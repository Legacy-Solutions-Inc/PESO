"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { ProgressSidebar } from "./progress-sidebar";
import { NavigationBar } from "./navigation-bar";
import { StepRenderer } from "./step-renderer";
import { useToast } from "@/hooks/use-toast";
import {
  createJobseeker,
  saveDraft as saveDraftAction,
  loadDraft,
} from "@/app/(app)/jobseekers/register/actions";
import type { JobseekerRegistrationData } from "@/lib/validations/jobseeker-registration";

const TOTAL_STEPS = 9;

// Default form values for initial state and reset
const DEFAULT_FORM_VALUES = {
  personalInfo: {
    surname: "",
    firstName: "",
    middleName: "",
    suffix: "",
    dateOfBirth: "",
    placeOfBirth: "",
    sex: "",
    religion: "",
    civilStatus: "",
    address: {
      houseStreet: "",
      barangay: "",
      city: "",
      province: "",
    },
    tin: "",
    disability: {
      visual: false,
      hearing: false,
      speech: false,
      physical: false,
      mental: false,
      others: "",
    },
    height: "",
    contactNumber: "",
    email: "",
  },
  employment: {
    status: "",
    employedType: "",
    selfEmployedTypes: {
      fisherman: false,
      vendor: false,
      homeBased: false,
      transport: false,
      domestic: false,
      freelancer: false,
      artisan: false,
      others: "",
    },
    unemployedReason: "",
    terminatedCountry: "",
    unemployedReasonOthers: "",
    jobSearchDuration: "",
    isOfw: false,
    ofwCountry: "",
    isFormerOfw: false,
    formerOfwCountry: "",
    ofwReturnDate: "",
    is4PsBeneficiary: false,
    householdIdNumber: "",
  },
  jobPreference: {
    employmentType: "",
    occupation1: "",
    occupation2: "",
    occupation3: "",
    localLocation1: "",
    localLocation2: "",
    localLocation3: "",
    overseasLocation1: "",
    overseasLocation2: "",
    overseasLocation3: "",
  },
  language: {
    english: {
      read: false,
      write: false,
      speak: false,
      understand: false,
    },
    filipino: {
      read: false,
      write: false,
      speak: false,
      understand: false,
    },
    mandarin: {
      read: false,
      write: false,
      speak: false,
      understand: false,
    },
    othersName: "",
    others: {
      read: false,
      write: false,
      speak: false,
      understand: false,
    },
  },
  education: {
    currentlyInSchool: false,
    elementary: {
      yearGraduated: "",
      levelReached: "",
      yearLastAttended: "",
    },
    secondary: {
      curriculumType: undefined,
      yearGraduated: "",
      levelReached: "",
      yearLastAttended: "",
    },
    k12: {
      yearGraduated: "",
      levelReached: "",
      yearLastAttended: "",
    },
    seniorHigh: {
      strand: "",
      yearGraduated: "",
      levelReached: undefined,
      yearLastAttended: "",
    },
    tertiary: {
      course: "",
      yearGraduated: "",
      levelReached: "",
      yearLastAttended: "",
    },
    graduate: {
      course: "",
      yearGraduated: "",
      yearLastAttended: "",
    },
    postGraduate: {
      course: "",
      yearGraduated: "",
      yearLastAttended: "",
    },
  },
  training: {
    entries: [],
  },
  eligibility: {
    civilService: [],
    professionalLicense: [],
  },
  workExperience: {
    entries: [],
  },
  skills: {
    otherSkills: {
      auto_mechanic: false,
      beautician: false,
      carpentry_work: false,
      computer_literate: false,
      domestic_chores: false,
      driver: false,
      electrician: false,
      embroidery: false,
      gardening: false,
      masonry: false,
      painter_artist: false,
      painting_jobs: false,
      photography: false,
      plumbing: false,
      sewing_dresses: false,
      stenography: false,
      tailoring: false,
      others: "",
    },
    certification: {
      acknowledged: false,
      signature: "",
      dateSigned: new Date().toISOString().split("T")[0],
    },
    pesoUseOnly: {
      referralPrograms: {
        spes: false,
        gip: false,
        tupad: false,
        jobstart: false,
        dileep: false,
        tesda_training: false,
        others: "",
      },
      assessedBy: "",
      assessorSignature: "",
      assessmentDate: "",
    },
  },
};

interface FormLayoutProps {
  encoderEmail: string;
}

export function JobseekerRegistrationFormLayout({
  encoderEmail,
}: FormLayoutProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<Partial<JobseekerRegistrationData>>({});
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Form - initialize with default values to avoid uncontrolled to controlled warnings
  const formMethods = useForm({
    mode: "onBlur",
    defaultValues: {
      ...DEFAULT_FORM_VALUES,
      ...formData,
    },
  });

  const { handleSubmit, getValues, formState } = formMethods;

  // Helper function to reset form to initial state
  const resetForm = useCallback(() => {
    // Reset React Hook Form to default values
    formMethods.reset(DEFAULT_FORM_VALUES);
    
    // Reset component state
    setFormData({});
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setLastSaved(undefined);
    
    // Clear localStorage
    localStorage.removeItem("jobseeker-draft");
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    toast({
      title: "✅ Form Reset",
      description: "Ready to register a new jobseeker.",
      duration: 3000,
    });
  }, [formMethods, toast]);

  // Save draft to localStorage and server
  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      const currentFormData = { ...formData, ...getValues() } as Partial<JobseekerRegistrationData>;
      
      // Save to localStorage (offline backup)
      localStorage.setItem(
        "jobseeker-draft",
        JSON.stringify({
          data: currentFormData,
          currentStep,
          completedSteps: Array.from(completedSteps),
          encoderEmail,
          timestamp: new Date().toISOString(),
        })
      );

      // Save to server
      const result = await saveDraftAction(
        currentFormData,
        currentStep,
        Array.from(completedSteps)
      );

      if (result.error) {
        throw new Error(result.error);
      }

      setLastSaved(new Date());
      toast({
        title: "✅ Draft Saved",
        description: "Your progress has been saved successfully.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "⚠️ Save Failed",
        description: error instanceof Error ? error.message : "Could not save draft. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, getValues, currentStep, completedSteps, encoderEmail, toast]);

  // Auto-save every 30 seconds if form is dirty
  const saveDraftRef = useRef(saveDraft);

  useEffect(() => {
    saveDraftRef.current = saveDraft;
  }, [saveDraft]);

  useEffect(() => {
    if (!formState.isDirty) return;

    const interval = setInterval(() => {
      saveDraftRef.current();
    }, 30000);

    return () => clearInterval(interval);
  }, [formState.isDirty]);

  // Load draft from server first, then localStorage fallback
  useEffect(() => {
    const fixTrainingCertificates = (data: Partial<JobseekerRegistrationData>) => {
      // Fix training.entries[].certificates if it's an array
      if (data?.training?.entries && Array.isArray(data.training.entries)) {
        data.training.entries = data.training.entries.map((entry: Record<string, unknown>) => {
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
        });
      }
      return data;
    };

    const loadDraftData = async () => {
      // Try server first
      const serverDraft = await loadDraft();
      
      if (serverDraft) {
        const fixedData = fixTrainingCertificates(serverDraft.data || {});
        setFormData(fixedData);
        setCurrentStep(serverDraft.currentStep || 1);
        setCompletedSteps(new Set(serverDraft.completedSteps || []));
        setLastSaved(new Date());
        
        // Populate React Hook Form fields with draft data
        formMethods.reset(fixedData);
        return;
      }
      
      // Fallback to localStorage
      const localDraft = localStorage.getItem("jobseeker-draft");
      if (localDraft) {
        try {
          const parsed = JSON.parse(localDraft);
          if (parsed.encoderEmail === encoderEmail) {
            const fixedData = fixTrainingCertificates(parsed.data || {});
            setFormData(fixedData);
            setCurrentStep(parsed.currentStep || 1);
            setCompletedSteps(new Set(parsed.completedSteps || []));
            setLastSaved(parsed.timestamp ? new Date(parsed.timestamp) : undefined);
            
            // Populate React Hook Form fields with draft data
            formMethods.reset(fixedData);
          }
        } catch (error) {
          console.error("Failed to load localStorage draft:", error);
        }
      }
    };
    
    loadDraftData();
  }, [encoderEmail, formMethods]);

  // Keyboard shortcut: Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveDraft();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveDraft]);

  const goToStep = useCallback((step: number) => {
    // Save current step data before navigating
    const currentFormData = getValues();
    setFormData((prev) => ({ ...prev, ...currentFormData }) as Partial<JobseekerRegistrationData>);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [getValues]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      // Mark current step as completed
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      goToStep(currentStep + 1);
    }
  }, [currentStep, goToStep]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const finalData = { ...formData, ...data } as JobseekerRegistrationData;
      
      const result = await createJobseeker(finalData);
      
      if (result.error) {
        // Display detailed validation errors if available
        if (result.details && result.details.length > 0) {
          const errorList = result.details
            .map((err) => `• ${err.field}: ${err.message}`)
            .join('\n');
          
          toast({
            title: "❌ Missing Required Fields",
            description: (
              <div className="space-y-2">
                <p className="font-medium">Please fill in the following fields:</p>
                <div className="text-sm whitespace-pre-line">{errorList}</div>
              </div>
            ),
            duration: 10000, // 10 seconds
          });
        } else {
          toast({
            title: "❌ Submission Failed",
            description: result.error,
            duration: 7000,
          });
        }
        return;
      }
      
      // Clear draft immediately
      localStorage.removeItem("jobseeker-draft");
      
      // Show success with action buttons
      toast({
        title: "✅ Registration Submitted Successfully",
        description: (
          <div className="space-y-3">
            <p>Jobseeker #{result.id} has been registered.</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Clear form for new entry
                  resetForm();
                }}
                className="rounded bg-white px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                Register Another
              </button>
              <button
                onClick={() => {
                  window.location.href = "/jobseekers";
                }}
                className="rounded bg-white px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                View Records
              </button>
            </div>
          </div>
        ),
        duration: 10000, // 10 seconds to give user time to decide
      });
      
      // Auto-reset after 10 seconds if no action taken
      setTimeout(() => {
        resetForm();
      }, 10000);
    } catch (error) {
      toast({
        title: "❌ Submission Failed",
        description: error instanceof Error ? error.message : "Could not submit registration. Please try again.",
        duration: 7000,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-svh bg-dashboard-surface">
      <ProgressSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
        onSaveDraft={saveDraft}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />

      <main className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <FormProvider {...formMethods}>
            <form onSubmit={onSubmit} className="space-y-8" noValidate>
              {/* Step content rendered based on currentStep */}
              <StepRenderer currentStep={currentStep} />

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
              />
            </form>
          </FormProvider>
        </div>
      </main>
    </div>
  );
}
