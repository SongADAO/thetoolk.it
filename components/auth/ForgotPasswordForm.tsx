"use client";

import { Form } from "radix-ui";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/general/Button";
import { createClient } from "@/lib/supabase/client";

function ForgotPasswordForm() {
  const supabase = createClient();

  const [email, setEmail] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    try {
      e.preventDefault();

      setLoading(true);
      setError("");
      setMessage("");

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        },
      );

      if (resetError) {
        setError(resetError.message);

        return;
      }

      setEmail("");
      setMessage("Check your email for password reset instructions!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form.Root className="mx-auto max-w-md space-y-4" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">Forgot Password</h1>

      <Form.Field name="email">
        <div className="flex items-baseline justify-between">
          <Form.Label className="block text-sm font-medium">Email</Form.Label>
          <Form.Message className="text-xs text-red-600" match="valueMissing">
            Please enter your email
          </Form.Message>
          <Form.Message className="text-xs text-red-600" match="typeMismatch">
            Please provide a valid email
          </Form.Message>
        </div>
        <Form.Control
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
      </Form.Field>

      <Form.Submit asChild>
        <Button disabled={loading} type="submit" width="full">
          {loading ? "Sending..." : "Send Reset Email"}
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

export { ForgotPasswordForm };
