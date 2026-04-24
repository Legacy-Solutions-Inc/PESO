import Image from "next/image";
import { SignUpForm } from "./sign-up-form";

export const metadata = {
  title: "Request account – NSRP Jobseeker Registration",
  description: "Request a PESO Lambunao staff account",
};

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
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
        aria-labelledby="sign-up-heading"
        className="rounded-lg border border-border bg-card p-8 shadow-sm"
      >
        <div className="mb-6">
          <h2
            id="sign-up-heading"
            className="text-xl font-medium tracking-tight text-foreground"
          >
            Request an account
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            New accounts require administrator approval before access is granted.
          </p>
        </div>

        <SignUpFormWrapper searchParams={searchParams} />
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Department of Labor and Employment &middot; National Skills Registration Program
      </p>
    </main>
  );
}

async function SignUpFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <SignUpForm initialError={error} />;
}
