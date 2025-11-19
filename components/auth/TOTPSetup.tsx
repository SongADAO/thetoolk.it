"use client";

import QRCode from "qrcode";
import { use, useEffect, useState } from "react";

import { AuthContext } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

function TOTPSetup() {
  const supabase = createClient();

  const [totpEnabled, setTotpEnabled] = useState<boolean>(false);
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null);
  const [showTotpSetup, setShowTotpSetup] = useState<boolean>(false);
  const [totpLoading, setTotpLoading] = useState<boolean>(false);
  const [totpMessage, setTotpMessage] = useState<string>("");

  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const { enrollTOTP, verifyTOTPEnrollment, unenrollTOTP } = use(AuthContext);

  async function onComplete() {
    setShowTotpSetup(false);
    setTotpEnabled(true);
    setTotpMessage("Two-factor authentication enabled successfully!");

    // Refresh to get the factor ID
    async function refreshFactors() {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.data?.totp && factors.data.totp.length > 0) {
        setTotpFactorId(factors.data.totp[0].id);
      }
    }

    await refreshFactors();
  }

  function onCancel() {
    setShowTotpSetup(false);
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
      setSecret(data.secret);
      // Generate QR code from the TOTP URI
      try {
        const qrCodeUrl = await QRCode.toDataURL(data.uri);
        setQrCode(qrCodeUrl);
        setStep("verify");
      } catch (err) {
        setError("Failed to generate QR code");
        console.error(err);
      }
    }

    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: verifyError } = await verifyTOTPEnrollment(verifyCode);

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    await onComplete();
  }

  async function handleEnableTOTP() {
    setShowTotpSetup(true);
    setTotpMessage("");
    await setupTOTP();
  }

  async function handleDisableTOTP() {
    if (!totpFactorId) return;

    setTotpLoading(true);
    setTotpMessage("");

    const { error: unenrollError } = await unenrollTOTP(totpFactorId);

    if (unenrollError) {
      setTotpMessage(unenrollError.message);
    } else {
      setTotpEnabled(false);
      setTotpFactorId(null);
      setTotpMessage("Two-factor authentication disabled successfully");
    }

    setTotpLoading(false);
  }

  useEffect(() => {
    // Get current user and check TOTP status
    async function getUser(): Promise<void> {
      const {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Check if TOTP is enabled
        const factors = await supabase.auth.mfa.listFactors();
        if (factors.data?.totp && factors.data.totp.length > 0) {
          setTotpEnabled(true);
          setTotpFactorId(factors.data.totp[0].id);
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getUser();
  }, [supabase.auth]);

  if (loading && step === "setup") {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 rounded-lg border border-gray-300 p-6">
        <p className="text-center">Setting up two-factor authentication...</p>
      </div>
    );
  }

  if (showTotpSetup) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 rounded-lg border border-gray-300 p-6">
        <h2 className="text-xl font-bold">Enable Two-Factor Authentication</h2>

        {step === "verify" && (
          <>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.):
              </p>
              {qrCode ? (
                <div className="flex justify-center">
                  <img alt="TOTP QR Code" className="size-48" src={qrCode} />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Or enter this secret manually:
              </p>
              <code className="block rounded bg-gray-100 p-2 font-mono text-sm break-all">
                {secret}
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
                    setVerifyCode(e.target.value.replace(/\D/gu, ""))
                  }
                  pattern="\d{6}"
                  placeholder="000000"
                  required
                  type="text"
                  value={verifyCode}
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
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Add an extra layer of security to your account by enabling two-factor
        authentication using an authenticator app.
      </p>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Status:</span>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            totpEnabled
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {totpEnabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      {totpEnabled ? (
        <button
          className="cursor-pointer rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
          disabled={totpLoading}
          onClick={handleDisableTOTP}
          type="button"
        >
          {totpLoading ? "Disabling..." : "Disable Two-Factor Authentication"}
        </button>
      ) : (
        <button
          className="cursor-pointer rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-800"
          onClick={handleEnableTOTP}
          type="button"
        >
          Enable Two-Factor Authentication
        </button>
      )}

      {totpMessage ? (
        <p
          className={`text-sm ${
            totpMessage.includes("successfully")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {totpMessage}
        </p>
      ) : null}
    </div>
  );
}

export { TOTPSetup };
