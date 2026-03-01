import Image from "next/image";
import { SignUpForm } from "./sign-up-form";

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

          <SignUpFormWrapper searchParams={searchParams} />
        </div>
      </main>
    </div>
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
