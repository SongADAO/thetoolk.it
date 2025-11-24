"use client";

import { useRouter } from "next/navigation";
import { FormEvent, use, useState } from "react";

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

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        setMessage("New passwords do not match");
        setLoading(false);
        return;
      }

      // Validate password length
      if (newPassword.length < 6) {
        setMessage("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      // Validate passwords are different
      if (currentPassword === newPassword) {
        setMessage("New password must be different from current password");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage("Password updated successfully! Logging out...");

        // Log out and redirect after a brief delay
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          handleSignOut();
        }, 1500);
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
        <h2 className="font-bold">Change Password</h2>
      </header>
      <div className="space-y-2 px-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
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

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="current-password"
            >
              Current Password
            </label>
            <input
              autoComplete="current-password"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              id="current-password"
              minLength={8}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              type="password"
              value={currentPassword}
            />
            <p className="mt-1 text-xs text-gray-500">
              For security, please enter your current password
            </p>
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="new-password"
            >
              New Password
            </label>
            <input
              autoComplete="new-password"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              id="new-password"
              minLength={8}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="confirm-password"
            >
              Confirm New Password
            </label>
            <input
              autoComplete="new-password"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              id="confirm-password"
              minLength={8}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </div>

          <button
            className="w-full cursor-pointer rounded bg-gray-500 px-4 py-2 text-center text-white hover:bg-gray-800 disabled:opacity-50"
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
      </div>
    </section>
  );
}

export { ChangePasswordForm };
