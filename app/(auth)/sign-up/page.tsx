import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Request access – NSRP Jobseeker Registration",
  description: "How to get a PESO Lambunao staff account",
};

export default function SignUpPage() {
  return (
    <main className="w-full max-w-md px-6 py-12">
      <header className="mb-10 flex flex-col items-center text-center">
        <div className="mb-6 flex items-center justify-center gap-4">
          <Image
            alt="Municipality of Lambunao seal"
            src="/lambunao-seal.png"
            width={72}
            height={72}
            className="object-contain"
            priority
          />
          <div className="h-12 w-px bg-border" aria-hidden />
          <Image
            alt="PESO Lambunao logo"
            src="/peso-logo.jpg"
            width={72}
            height={72}
            className="rounded-sm object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          PESO Lambunao
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          NSRP Jobseeker Registration System
        </p>
      </header>

      <section
        aria-labelledby="access-heading"
        className="rounded-lg border border-border bg-card p-8 shadow-sm"
      >
        <h2
          id="access-heading"
          className="text-xl font-medium tracking-tight text-foreground"
        >
          Requesting an account
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Accounts for this system are created by administrators. If you are PESO Lambunao staff, please contact your office administrator and provide your official government email address. An administrator will create the account and send you sign-in instructions.
        </p>
        <div className="mt-6">
          <Button asChild className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Department of Labor and Employment &middot; National Skills Registration Program
      </p>
    </main>
  );
}
