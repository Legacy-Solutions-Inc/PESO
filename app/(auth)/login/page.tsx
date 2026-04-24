import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in – NSRP Jobseeker Registration",
  description: "Access your PESO Lambunao staff account",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
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
        aria-labelledby="sign-in-heading"
        className="rounded-lg border border-border bg-card p-8 shadow-sm"
      >
        <div className="mb-6">
          <h2
            id="sign-in-heading"
            className="text-xl font-medium tracking-tight text-foreground"
          >
            Sign in
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Staff access only. Contact your administrator if you need an account.
          </p>
        </div>

        <LoginFormWrapper searchParams={searchParams} />
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Department of Labor and Employment &middot; National Skills Registration Program
      </p>
    </main>
  );
}

async function LoginFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  return <LoginForm message={message} />;
}
