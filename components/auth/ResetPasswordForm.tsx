"use client";

import { useSearchParams } from "next/navigation";
import { Form } from "radix-ui";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/general/Button";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const supabase = createClient();

  const searchParams = useSearchParams();

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Check for errors in URL on mount (both query params and hash)
  useEffect(() => {
    // Check query parameters
    const paramError = searchParams.get("error");
    const paramErrorDescription = searchParams.get("error_description");
    const paramErrorCode = searchParams.get("error_code");

    // Also check hash parameters (Supabase uses hash for some errors)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashError = hashParams.get("error");
    const hashErrorDescription = hashParams.get("error_description");
    const hashErrorCode = hashParams.get("error_code");

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const finalError = paramError || hashError;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const finalErrorDescription = paramErrorDescription || hashErrorDescription;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const finalErrorCode = paramErrorCode || hashErrorCode;

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
      setError(errorMessage);
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    try {
      e.preventDefault();

      setIsPending(true);
      setError("");
      setMessage("");

      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password length
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setPassword("");
      setConfirmPassword("");
      setMessage(
        "Password updated successfully! You can now log in with your new password.",
      );
    } catch (err: unknown) {
      console.error(err);
      const errMessage = err instanceof Error ? err.message : "Form failed";
      setError(errMessage);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form.Root className="mx-auto max-w-md space-y-4" onSubmit={handleSubmit}>
      <Form.Field name="password">
        <div className="flex items-baseline justify-between">
          <Form.Label className="block text-sm font-medium">
            New Password
          </Form.Label>
          <Form.Message className="text-xs text-red-600" match="valueMissing">
            Please enter a password
          </Form.Message>
          <Form.Message className="text-xs text-red-600" match="tooShort">
            Password must be at least 8 characters
          </Form.Message>
        </div>
        <Form.Control
          className="w-full rounded-xs border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          minLength={8}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
      </Form.Field>

      <Form.Field name="confirmPassword">
        <div className="flex items-baseline justify-between">
          <Form.Label className="block text-sm font-medium">
            Confirm New Password
          </Form.Label>
          <Form.Message className="text-xs text-red-600" match="valueMissing">
            Please confirm your password
          </Form.Message>
          <Form.Message className="text-xs text-red-600" match="tooShort">
            Password must be at least 8 characters
          </Form.Message>
        </div>
        <Form.Control
          className="w-full rounded-xs border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          minLength={8}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          type="password"
          value={confirmPassword}
        />
      </Form.Field>

      <Form.Submit asChild>
        <Button disabled={isPending} type="submit" width="full">
          {isPending ? "Updating..." : "Update Password"}
        </Button>
      </Form.Submit>

      {message ? (
        <p className="text-sm text-green-600" role="alert">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </Form.Root>
  );
}

export { ResetPasswordForm };
