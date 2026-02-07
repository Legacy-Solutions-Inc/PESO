"use client";

import { Step1PersonalInfo } from "./steps/step1-personal-info";
import { Step3Employment } from "./steps/step3-employment";
import { Step4JobPreference } from "./steps/step4-job-preference";
import { Step5Language } from "./steps/step5-language";
import { Step6Education } from "./steps/step6-education";
import { Step7Training } from "./steps/step7-training";
import { Step8Eligibility } from "./steps/step8-eligibility";
import { Step9WorkExperience } from "./steps/step9-work-experience";
import { Step10Skills } from "./steps/step10-skills";

interface StepRendererProps {
  currentStep: number;
}

export function StepRenderer({ currentStep }: StepRendererProps) {
  switch (currentStep) {
    case 1:
      return <Step1PersonalInfo />;
    case 2:
      return <Step3Employment />;
    case 3:
      return <Step4JobPreference />;
    case 4:
      return <Step5Language />;
    case 5:
      return <Step6Education />;
    case 6:
      return <Step7Training />;
    case 7:
      return <Step8Eligibility />;
    case 8:
      return <Step9WorkExperience />;
    case 9:
      return <Step10Skills />;
    default:
      return null;
  }
}
