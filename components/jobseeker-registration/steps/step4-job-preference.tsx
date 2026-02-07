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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export function Step4JobPreference() {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Badge className="bg-dashboard-primary text-white">Step 3 of 9</Badge>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Job Preference
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Section IV - Preferred Employment & Location
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50 lg:p-8">
        {/* Employment Type Preference */}
        <FormField
          control={form.control}
          name="jobPreference.employmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Preferred Employment Type <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <Label
                    htmlFor="part-time"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-slate-200 p-4 hover:border-dashboard-primary hover:bg-slate-50 dark:border-slate-700 dark:hover:border-dashboard-primary dark:hover:bg-slate-800"
                  >
                    <RadioGroupItem value="PART_TIME" id="part-time" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">Part-time</p>
                      <p className="text-sm text-slate-500">Flexible hours</p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="full-time"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-slate-200 p-4 hover:border-dashboard-primary hover:bg-slate-50 dark:border-slate-700 dark:hover:border-dashboard-primary dark:hover:bg-slate-800"
                  >
                    <RadioGroupItem value="FULL_TIME" id="full-time" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">Full-time</p>
                      <p className="text-sm text-slate-500">Regular schedule</p>
                    </div>
                  </Label>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preferred Occupations */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
            Preferred Occupations
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            List up to 3 occupations you are interested in (in order of preference)
          </p>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="jobPreference.occupation1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1st Preference</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Administrative Assistant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobPreference.occupation2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>2nd Preference</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Customer Service Representative" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobPreference.occupation3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>3rd Preference</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Data Entry Clerk" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Preferred Work Location - Local */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
            Preferred Work Location (Local)
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            List up to 3 local cities/municipalities where you prefer to work
          </p>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="jobPreference.localLocation1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1st Choice - City/Municipality</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Manila" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobPreference.localLocation2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>2nd Choice - City/Municipality</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Quezon City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobPreference.localLocation3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>3rd Choice - City/Municipality</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Makati" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Preferred Work Location - Overseas */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
            Preferred Work Location (Overseas)
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            List up to 3 countries where you prefer to work (if interested in overseas employment)
          </p>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="jobPreference.overseasLocation1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1st Choice - Country</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Singapore" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobPreference.overseasLocation2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>2nd Choice - Country</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Japan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobPreference.overseasLocation3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>3rd Choice - Country</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Canada" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
