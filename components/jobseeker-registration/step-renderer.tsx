"use client";

import { Step1PersonalInfo } from "./steps/step1-personal-info";
import { Step2Employment } from "./steps/step2-employment";
import { Step3JobPreference } from "./steps/step3-job-preference";
import { Step4Language } from "./steps/step4-language";
import { Step5Education } from "./steps/step5-education";
import { Step6Training } from "./steps/step6-training";
import { Step7Eligibility } from "./steps/step7-eligibility";
import { Step8WorkExperience } from "./steps/step8-work-experience";
import { Step9Skills } from "./steps/step9-skills";

interface StepRendererProps {
  currentStep: number;
}

export function StepRenderer({ currentStep }: StepRendererProps) {
  switch (currentStep) {
    case 1:
      return <Step1PersonalInfo />;
    case 2:
      return <Step2Employment />;
    case 3:
      return <Step3JobPreference />;
    case 4:
      return <Step4Language />;
    case 5:
      return <Step5Education />;
    case 6:
      return <Step6Training />;
    case 7:
      return <Step7Eligibility />;
    case 8:
      return <Step8WorkExperience />;
    case 9:
      return <Step9Skills />;
    default:
      return null;
  }
}
