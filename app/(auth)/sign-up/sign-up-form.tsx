"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm({ initialError }: { initialError?: string }) {
  const [state, formAction, isPending] = useActionState(signUp, { error: initialError });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      {(state?.error) && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {state.error}
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
            <Lock className="size-5" aria-hidden="true" />
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            autoComplete="new-password"
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
      <div className="space-y-1">
        <Label htmlFor="confirmPassword" className="ml-1">
          Confirm password
        </Label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Lock className="size-5" aria-hidden="true" />
          </div>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
            className="pl-10 pr-10 rounded-lg border-gray-300 bg-white/50"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="size-5" aria-hidden="true" />
            ) : (
              <Eye className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <div>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
        >
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isPending ? "Creating account..." : "Sign up"}
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
