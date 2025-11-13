"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

function ConfirmEmail() {
  const [message, setMessage] = useState<string>(
    "Processing email confirmation...",
  );
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check for errors in both query params and hash
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashError = hashParams.get("error");
      const hashErrorDescription = hashParams.get("error_description");

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      const finalError = error || hashError;
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      const finalErrorDescription = errorDescription || hashErrorDescription;

      if (finalError) {
        setIsError(true);
        setIsLoading(false);

        // Provide user-friendly error messages
        if (finalError === "access_denied") {
          setMessage(
            "This confirmation link has already been used or is no longer valid.",
          );
        } else if (
          finalError === "invalid_link" ||
          finalError === "otp_expired"
        ) {
          setMessage(
            "This confirmation link has expired. Please request a new email change from your account settings.",
          );
        } else {
          setMessage(
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            finalErrorDescription ||
              "There was an error confirming your email change. Please try again.",
          );
        }
        return;
      }

      // Check if there's a confirmation success
      const type = hashParams.get("type");

      if (type === "email_change") {
        setMessage(
          "Email confirmation successful! You've confirmed one of the two required emails. Please check and confirm the other email if you haven't already. Once both are confirmed, you can sign in with your new email address.",
        );
        setIsLoading(false);
      } else {
        // Get the current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setMessage(
            "Email confirmation processed. If you've confirmed both emails (old and new), you can now sign in with your new email address.",
          );
        } else {
          setMessage(
            "Email confirmation received. Please confirm both emails (if you haven't already), then sign in with your new email address.",
          );
        }
        setIsLoading(false);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleEmailConfirmation();
  }, [searchParams, supabase]);

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-center text-2xl font-bold">Email Confirmation</h1>

      {isLoading ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      ) : (
        <>
          <p
            className={`text-sm ${isError ? "text-red-600" : "text-green-600"}`}
          >
            {message}
          </p>

          {!isError && (
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              <p className="mb-2 font-medium">Important:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>You must confirm BOTH emails (old and new)</li>
                <li>Check your old email inbox for the first confirmation</li>
                <li>Check your new email inbox for the second confirmation</li>
                <li>After both are confirmed, sign in with your new email</li>
              </ul>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Link
              className="w-full rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
              href="/auth/signin"
            >
              Go to Sign In
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export { ConfirmEmail };
