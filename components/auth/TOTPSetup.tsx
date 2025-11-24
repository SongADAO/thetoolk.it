"use client";

import type { Factor } from "@supabase/supabase-js";
import { use, useEffect, useState } from "react";

import { Button } from "@/components/general/Button";
import { AuthContext } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface EnrollmentState {
  factorId: string;
  qrCode: string;
  secret: string;
  verifyCode: string;
}

function TOTPSetup() {
  const { enrollTOTP, verifyTOTPEnrollment, unenrollTOTP } = use(AuthContext);

  const supabase = createClient();

  const [factors, setFactors] = useState<Factor[]>([]);

  const [enrollmentState, setEnrollmentState] =
    useState<EnrollmentState | null>(null);

  const [showTotpSetup, setShowTotpSetup] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  async function loadFactors() {
    const factorsData = await supabase.auth.mfa.listFactors();
    if (factorsData.data?.all) {
      setFactors(factorsData.data.all);
    }
  }

  async function setupTOTP() {
    setLoading(true);
    setError("");

    const { data, error: enrollError } = await enrollTOTP(
      `TOTP-${crypto.randomUUID()}`,
    );

    if (enrollError) {
      setError(enrollError.message);
      setLoading(false);
      return;
    }

    if (data) {
      try {
        setEnrollmentState({
          factorId: data.id,
          qrCode: data.totp.qr_code,
          secret: data.totp.secret,
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
      enrollmentState.factorId,
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

  async function onCancel() {
    try {
      if (enrollmentState?.factorId) {
        await handleUnenroll(enrollmentState.factorId);
      }
    } catch (err: unknown) {
      console.error("Failed to unenroll TOTP factor:", err);
    }

    setShowTotpSetup(false);
    setEnrollmentState(null);
    setError("");
    setMessage("");
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadFactors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase.auth]);

  if (showTotpSetup) {
    if (loading && !enrollmentState) {
      return (
        <section className="mx-auto w-full space-y-4 rounded bg-gray-100 pb-4 contain-paint">
          <header className="bg-gray-300 px-4 py-2">
            <h2 className="font-bold">Enable Two-Factor Authentication</h2>
          </header>
          <div className="space-y-2 px-4">
            <p className="text-center">
              Setting up two-factor authentication...
            </p>
          </div>
        </section>
      );
    }

    if (enrollmentState) {
      return (
        <section className="mx-auto w-full space-y-4 rounded bg-gray-100 pb-4 contain-paint">
          <header className="bg-gray-300 px-4 py-2">
            <h2 className="font-bold">Enable Two-Factor Authentication</h2>
          </header>
          <div className="space-y-2 px-4">
            <div className="space-y-2">
              <p className="text-center text-sm">
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.):
              </p>
              {enrollmentState.qrCode ? (
                <div className="flex justify-center">
                  <img
                    alt="TOTP QR Code"
                    className="size-48 rounded bg-white"
                    src={enrollmentState.qrCode}
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Or enter this secret manually:
              </p>
              <code className="block rounded bg-white p-2 font-mono text-sm break-all">
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

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Button disabled={loading} type="submit">
                  {loading ? "Verifying..." : "Verify and Enable"}
                </Button>
                <Button onClick={onCancel} purpose="danger" type="button">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </section>
      );
    }
  }

  return (
    <section className="mx-auto w-full space-y-4 rounded bg-gray-100 pb-4 contain-paint">
      <header className="bg-gray-300 px-4 py-2">
        <h2 className="font-bold">Two-Factor Authentication</h2>
      </header>
      <div className="space-y-2 px-4">
        <p className="text-sm">
          Add an extra layer of security to your account by enabling two-factor
          authentication using an authenticator app.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Your Authentication Factors
            </h3>
            <Button disabled={loading} onClick={handleAddFactor} type="button">
              Add Factor
            </Button>
          </div>

          {factors.length === 0 ? (
            <div className="rounded border border-gray-200 bg-white p-4 text-center text-sm">
              No two-factor authentication factors configured yet.
            </div>
          ) : (
            <div className="space-y-2">
              {factors.map((factor) => (
                <div
                  className="flex items-center justify-between rounded border border-gray-200 bg-white p-3"
                  key={factor.id}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {factor.friendly_name}
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
                      Created:{" "}
                      {new Date(factor.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    disabled={loading}
                    onClick={async () => handleUnenroll(factor.id)}
                    type="button"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {message ? (
          <p
            className={`text-sm ${
              message.includes("successfully")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        ) : null}

        {error && !showTotpSetup ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}
      </div>
    </section>
  );
}

export { TOTPSetup };
