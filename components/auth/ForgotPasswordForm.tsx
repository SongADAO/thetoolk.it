"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/general/Button";
import { createClient } from "@/lib/supabase/client";

function ForgotPasswordForm() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const supabase = createClient();

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setEmail("");
      setMessage("Check your email for password reset instructions!");
    }

    setLoading(false);
  }

  return (
    <form className="mx-auto max-w-md space-y-4" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">Forgot Password</h1>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      <Button disabled={loading} type="submit" width="full">
        {loading ? "Sending..." : "Send Reset Email"}
      </Button>

      {message ? (
        <p
          className={`text-sm ${message.includes("Check") ? "text-green-600" : "text-red-600"}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

export { ForgotPasswordForm };
