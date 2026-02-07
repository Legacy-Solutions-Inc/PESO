"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

export function Step8Eligibility() {
  const form = useFormContext();
  
  const { fields: eligibilityFields, append: appendEligibility, remove: removeEligibility } = useFieldArray({
    control: form.control,
    name: "eligibility.civilService",
  });

  const { fields: licenseFields, append: appendLicense, remove: removeLicense } = useFieldArray({
    control: form.control,
    name: "eligibility.professionalLicense",
  });

  const addEligibility = () => {
    if (eligibilityFields.length < 2) {
      appendEligibility({
        name: "",
        dateTaken: "",
      });
    }
  };

  const addLicense = () => {
    if (licenseFields.length < 2) {
      appendLicense({
        name: "",
        validUntil: "",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Badge className="bg-dashboard-primary text-white">Step 7 of 9</Badge>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Eligibility & License
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Section VIII - Civil Service & Professional Licenses
          </p>
        </div>
      </div>

      {/* Civil Service Eligibility */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50 lg:p-8">
        <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
          Civil Service Eligibility
        </h3>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Add up to 2 civil service eligibility entries
        </p>

        {eligibilityFields.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/30">
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              No civil service eligibility added yet
            </p>
            <Button
              type="button"
              onClick={addEligibility}
              variant="outline"
              size="sm"
            >
              <Plus className="size-4" aria-hidden />
              Add Eligibility
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {eligibilityFields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Eligibility #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEligibility(index)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`eligibility.civilService.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eligibility Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Career Service Professional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`eligibility.civilService.${index}.dateTaken`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Taken</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            {eligibilityFields.length < 2 && (
              <Button
                type="button"
                onClick={addEligibility}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Plus className="size-4" aria-hidden />
                Add Another Eligibility ({eligibilityFields.length}/2)
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Professional License (PRC) */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50 lg:p-8">
        <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
          Professional License (PRC)
        </h3>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Add up to 2 professional license entries
        </p>

        {licenseFields.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/30">
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              No professional license added yet
            </p>
            <Button
              type="button"
              onClick={addLicense}
              variant="outline"
              size="sm"
            >
              <Plus className="size-4" aria-hidden />
              Add License
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {licenseFields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    License #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLicense(index)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`eligibility.professionalLicense.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Registered Nurse" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`eligibility.professionalLicense.${index}.validUntil`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid Until</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            {licenseFields.length < 2 && (
              <Button
                type="button"
                onClick={addLicense}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Plus className="size-4" aria-hidden />
                Add Another License ({licenseFields.length}/2)
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
