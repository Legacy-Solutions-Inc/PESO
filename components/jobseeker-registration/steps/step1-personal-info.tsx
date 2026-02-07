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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const SUFFIX_OPTIONS = ["JR", "SR", "III", "IV", "V"] as const;
const CIVIL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Widowed",
  "Separated",
] as const;

export function Step1PersonalInfo() {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Badge className="bg-dashboard-primary text-white">Step 1 of 9</Badge>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Personal Information
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Section I - Basic Details
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50 lg:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Name Fields */}
          <FormField
            control={form.control}
            name="personalInfo.surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Surname <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Dela Cruz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="personalInfo.firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  First Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Juan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="personalInfo.middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input placeholder="Santos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="personalInfo.suffix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suffix (optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SUFFIX_OPTIONS.map((suffix) => (
                      <SelectItem key={suffix} value={suffix}>
                        {suffix}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date of Birth */}
          <FormField
            control={form.control}
            name="personalInfo.dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Date of Birth <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="personalInfo.placeOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Place of Birth</FormLabel>
                <FormControl>
                  <Input placeholder="Manila, Philippines" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sex */}
          <FormField
            control={form.control}
            name="personalInfo.sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Sex <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="MALE" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="FEMALE" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="personalInfo.religion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Religion</FormLabel>
                <FormControl>
                  <Input placeholder="Catholic" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Civil Status */}
          <FormField
            control={form.control}
            name="personalInfo.civilStatus"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>
                  Civil Status <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select civil status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CIVIL_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status.toUpperCase()}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Present Address */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
            Present Address
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="personalInfo.address.houseStreet"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>House No. / Street / Village</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Rizal Street, Barangay San Jose" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personalInfo.address.barangay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barangay</FormLabel>
                  <FormControl>
                    <Input placeholder="Barangay name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personalInfo.address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City / Municipality</FormLabel>
                  <FormControl>
                    <Input placeholder="City or municipality" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personalInfo.address.province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province</FormLabel>
                  <FormControl>
                    <Input placeholder="Province" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* TIN and Government IDs */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
            Government IDs
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="personalInfo.tin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TIN (Tax Identification Number)</FormLabel>
                  <FormControl>
                    <Input placeholder="000-000-000-000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Disability */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
            Person with Disability (PWD)
          </h3>
          <div className="space-y-3">
            {[
              { id: "visual", label: "Visual Disability" },
              { id: "hearing", label: "Hearing Disability" },
              { id: "speech", label: "Speech Disability" },
              { id: "physical", label: "Physical Disability" },
              { id: "mental", label: "Mental / Psychosocial Disability" },
            ].map((disability) => (
              <FormField
                key={disability.id}
                control={form.control}
                name={`personalInfo.disability.${disability.id}`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal">
                      {disability.label}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}

            <FormField
              control={form.control}
              name="personalInfo.disability.others"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Others (please specify)</FormLabel>
                  <FormControl>
                    <Input placeholder="Specify other disability" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
            Contact Information
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="personalInfo.height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (in feet)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="5.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personalInfo.contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="09XX XXX XXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personalInfo.email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan.delacruz@email.com" {...field} />
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
