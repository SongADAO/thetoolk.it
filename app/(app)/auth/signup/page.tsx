import type { Metadata } from "next";
import Link from "next/link";

import { SignUpForm } from "@/components/Auth/SignUpForm";

export const metadata: Metadata = {
  alternates: {
    canonical: "/auth/signup",
  },
  description:
    "Sign up for a new account on TheToolk.it to access our powerful tools and features.",
  title: "Sign Up - TheToolk.it",
};
export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center p-4 md:pt-20">
      <div className="w-full">
        <SignUpForm />

        <div className="mt-8 text-center">
          <h3 className="font-bold">Already have an account?</h3>
          <Link
            className="text-blue-600 underline hover:text-blue-800"
            href="/auth/signin"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
