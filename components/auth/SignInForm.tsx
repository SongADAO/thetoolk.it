"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, use, useEffect, useState } from "react";

import { TOTPVerification } from "@/components/auth/TOTPVerification";
import { Button } from "@/components/general/Button";
import { AuthContext } from "@/contexts/AuthContext";

function SignInForm() {
  const { signIn, signOut } = use(AuthContext);

  const router = useRouter();

  const searchParams = useSearchParams();

  const [needsTOTP, setNeedsTOTP] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "mfa_required") {
      setError("Two-factor authentication is required to sign in.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError("");

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error: signInError } = await signIn(email, password);

    if (signInError) {
      // Check if the error is due to MFA being required
      if (
        signInError.message?.includes("MFA") ||
        signInError.message?.includes("factor")
      ) {
        setNeedsTOTP(true);
      } else {
        setError(signInError.message);
      }
    } else if (data?.user?.factors && data.user.factors.length > 0) {
      // User has MFA enabled
      setNeedsTOTP(true);
    } else {
      setPassword("");
      setEmail("");
      // Redirect after successful login
      router.push("/pro");
    }

    setLoading(false);
  }

  function handleTOTPVerified() {
    setPassword("");
    setEmail("");
    setNeedsTOTP(false);
    router.push("/pro");
  }

  async function handleTOTPCancel() {
    setNeedsTOTP(false);
    setPassword("");
    // Sign out the user since they cancelled MFA verification
    await signOut("local");
    setError("Two-factor authentication is required to sign in.");
  }

  if (needsTOTP) {
    return (
      <TOTPVerification
        onCancel={handleTOTPCancel}
        onVerified={handleTOTPVerified}
      />
    );
  }

  return (
    <form className="mx-auto w-full max-w-md space-y-4" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">Sign In</h1>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      <Button disabled={loading} type="submit" width="full">
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}

export { SignInForm };
