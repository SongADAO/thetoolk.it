"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const supabase = createClient();
  const searchParams = useSearchParams();

  // Check for errors in URL on mount (both query params and hash)
  useEffect(() => {
    // Check query parameters
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const errorCode = searchParams.get("error_code");

    // Also check hash parameters (Supabase uses hash for some errors)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashError = hashParams.get("error");
    const hashErrorDescription = hashParams.get("error_description");
    const hashErrorCode = hashParams.get("error_code");

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const finalError = error || hashError;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const finalErrorDescription = errorDescription || hashErrorDescription;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const finalErrorCode = errorCode || hashErrorCode;

    if (finalError) {
      let errorMessage =
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        finalErrorDescription || finalError.replace(/_/gu, " ");

      // Provide user-friendly messages for common errors
      if (
        finalErrorCode === "404" ||
        finalError === "invalid_link" ||
        finalError === "otp_expired"
      ) {
        errorMessage =
          "This password reset link is invalid or has expired. Please request a new one.";
      } else if (finalError === "access_denied") {
        errorMessage =
          "Access denied. This link may have already been used or is no longer valid.";
      } else if (finalError === "unauthorized") {
        errorMessage =
          "Unauthorized access. Please request a new password reset link.";
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage(errorMessage);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setPassword("");
      setConfirmPassword("");
      setMessage(
        "Password updated successfully! You can now log in with your new password.",
      );
    }

    setLoading(false);
  };

  return (
    <form className="mx-auto max-w-md space-y-4" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">Set New Password</h1>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="password">
          New Password
        </label>
        <input
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          id="password"
          minLength={6}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      <div>
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="confirmPassword"
        >
          Confirm New Password
        </label>
        <input
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          id="confirmPassword"
          minLength={6}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          type="password"
          value={confirmPassword}
        />
      </div>

      <button
        className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
        type="submit"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>

      {message ? (
        <p
          className={`text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

export { ResetPasswordForm };
