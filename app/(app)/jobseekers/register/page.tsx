import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobseekerRegistrationFormLayout } from "@/components/jobseeker-registration/form-layout";

export default async function JobseekerRegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <JobseekerRegistrationFormLayout encoderEmail={user.email ?? ""} />;
}
