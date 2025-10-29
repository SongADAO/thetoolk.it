import Link from "next/link";

import SignInForm from "@/components/Auth/SignInForm";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center p-4 md:pt-20">
      <div className="w-full">
        <SignInForm />

        <div className="mt-8 text-center">
          <h3 className="font-bold">Don&apos;t have an account?</h3>
          <Link
            className="text-blue-600 underline hover:text-blue-800"
            href="/auth/signup"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
