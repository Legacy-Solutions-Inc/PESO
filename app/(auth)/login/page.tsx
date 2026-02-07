import Image from "next/image";
import { LoginForm } from "./login-form";
import { CheckCircle2, Briefcase } from "lucide-react";

export const metadata = {
  title: "Sign In – NSRP Jobseeker Registration",
  description: "Access your PESO account",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  return (
    <div className="w-full min-h-screen max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center relative z-10 px-4 py-8 lg:px-12 lg:py-12">
      {/* Left column: hero + features */}
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

      {/* Right column: login card */}
      <main className="lg:col-span-5 w-full max-w-md mx-auto lg:mx-0 order-1 lg:order-2">
        <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-2xl rounded-2xl p-8 md:p-10 w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-400 via-indigo-500 to-blue-400 opacity-80" />
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <Image
                  alt="Municipality of Lambunao Seal"
                  src="/lambunao-seal.png"
                  width={84}
                  height={84}
                  className="object-contain drop-shadow-md"
                />
              </div>
              <div className="h-10 w-px bg-gray-300" />
              <div className="relative">
                <Image
                  alt="PESO Lambunao Logo"
                  src="/peso-logo.jpg"
                  width={84}
                  height={84}
                  className="object-contain drop-shadow-md rounded"
                />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-1 tracking-tight">
              Sign In
            </h2>
            <p className="text-sm text-center text-gray-500">
              Access your PESO account
            </p>
          </div>

          <LoginFormWrapper searchParams={searchParams} />

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

async function LoginFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  return <LoginForm message={message} />;
}
