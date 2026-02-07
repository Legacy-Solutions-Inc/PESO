"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const LANGUAGE_SKILLS = ["read", "write", "speak", "understand"] as const;
const LANGUAGES = [
  { id: "english", label: "English" },
  { id: "filipino", label: "Filipino" },
  { id: "mandarin", label: "Mandarin" },
] as const;

export function Step5Language() {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Badge className="bg-dashboard-primary text-white">Step 4 of 9</Badge>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Language/Dialect
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Section V - Language Proficiency
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50 lg:p-8">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                  Language
                </th>
                <th className="p-3 text-center font-semibold text-slate-700 dark:text-slate-200">
                  Read
                </th>
                <th className="p-3 text-center font-semibold text-slate-700 dark:text-slate-200">
                  Write
                </th>
                <th className="p-3 text-center font-semibold text-slate-700 dark:text-slate-200">
                  Speak
                </th>
                <th className="p-3 text-center font-semibold text-slate-700 dark:text-slate-200">
                  Understand
                </th>
              </tr>
            </thead>
            <tbody>
              {LANGUAGES.map((language) => (
                <tr
                  key={language.id}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="p-3 font-medium text-slate-800 dark:text-white">
                    {language.label}
                  </td>
                  {LANGUAGE_SKILLS.map((skill) => (
                    <td key={skill} className="p-3 text-center">
                      <FormField
                        control={form.control}
                        name={`language.${language.id}.${skill}`}
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-center">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Others */}
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            Other Language/Dialect
          </h3>
          <FormField
            control={form.control}
            name="language.othersName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language/Dialect Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Cebuano, Ilocano" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 md:grid-cols-4">
            {LANGUAGE_SKILLS.map((skill) => (
              <FormField
                key={skill}
                control={form.control}
                name={`language.others.${skill}`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal capitalize">
                      {skill}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
