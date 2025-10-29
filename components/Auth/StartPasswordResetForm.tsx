"use client";

import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

function StartPasswordResetForm() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const supabase = createClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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
  };

  return (
    <form className="mx-auto max-w-md space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold">Reset Password</h2>

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

      <button
        className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
        type="submit"
      >
        {loading ? "Sending..." : "Send Reset Email"}
      </button>

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

export { StartPasswordResetForm };
