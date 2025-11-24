"use client";

import { useRouter } from "next/navigation";
import { FormEvent, use, useState } from "react";

import { Button } from "@/components/general/Button";
import { AuthContext } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

function ChangeEmailForm() {
  const {
    user,
    loading: userLoading,
    isAuthenticated,
    signOut,
  } = use(AuthContext);

  const supabase = createClient();

  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  async function handleSignOut(): Promise<void> {
    await signOut("global");
    router.push("/auth/signin");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    try {
      e.preventDefault();
      setLoading(true);
      setMessage("");

      // Validate email is different
      if (email === user?.email) {
        setMessage("New email must be different from current email");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser(
        {
          email,
        },
        {
          emailRedirectTo: `${window.location.origin}/auth/confirm-email`,
        },
      );

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Confirmation email sent! Logging out for security...");

        // Log out and redirect after a brief delay
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          handleSignOut();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  if (userLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-4 text-center">
        Please log in to access your account.
      </div>
    );
  }

  return (
    <section className="mx-auto w-full space-y-4 rounded bg-gray-100 pb-4 contain-paint">
      <header className="bg-gray-300 px-4 py-2">
        <h2 className="font-bold">Change Email</h2>
      </header>
      <div className="space-y-2 px-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="current-email"
            >
              Current Email
            </label>
            <input
              autoComplete="email"
              className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2"
              disabled
              id="current-email"
              type="email"
              value={user.email ?? ""}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="new-email"
            >
              New Email
            </label>
            <input
              autoComplete="email"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              id="new-email"
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              value={email}
            />
          </div>

          <Button disabled={loading} type="submit">
            {loading ? "Updating..." : "Update Email"}
          </Button>

          {message ? (
            <p
              className={`text-sm ${message.includes("sent") ? "text-green-600" : "text-red-600"}`}
            >
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

export { ChangeEmailForm };
