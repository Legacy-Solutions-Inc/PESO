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

const OTHER_SKILLS = [
  "Auto Mechanic",
  "Beautician",
  "Carpentry Work",
  "Computer Literate",
  "Domestic Chores",
  "Driver",
  "Electrician",
  "Embroidery",
  "Gardening",
  "Masonry",
  "Painter/Artist",
  "Painting Jobs",
  "Photography",
  "Plumbing",
  "Sewing Dresses",
  "Stenography",
  "Tailoring",
] as const;

const REFERRAL_PROGRAMS = [
  "SPES",
  "GIP",
  "TUPAD",
  "JobStart",
  "DILEEP",
  "TESDA Training",
] as const;

export function Step10Skills() {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Badge className="bg-dashboard-primary text-white">Step 9 of 9</Badge>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Skills & Certification
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Section X - Other Skills & Authorization
          </p>
        </div>
      </div>

      {/* Other Skills (without certificate) */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50 lg:p-8">
        <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
          Other Skills (without certificate)
        </h3>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Select all skills that apply to you
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          {OTHER_SKILLS.map((skill) => (
            <FormField
              key={skill}
              control={form.control}
              name={`skills.otherSkills.${skill.toLowerCase().replace(/[\s\/]/g, "_")}`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    {skill}
                  </FormLabel>
                </FormItem>
              )}
            />
          ))}
        </div>

        <FormField
          control={form.control}
          name="skills.otherSkills.others"
          render={({ field }) => (
            <FormItem className="mt-6">
              <FormLabel>Others (please specify)</FormLabel>
              <FormControl>
                <Input placeholder="Specify other skills" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Certification/Authorization */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50 lg:p-8">
        <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
          Certification/Authorization
        </h3>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="skills.certification.acknowledged"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 space-y-0 rounded-lg border-2 border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="flex-1">
                  <FormLabel className="cursor-pointer font-normal leading-relaxed">
                    I certify that the information provided in this registration form is true and correct
                    to the best of my knowledge. I understand that any false information may result in
                    the rejection of my application or termination of services.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="skills.certification.signature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Signature (Type your full name) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Juan Santos Dela Cruz"
                      className="font-serif text-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills.certification.dateSigned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Date Signed <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || new Date().toISOString().split("T")[0]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* FOR PESO USE ONLY */}
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-6 shadow-sm dark:border-amber-800 dark:bg-amber-950/20 lg:p-8">
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="outline" className="border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            FOR PESO USE ONLY
          </Badge>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="mb-3 block text-sm font-medium">
              Referral Programs
            </Label>
            <div className="grid gap-3 md:grid-cols-3">
              {REFERRAL_PROGRAMS.map((program) => (
                <FormField
                  key={program}
                  control={form.control}
                  name={`skills.pesoUseOnly.referralPrograms.${program.toLowerCase().replace(/\s/g, "_")}`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        {program}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <FormField
              control={form.control}
              name="skills.pesoUseOnly.referralPrograms.others"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Others (specify)</FormLabel>
                  <FormControl>
                    <Input placeholder="Specify other program" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="skills.pesoUseOnly.assessedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessed By</FormLabel>
                  <FormControl>
                    <Input placeholder="Assessor name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills.pesoUseOnly.assessorSignature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessor Signature</FormLabel>
                  <FormControl>
                    <Input placeholder="Signature" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills.pesoUseOnly.assessmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
