"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { LinkButton } from "@/components/general/LinkButton";
import { createClient } from "@/lib/supabase/client";

function ConfirmEmail() {
  const supabase = createClient();

  const searchParams = useSearchParams();

  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isPending, setIsPending] = useState<boolean>(true);

  useEffect(() => {
    async function handleEmailConfirmation(): Promise<void> {
      try {
        // Check for errors in both query params and hash
        const paramError = searchParams.get("error");
        const paramErrorDescription = searchParams.get("error_description");

        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );
        const hashError = hashParams.get("error");
        const hashErrorDescription = hashParams.get("error_description");

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const finalError = paramError || hashError;
        const finalErrorDescription =
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          paramErrorDescription || hashErrorDescription;

        if (finalError) {
          // Provide user-friendly error messages
          if (finalError === "access_denied") {
            throw new Error(
              "This confirmation link has already been used or is no longer valid.",
            );
          }

          if (finalError === "invalid_link" || finalError === "otp_expired") {
            throw new Error(
              "This confirmation link has expired. Please request a new email change from your account settings.",
            );
          }

          throw new Error(
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            finalErrorDescription ||
              "There was an error confirming your email change. Please try again.",
          );
        }

        // Check if there's a confirmation success
        const type = hashParams.get("type");

        if (type === "email_change") {
          setMessage(
            "Email confirmation successful! You've confirmed one of the two required emails. Please check and confirm the other email if you haven't already. Once both are confirmed, you can sign in with your new email address.",
          );

          return;
        }

        // Get the current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setMessage(
            "Email confirmation processed. If you've confirmed both emails (old and new), you can now sign in with your new email address.",
          );

          return;
        }

        setMessage(
          "Email confirmation received. Please confirm both emails (if you haven't already), then sign in with your new email address.",
        );
      } catch (err: unknown) {
        console.error(err);
        const errMessage = err instanceof Error ? err.message : "Form failed";
        setError(errMessage);
        setMessage("");
      } finally {
        setIsPending(false);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleEmailConfirmation();
  }, [searchParams, supabase]);

  return (
    <section className="mx-auto w-full max-w-lg space-y-4 rounded bg-gray-100 pb-4 contain-paint">
      <header className="bg-gray-300 px-4 py-2">
        <h1 className="font-bold">Email Confirmation</h1>
      </header>
      <div className="space-y-4 px-4">
        {isPending ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            <p className="text-sm text-gray-600">
              Processing email confirmation...
            </p>
          </div>
        ) : (
          <>
            {message ? (
              <p
                className="rounded bg-white p-4 text-sm text-green-600"
                role="alert"
              >
                {message}
              </p>
            ) : null}

            {error ? (
              <p
                className="rounded bg-white p-4 text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            {error ? (
              <div className="rounded bg-white p-4 text-sm text-blue-800">
                <p className="mb-2 font-medium">Important:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>You must confirm BOTH emails (old and new)</li>
                  <li>Check your old email inbox for the first confirmation</li>
                  <li>
                    Check your new email inbox for the second confirmation
                  </li>
                  <li>After both are confirmed, sign in with your new email</li>
                </ul>
              </div>
            ) : null}

            <div className="flex flex-col space-y-2">
              <LinkButton href="/auth/signin">Go to Sign In</LinkButton>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export { ConfirmEmail };
