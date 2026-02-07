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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export function Step3Employment() {
  const form = useFormContext();
  const employmentStatus = form.watch("employment.status");
  const employedType = form.watch("employment.employedType");
  const unemployedReason = form.watch("employment.unemployedReason");
  const isOfw = form.watch("employment.isOfw");
  const isFormerOfw = form.watch("employment.isFormerOfw");
  const is4PsBeneficiary = form.watch("employment.is4PsBeneficiary");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Badge className="bg-dashboard-primary text-white">Step 2 of 9</Badge>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Employment Status
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Section III - Current Employment & OFW Status
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50 lg:p-8">
        {/* Employment Status */}
        <FormField
          control={form.control}
          name="employment.status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Employment Status <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <Label
                    htmlFor="employed"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-slate-200 p-4 hover:border-dashboard-primary hover:bg-slate-50 dark:border-slate-700 dark:hover:border-dashboard-primary dark:hover:bg-slate-800"
                  >
                    <RadioGroupItem value="EMPLOYED" id="employed" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">Employed</p>
                      <p className="text-sm text-slate-500">Currently working</p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="unemployed"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-slate-200 p-4 hover:border-dashboard-primary hover:bg-slate-50 dark:border-slate-700 dark:hover:border-dashboard-primary dark:hover:bg-slate-800"
                  >
                    <RadioGroupItem value="UNEMPLOYED" id="unemployed" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">Unemployed</p>
                      <p className="text-sm text-slate-500">Seeking employment</p>
                    </div>
                  </Label>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* If Employed */}
        {employmentStatus === "EMPLOYED" && (
          <div className="mt-6 space-y-6 rounded-lg border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-700 dark:bg-slate-800/30">
            <FormField
              control={form.control}
              name="employment.employedType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Employment</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="WAGE" id="wage" />
                        <Label htmlFor="wage">Wage Employed</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="SELF_EMPLOYED" id="self-employed" />
                        <Label htmlFor="self-employed">Self-employed</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {employedType === "SELF_EMPLOYED" && (
              <div className="space-y-3 pl-6">
                {[
                  { id: "fisherman", label: "Fisherman" },
                  { id: "vendor", label: "Vendor" },
                  { id: "homeBased", label: "Home-based" },
                  { id: "transport", label: "Transport" },
                  { id: "domestic", label: "Domestic Worker" },
                  { id: "freelancer", label: "Freelancer" },
                  { id: "artisan", label: "Artisan" },
                ].map((type) => (
                  <FormField
                    key={type.id}
                    control={form.control}
                    name={`employment.selfEmployedTypes.${type.id}`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer font-normal">
                          {type.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
                <FormField
                  control={form.control}
                  name="employment.selfEmployedTypes.others"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Others (specify)</FormLabel>
                      <FormControl>
                        <Input placeholder="Specify other type" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* If Unemployed */}
        {employmentStatus === "UNEMPLOYED" && (
          <div className="mt-6 space-y-6 rounded-lg border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-700 dark:bg-slate-800/30">
            <FormField
              control={form.control}
              name="employment.unemployedReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Unemployment</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="NEW_ENTRANT" id="new-entrant" />
                        <Label htmlFor="new-entrant">New Entrant / Fresh Graduate</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="FINISHED_CONTRACT" id="finished" />
                        <Label htmlFor="finished">Finished Contract</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="RESIGNED" id="resigned" />
                        <Label htmlFor="resigned">Resigned</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="RETIRED" id="retired" />
                        <Label htmlFor="retired">Retired</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="TERMINATED_LOCAL" id="terminated-local" />
                        <Label htmlFor="terminated-local">Terminated (Local)</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="TERMINATED_ABROAD" id="terminated-abroad" />
                        <Label htmlFor="terminated-abroad">Terminated (Abroad)</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="TERMINATED_CALAMITY" id="calamity" />
                        <Label htmlFor="calamity">Terminated (Due to Calamity)</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="OTHERS" id="other-reason" />
                        <Label htmlFor="other-reason">Others</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {unemployedReason === "TERMINATED_ABROAD" && (
              <FormField
                control={form.control}
                name="employment.terminatedCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country where terminated" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {unemployedReason === "OTHERS" && (
              <FormField
                control={form.control}
                name="employment.unemployedReasonOthers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify reason</FormLabel>
                    <FormControl>
                      <Input placeholder="Specify other reason" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="employment.jobSearchDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How long have you been looking for work? (months)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="6" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* OFW Status */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
            Overseas Employment
          </h3>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="employment.isOfw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Are you an Overseas Filipino Worker (OFW)?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === "true")}
                      value={field.value ? "true" : "false"}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="true" id="ofw-yes" />
                        <Label htmlFor="ofw-yes">Yes</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="false" id="ofw-no" />
                        <Label htmlFor="ofw-no">No</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isOfw && (
              <FormField
                control={form.control}
                name="employment.ofwCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country of work" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="employment.isFormerOfw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Are you a former OFW?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === "true")}
                      value={field.value ? "true" : "false"}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="true" id="former-ofw-yes" />
                        <Label htmlFor="former-ofw-yes">Yes</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="false" id="former-ofw-no" />
                        <Label htmlFor="former-ofw-no">No</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isFormerOfw && (
              <>
                <FormField
                  control={form.control}
                  name="employment.formerOfwCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latest Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Latest country of work" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employment.ofwReturnDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month & Year of Return</FormLabel>
                      <FormControl>
                        <Input type="month" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </div>

        {/* 4Ps Program */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-200">
            4Ps Program
          </h3>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="employment.is4PsBeneficiary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Are you a 4Ps beneficiary?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === "true")}
                      value={field.value ? "true" : "false"}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="true" id="4ps-yes" />
                        <Label htmlFor="4ps-yes">Yes</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="false" id="4ps-no" />
                        <Label htmlFor="4ps-no">No</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {is4PsBeneficiary && (
              <FormField
                control={form.control}
                name="employment.householdIdNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Household ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="4Ps Household ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
