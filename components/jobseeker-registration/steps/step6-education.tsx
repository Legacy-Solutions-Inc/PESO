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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const EDUCATION_LEVELS = [
  "Elementary",
  "Secondary (Non-K12)",
  "Senior High",
  "Tertiary",
  "Graduate Studies",
] as const;

const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"] as const;

const TERTIARY_LEVELS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "6th Year",
] as const;

const SENIOR_HIGH_LEVELS = ["Grade 11", "Grade 12"] as const;

export function Step6Education() {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Badge className="bg-dashboard-primary text-white">Step 5 of 9</Badge>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Education
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Section VI - Educational Background
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50 lg:p-8">
        {/* Currently in School */}
        <FormField
          control={form.control}
          name="education.currentlyInSchool"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Are you currently in school?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={field.value ? "true" : "false"}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="true" id="in-school-yes" />
                    <Label htmlFor="in-school-yes">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="false" id="in-school-no" />
                    <Label htmlFor="in-school-no">No</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Education Levels Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="elementary" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
              <TabsTrigger value="elementary">Elementary</TabsTrigger>
              <TabsTrigger value="secondary">Secondary</TabsTrigger>
              <TabsTrigger value="senior-high">Senior High</TabsTrigger>
              <TabsTrigger value="tertiary">Tertiary</TabsTrigger>
              <TabsTrigger value="graduate">Graduate Studies</TabsTrigger>
            </TabsList>

            {/* Elementary */}
            <TabsContent value="elementary" className="space-y-4 pt-4">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Elementary Education</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="education.elementary.yearGraduated"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Graduated</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2010" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education.elementary.levelReached"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level Reached (if not graduated)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GRADE_1">Grade 1</SelectItem>
                          <SelectItem value="GRADE_2">Grade 2</SelectItem>
                          <SelectItem value="GRADE_3">Grade 3</SelectItem>
                          <SelectItem value="GRADE_4">Grade 4</SelectItem>
                          <SelectItem value="GRADE_5">Grade 5</SelectItem>
                          <SelectItem value="GRADE_6">Grade 6</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education.elementary.yearLastAttended"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Last Attended</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2010" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            {/* Secondary */}
            <TabsContent value="secondary" className="space-y-4 pt-4">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Secondary Education</h3>
              <FormField
                control={form.control}
                name="education.secondary.curriculumType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Curriculum type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-6"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="K12" id="secondary-k12" />
                          <Label htmlFor="secondary-k12">K-12</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="NON_K12" id="secondary-non-k12" />
                          <Label htmlFor="secondary-non-k12">Non-K12</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="education.secondary.yearGraduated"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Graduated</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2014" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education.secondary.levelReached"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level Reached (if not graduated)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {YEAR_LEVELS.map((level) => (
                            <SelectItem key={level} value={level.replace(" ", "_").toUpperCase()}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education.secondary.yearLastAttended"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Last Attended</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2014" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            {/* Senior High */}
            <TabsContent value="senior-high" className="space-y-4 pt-4">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Senior High School</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="education.seniorHigh.strand"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Strand</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., STEM, ABM, HUMSS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education.seniorHigh.yearGraduated"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Graduated</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2022" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education.seniorHigh.levelReached"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level Reached (if not graduated)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SENIOR_HIGH_LEVELS.map((level) => (
                            <SelectItem
                              key={level}
                              value={level.replace(" ", "_").toUpperCase()}
                            >
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education.seniorHigh.yearLastAttended"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Last Attended</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2022" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            {/* Tertiary */}
            <TabsContent value="tertiary" className="space-y-4 pt-4">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Tertiary Education</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="education.tertiary.course"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Course</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Bachelor of Science in Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education.tertiary.yearGraduated"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Graduated</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education.tertiary.levelReached"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level Reached (if not graduated)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TERTIARY_LEVELS.map((level) => (
                            <SelectItem key={level} value={level.replace(" ", "_").toUpperCase()}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education.tertiary.yearLastAttended"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Last Attended</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            {/* Graduate Studies (includes Master's, PhD, and other post-graduate) */}
            <TabsContent value="graduate" className="space-y-4 pt-4">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Graduate Studies</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Master&apos;s, Doctorate, or other post-graduate programs
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="education.graduate.course"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Course</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Master of Business Administration, PhD in Education" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education.graduate.yearGraduated"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Graduated</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2026" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education.graduate.yearLastAttended"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Last Attended</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2026" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
