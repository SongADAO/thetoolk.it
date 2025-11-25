"use client";

import { useRouter } from "next/navigation";
import { Form } from "radix-ui";
import { type FormEvent, use, useState } from "react";

import { Button } from "@/components/general/Button";
import { AuthContext } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

function ChangeEmailForm() {
  const { user, isLoading, isAuthenticated, signOut } = use(AuthContext);

  const supabase = createClient();

  const router = useRouter();

  const [email, setEmail] = useState<string>("");

  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  async function handleSignOut(): Promise<void> {
    await signOut("global");
    router.push("/auth/signin");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    try {
      e.preventDefault();

      setIsPending(true);
      setError("");
      setMessage("");

      // Validate email is different
      if (email === user?.email) {
        throw new Error("New email must be different from current email");
      }

      const { error: updateError } = await supabase.auth.updateUser(
        {
          email,
        },
        {
          emailRedirectTo: `${window.location.origin}/auth/confirm-email`,
        },
      );

      if (updateError) {
        throw new Error(updateError.message);
      }

      setMessage("Confirmation email sent! Logging out for security...");

      // Log out and redirect after a brief delay
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handleSignOut();
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      const errMessage = err instanceof Error ? err.message : "Form failed";
      setError(errMessage);
    } finally {
      setIsPending(false);
    }
  }

  if (isLoading) {
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
    <Form.Root className="space-y-4" onSubmit={handleSubmit}>
      <Form.Field name="current-email">
        <Form.Label className="block text-sm font-medium">
          Current Email
        </Form.Label>
        <Form.Control
          autoComplete="email"
          className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2"
          disabled
          type="email"
          value={user.email ?? ""}
        />
      </Form.Field>

      <Form.Field name="new-email">
        <div className="flex items-baseline justify-between">
          <Form.Label className="block text-sm font-medium">
            New Email
          </Form.Label>
          <Form.Message className="text-xs text-red-600" match="valueMissing">
            Please enter a new email
          </Form.Message>
          <Form.Message className="text-xs text-red-600" match="typeMismatch">
            Please provide a valid email
          </Form.Message>
        </div>
        <Form.Control
          autoComplete="email"
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
      </Form.Field>

      <Form.Submit asChild>
        <Button disabled={isPending} type="submit">
          {isPending ? "Updating..." : "Update Email"}
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

export { ChangeEmailForm };
