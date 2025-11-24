"use client";

import { useRouter } from "next/navigation";
import { Form } from "radix-ui";
import { type FormEvent, use, useState } from "react";

import { Button } from "@/components/general/Button";
import { AuthContext } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

function ChangePasswordForm() {
  const {
    user,
    loading: userLoading,
    isAuthenticated,
    signOut,
  } = use(AuthContext);

  const supabase = createClient();

  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  async function handleSignOut(): Promise<void> {
    await signOut("global");
    router.push("/auth/signin");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    try {
      e.preventDefault();

      setLoading(true);
      setError("");
      setMessage("");

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match");

        return;
      }

      // Validate password length
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters");

        return;
      }

      // Validate passwords are different
      if (currentPassword === newPassword) {
        setError("New password must be different from current password");

        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);

        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated successfully! Logging out...");

      // Log out and redirect after a brief delay
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handleSignOut();
      }, 1500);
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
        <h2 className="font-bold">Change Password</h2>
      </header>
      <div className="space-y-2 px-4">
        <Form.Root className="space-y-4" onSubmit={handleSubmit}>
          <div className="sr-only">
            <label htmlFor="username">Username</label>
            <input
              autoComplete="username"
              id="username"
              name="username"
              readOnly
              tabIndex={-1}
              type="text"
              value={user.email ?? ""}
            />
          </div>

          <Form.Field name="current-password">
            <div className="flex items-baseline justify-between">
              <Form.Label className="block text-sm font-medium">
                Current Password
              </Form.Label>
              <Form.Message
                className="text-xs text-red-600"
                match="valueMissing"
              >
                Please enter your current password
              </Form.Message>
              <Form.Message className="text-xs text-red-600" match="tooShort">
                Password must be at least 8 characters
              </Form.Message>
            </div>
            <Form.Control
              autoComplete="current-password"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              minLength={8}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              type="password"
              value={currentPassword}
            />
            <p className="mt-1 text-xs">
              For security, please enter your current password
            </p>
          </Form.Field>

          <Form.Field name="new-password">
            <div className="flex items-baseline justify-between">
              <Form.Label className="block text-sm font-medium">
                New Password
              </Form.Label>
              <Form.Message
                className="text-xs text-red-600"
                match="valueMissing"
              >
                Please enter a new password
              </Form.Message>
              <Form.Message className="text-xs text-red-600" match="tooShort">
                Password must be at least 8 characters
              </Form.Message>
            </div>
            <Form.Control
              autoComplete="new-password"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              minLength={8}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </Form.Field>

          <Form.Field name="confirm-password">
            <div className="flex items-baseline justify-between">
              <Form.Label className="block text-sm font-medium">
                Confirm New Password
              </Form.Label>
              <Form.Message
                className="text-xs text-red-600"
                match="valueMissing"
              >
                Please confirm your password
              </Form.Message>
              <Form.Message className="text-xs text-red-600" match="tooShort">
                Password must be at least 8 characters
              </Form.Message>
            </div>
            <Form.Control
              autoComplete="new-password"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              minLength={8}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </Form.Field>

          <Form.Submit asChild>
            <Button disabled={loading} type="submit">
              {loading ? "Updating..." : "Update Password"}
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
      </div>
    </section>
  );
}

export { ChangePasswordForm };
