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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";

const EMPLOYMENT_STATUS_OPTIONS = [
  "Permanent",
  "Contractual",
  "Part-time",
  "Probationary",
] as const;

export function Step9WorkExperience() {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "workExperience.entries",
  });

  const addWorkEntry = () => {
    append({
      companyName: "",
      address: "",
      position: "",
      numberOfMonths: "",
      employmentStatus: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Badge className="bg-dashboard-primary text-white">Step 8 of 9</Badge>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Work Experience
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Section IX - Employment History (Last 10 Years)
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {fields.length === 0 ? (
          <div className="rounded-xl border border-slate-200/80 bg-white p-8 text-center shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
            <p className="mb-4 text-slate-500 dark:text-slate-400">
              No work experience entries yet. Add your most recent work experience first.
            </p>
            <Button
              type="button"
              onClick={addWorkEntry}
              className="bg-dashboard-primary hover:bg-dashboard-primary-hover"
            >
              <Plus className="size-4" aria-hidden />
              Add Work Experience
            </Button>
          </div>
        ) : (
          <>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50 lg:p-8"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="size-5 text-slate-400" aria-hidden />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                      Work Experience #{index + 1}
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Remove
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`workExperience.entries.${index}.companyName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC Corporation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`workExperience.entries.${index}.address`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (City/Municipality)</FormLabel>
                          <FormControl>
                            <Input placeholder="Makati City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`workExperience.entries.${index}.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input placeholder="Administrative Assistant" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`workExperience.entries.${index}.numberOfMonths`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Months</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`workExperience.entries.${index}.employmentStatus`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Status</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid gap-3 md:grid-cols-4"
                          >
                            {EMPLOYMENT_STATUS_OPTIONS.map((status) => (
                              <div key={status} className="flex items-center gap-2">
                                <RadioGroupItem
                                  value={status.toUpperCase()}
                                  id={`status-${index}-${status}`}
                                />
                                <Label htmlFor={`status-${index}-${status}`}>
                                  {status}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-center">
              <Button
                type="button"
                onClick={addWorkEntry}
                variant="outline"
                className="font-semibold"
              >
                <Plus className="size-4" aria-hidden />
                Add Another Work Experience
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
