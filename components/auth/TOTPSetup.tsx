"use client";

import type { Factor } from "@supabase/supabase-js";
import QRCode from "qrcode";
import { use, useEffect, useState } from "react";

import { AuthContext } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface EnrollmentState {
  factorId: string;
  qrCode: string;
  secret: string;
  verifyCode: string;
}

function TOTPSetup() {
  const supabase = createClient();

  const [factors, setFactors] = useState<Factor[]>([]);
  const [showTotpSetup, setShowTotpSetup] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [enrollmentState, setEnrollmentState] =
    useState<EnrollmentState | null>(null);

  const { enrollTOTP, verifyTOTPEnrollment, unenrollTOTP } = use(AuthContext);

  async function loadFactors() {
    const factorsData = await supabase.auth.mfa.listFactors();
    if (factorsData.data?.totp) {
      setFactors(factorsData.data.totp);
    }
  }

  async function setupTOTP() {
    setLoading(true);
    setError("");

    const { data, error: enrollError } = await enrollTOTP();

    if (enrollError) {
      setError(enrollError.message);
      setLoading(false);
      return;
    }

    if (data) {
      try {
        const qrCodeUrl = await QRCode.toDataURL(data.uri);
        setEnrollmentState({
          factorId: data.id,
          qrCode: qrCodeUrl,
          secret: data.secret,
          verifyCode: "",
        });
      } catch (err) {
        setError("Failed to generate QR code");
        console.error(err);
      }
    }

    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollmentState) return;

    setLoading(true);
    setError("");

    const { error: verifyError } = await verifyTOTPEnrollment(
      enrollmentState.verifyCode,
    );

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setShowTotpSetup(false);
    setEnrollmentState(null);
    setMessage("Two-factor authentication enabled successfully!");
    await loadFactors();
  }

  async function handleAddFactor() {
    setShowTotpSetup(true);
    setMessage("");
    setError("");
    setEnrollmentState(null);
    await setupTOTP();
  }

  async function handleUnenroll(factorId: string) {
    setLoading(true);
    setMessage("");
    setError("");

    const { error: unenrollError } = await unenrollTOTP(factorId);

    if (unenrollError) {
      setError(unenrollError.message);
    } else {
      setMessage("Two-factor authentication factor removed successfully");
      await loadFactors();
    }

    setLoading(false);
  }

  function onCancel() {
    setShowTotpSetup(false);
    setEnrollmentState(null);
    setError("");
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadFactors();
  }, [supabase.auth]);

  if (showTotpSetup) {
    if (loading && !enrollmentState) {
      return (
        <div className="mx-auto w-full max-w-md space-y-4 rounded-lg border border-gray-300 p-6">
          <p className="text-center">Setting up two-factor authentication...</p>
        </div>
      );
    }

    if (enrollmentState) {
      return (
        <div className="mx-auto w-full max-w-md space-y-4 rounded-lg border border-gray-300 p-6">
          <h2 className="text-xl font-bold">
            Enable Two-Factor Authentication
          </h2>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Scan this QR code with your authenticator app (Google
              Authenticator, Authy, etc.):
            </p>
            {enrollmentState.qrCode ? (
              <div className="flex justify-center">
                <img
                  alt="TOTP QR Code"
                  className="size-48"
                  src={enrollmentState.qrCode}
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Or enter this secret manually:
            </p>
            <code className="block rounded bg-gray-100 p-2 font-mono text-sm break-all">
              {enrollmentState.secret}
            </code>
          </div>

          <form className="space-y-4" onSubmit={handleVerify}>
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="verify-code"
              >
                Enter verification code from your app
              </label>
              <input
                autoComplete="off"
                className="w-full rounded border border-gray-300 px-3 py-2 text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none"
                id="verify-code"
                maxLength={6}
                onChange={(e) =>
                  setEnrollmentState({
                    ...enrollmentState,
                    verifyCode: e.target.value.replace(/\D/gu, ""),
                  })
                }
                pattern="\d{6}"
                placeholder="000000"
                required
                type="text"
                value={enrollmentState.verifyCode}
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex gap-2">
              <button
                className="flex-1 cursor-pointer rounded bg-gray-500 px-4 py-2 text-center text-white hover:bg-gray-800 disabled:opacity-50"
                disabled={loading}
                type="submit"
              >
                {loading ? "Verifying..." : "Verify and Enable"}
              </button>
              <button
                className="cursor-pointer rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
                onClick={onCancel}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      );
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Add an extra layer of security to your account by enabling two-factor
        authentication using an authenticator app.
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Your Authentication Factors</h3>
          <button
            className="cursor-pointer rounded bg-gray-500 px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
            disabled={loading}
            onClick={handleAddFactor}
            type="button"
          >
            Add Factor
          </button>
        </div>

        {factors.length === 0 ? (
          <div className="rounded border border-gray-200 p-4 text-center text-sm text-gray-500">
            No two-factor authentication factors configured yet.
          </div>
        ) : (
          <div className="space-y-2">
            {factors.map((factor) => (
              <div
                className="flex items-center justify-between rounded border border-gray-200 p-3"
                key={factor.id}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {factor.friendly_name || "TOTP Factor"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        factor.status === "verified"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {factor.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Created: {new Date(factor.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="cursor-pointer rounded bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 disabled:opacity-50"
                  disabled={loading}
                  onClick={async () => handleUnenroll(factor.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {message ? (
        <p
          className={`text-sm ${
            message.includes("successfully") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      ) : null}

      {error && !showTotpSetup ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

export { TOTPSetup };
