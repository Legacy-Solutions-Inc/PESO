import Image from "next/image";
import Link from "next/link";
import { signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Briefcase } from "lucide-react";

export const metadata = {
  title: "Sign Up – NSRP Jobseeker Registration",
  description: "Create your PESO account",
};

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="w-full min-h-screen max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center relative z-10 px-4 py-8 lg:px-12 lg:py-12">
      {/* Left column: hero + features (same as login) */}
      <div className="lg:col-span-7 flex flex-col justify-center space-y-8 order-2 lg:order-1 text-center lg:text-left">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-blue-100 text-blue-700 w-fit mx-auto lg:mx-0">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Official Portal
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            NSRP Jobseeker{" "}
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
              Registration System
            </span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Welcome to the Public Employment Service Office (PESO) Lambunao
            digital hub. We are dedicated to facilitating employment and
            connecting job seekers with opportunities. This system streamlines
            your registration process, ensuring efficient and secure access to
            employment services provided by the local government.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <div className="flex items-center gap-2 text-gray-500">
              <CheckCircle2 className="size-5 text-green-500 shrink-0" />
              <span className="text-sm font-medium">Secure Data</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <CheckCircle2 className="size-5 text-green-500 shrink-0" />
              <span className="text-sm font-medium">Fast Processing</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <CheckCircle2 className="size-5 text-green-500 shrink-0" />
              <span className="text-sm font-medium">Government Certified</span>
            </div>
          </div>
        </div>
        <div className="relative hidden lg:block mt-8">
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/40 border border-white/50 backdrop-blur-sm max-w-lg">
            <div className="p-4 bg-blue-100 rounded-xl shrink-0">
              <Briefcase className="size-10 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Job Matching Services
              </h3>
              <p className="text-sm text-gray-600">
                Efficiently connecting skills with local and overseas
                opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right column: sign-up card */}
      <main className="lg:col-span-5 w-full max-w-md mx-auto lg:mx-0 order-1 lg:order-2">
        <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-2xl rounded-2xl p-8 md:p-10 w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-400 via-indigo-500 to-blue-400 opacity-80" />
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Image
                alt="Municipality of Lambunao Seal"
                src="/lambunao-seal.png"
                width={64}
                height={64}
                className="object-contain drop-shadow-md"
              />
              <div className="h-10 w-px bg-gray-300" />
              <Image
                alt="PESO Lambunao Logo"
                src="/peso-logo.jpg"
                width={64}
                height={64}
                className="object-contain drop-shadow-md rounded"
              />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-1 tracking-tight">
              Sign up
            </h2>
            <p className="text-sm text-center text-gray-500">
              Create your PESO account
            </p>
          </div>

          <SignUpForm searchParams={searchParams} />

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Protected by Government Security Standards.
              <br />
              Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

async function SignUpForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <form action={signUp} className="space-y-6">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className="space-y-1">
        <Label htmlFor="email" className="ml-1">
          Email
        </Label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Enter your email"
            className="pl-10 rounded-lg border-gray-300 bg-white/50"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="password" className="ml-1">
          Password
        </Label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
            className="pl-10 rounded-lg border-gray-300 bg-white/50"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="confirmPassword" className="ml-1">
          Confirm password
        </Label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
            className="pl-10 rounded-lg border-gray-300 bg-white/50"
          />
        </div>
      </div>
      <div>
        <Button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
        >
          Sign up
        </Button>
      </div>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
