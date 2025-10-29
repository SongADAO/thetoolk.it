"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

function AccountSettingsForm() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [emailMessage, setEmailMessage] = useState<string>("");
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/auth/signin");
  }

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getUser();
  }, [supabase.auth]);

  const handlePasswordChange = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
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
        signOut();
      }, 1500);
    }

    setLoading(false);
  };

  const handleEmailChange = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailMessage("");

    // Validate email is different
    if (email === user?.email) {
      setEmailMessage("New email must be different from current email");
      setEmailLoading(false);
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
      setEmailMessage(error.message);
    } else {
      setEmailMessage("Confirmation email sent! Logging out for security...");

      // Log out and redirect after a brief delay
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        signOut();
      }, 2000);
    }

    setEmailLoading(false);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-gray-600">
          Please log in to access account settings.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      {/* Email Change Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Change Email</h2>
        <form className="space-y-4" onSubmit={handleEmailChange}>
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="current-email"
            >
              Current Email
            </label>
            <input
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
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              id="new-email"
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              value={email}
            />
          </div>

          <button
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={emailLoading}
            type="submit"
          >
            {emailLoading ? "Updating..." : "Update Email"}
          </button>

          {emailMessage ? (
            <p
              className={`text-sm ${emailMessage.includes("sent") ? "text-green-600" : "text-red-600"}`}
            >
              {emailMessage}
            </p>
          ) : null}
        </form>
      </div>

      {/* Password Change Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Change Password</h2>
        <form className="space-y-4" onSubmit={handlePasswordChange}>
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="current-password"
            >
              Current Password
            </label>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              id="current-password"
              minLength={6}
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
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              id="new-password"
              minLength={6}
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
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              id="confirm-password"
              minLength={6}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </div>

          <button
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
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
    </div>
  );
}

export { AccountSettingsForm };
