"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { signIn, type SignInState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  message,
}: {
  message?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(signIn, null as SignInState | null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      {(state?.error ?? null) && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {state?.error}
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
            <Mail className="size-5" aria-hidden="true" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            required
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
            <Lock className="size-5" aria-hidden="true" />
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            className="pl-10 pr-10 rounded-lg border-gray-300 bg-white/50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-5" aria-hidden="true" />
            ) : (
              <Eye className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
            Remember me
          </Label>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Forgot password?
        </Link>
      </div>
      <div>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
        >
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </div>
      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
