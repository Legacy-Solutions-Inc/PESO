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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { CERTIFICATE_OPTIONS } from "@/lib/constants";


export function Step7Training() {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "training.entries",
  });

  const addTrainingEntry = () => {
    if (fields.length < 3) {
      append({
        course: "",
        hours: "",
        institution: "",
        skillsAcquired: "",
        certificates: {
          NC_I: false,
          NC_II: false,
          NC_III: false,
          NC_IV: false,
          COC: false,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Badge className="bg-dashboard-primary text-white">Step 6 of 9</Badge>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Training
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Section VII - Training & Vocational Courses
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {fields.length === 0 ? (
          <div className="rounded-xl border border-slate-200/80 bg-white p-8 text-center shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
            <p className="mb-4 text-slate-500 dark:text-slate-400">
              No training entries yet. Add up to 3 training courses.
            </p>
            <Button
              type="button"
              onClick={addTrainingEntry}
              className="bg-dashboard-primary hover:bg-dashboard-primary-hover"
            >
              <Plus className="size-4" aria-hidden />
              Add Training Entry
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
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Training #{index + 1}
                  </h3>
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
                      name={`training.entries.${index}.course`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Training/Vocational Course</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Welding NC II" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`training.entries.${index}.hours`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hours of Training</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="120" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`training.entries.${index}.institution`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Institution</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., TESDA Regional Training Center" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`training.entries.${index}.skillsAcquired`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills Acquired</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the skills you acquired from this training"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label className="mb-3 block text-sm font-medium">
                      Certificates Received
                    </Label>
                    <div className="grid gap-3 md:grid-cols-3">
                      {CERTIFICATE_OPTIONS.map((cert) => (
                        <FormField
                          key={cert.value}
                          control={form.control}
                          name={`training.entries.${index}.certificates.${cert.value}`}
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer font-normal">
                                {cert.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {fields.length < 3 && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={addTrainingEntry}
                  variant="outline"
                  className="font-semibold"
                >
                  <Plus className="size-4" aria-hidden />
                  Add Another Training ({fields.length}/3)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
