import Image from "next/image";
import Link from "next/link";
import { resetPassword } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = {
  title: "Forgot Password – NSRP Jobseeker Registration",
  description: "Reset your PESO account password",
};

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  return (
    <div className="w-full min-h-screen max-w-md mx-auto relative z-10 flex items-center justify-center px-4 py-8">
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
            Forgot password
          </h2>
          <p className="text-sm text-center text-gray-500">
            Enter your email to receive a reset link
          </p>
        </div>

        <ForgotPasswordForm searchParams={searchParams} />

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Back to sign in
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Protected by Government Security Standards.
          </p>
        </div>
      </div>
    </div>
  );
}

async function ForgotPasswordForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <form action={resetPassword} className="space-y-6">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
          {message}
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
      <Button
        type="submit"
        className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
      >
        Send reset link
      </Button>
    </form>
  );
}
