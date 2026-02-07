"use client";

import { Check, Save } from "lucide-react";
import {
  User,
  Briefcase,
  Target,
  Languages,
  GraduationCap,
  Award,
  Building2,
  Wrench,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const FORM_STEPS = [
  { step: 1, label: "Personal Information", icon: User },
  { step: 2, label: "Employment Status", icon: Briefcase },
  { step: 3, label: "Job Preference", icon: Target },
  { step: 4, label: "Language/Dialect", icon: Languages },
  { step: 5, label: "Education", icon: GraduationCap },
  { step: 6, label: "Training", icon: Award },
  { step: 7, label: "Eligibility/License", icon: FileCheck },
  { step: 8, label: "Work Experience", icon: Building2 },
  { step: 9, label: "Skills & Certification", icon: Wrench },
] as const;

interface ProgressSidebarProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
  onSaveDraft: () => void;
  isSaving: boolean;
  lastSaved?: Date;
}

function getStepStatus(
  step: number,
  currentStep: number,
  completedSteps: Set<number>
): "completed" | "in_progress" | "pending" {
  if (completedSteps.has(step)) return "completed";
  if (step === currentStep) return "in_progress";
  return "pending";
}

function getTimeAgo(date?: Date): string {
  if (!date) return "Never";
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  return `${Math.floor(seconds / 3600)} hr ago`;
}

export function ProgressSidebar({
  currentStep,
  completedSteps,
  onStepClick,
  onSaveDraft,
  isSaving,
  lastSaved,
}: ProgressSidebarProps) {
  const progressPercentage = (completedSteps.size / FORM_STEPS.length) * 100;

  return (
    <aside className="flex w-70 shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900">
      <div className="border-b border-slate-200/80 p-6 pb-4 dark:border-slate-700/50">
        <h1 className="mb-1 text-xl font-bold text-slate-800 dark:text-white">
          Registration Form
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Jobseeker Application
        </p>
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress
            value={progressPercentage}
            className="h-1.5 bg-slate-200 dark:bg-slate-700"
          />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {FORM_STEPS.map(({ step, label, icon: Icon }) => {
          const status = getStepStatus(step, currentStep, completedSteps);
          const isActive = step === currentStep;
          const canNavigate = step <= currentStep || completedSteps.has(step);

          return (
            <button
              key={step}
              type="button"
              onClick={() => canNavigate && onStepClick(step)}
              disabled={!canNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg border-l-[3px] px-4 py-3 text-left transition-all",
                isActive &&
                  "border-l-dashboard-primary bg-dashboard-primary/10 text-dashboard-primary",
                !isActive && status === "completed" &&
                  "border-l-emerald-500 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50",
                !isActive && status === "pending" &&
                  "border-l-transparent text-slate-400 hover:bg-slate-50 dark:text-slate-500 dark:hover:bg-slate-800/30",
                !canNavigate && "cursor-not-allowed opacity-50"
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                  status === "completed" && "bg-emerald-500 text-white",
                  status === "in_progress" && "bg-dashboard-primary text-white",
                  status === "pending" && "bg-slate-200 text-slate-400 dark:bg-slate-700"
                )}
              >
                {status === "completed" ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <Icon className="size-4" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{label}</p>
                {isActive && (
                  <p className="text-[10px] font-medium uppercase tracking-wider text-dashboard-primary/80">
                    In Progress
                  </p>
                )}
                {status === "completed" && !isActive && (
                  <Badge variant="outline" className="mt-0.5 border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                    Completed
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200/80 p-4 dark:border-slate-700/50">
        <Button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          variant="outline"
          className="w-full font-semibold shadow-sm"
        >
          <Save className="size-4" aria-hidden />
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>
        <p className="mt-2 text-center text-[10px] text-slate-400">
          Last saved: {getTimeAgo(lastSaved)}
        </p>
      </div>
    </aside>
  );
}
