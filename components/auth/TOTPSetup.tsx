"use client";

import QRCode from "qrcode";
import { use, useEffect, useState } from "react";

import { AuthContext } from "@/contexts/AuthContext";

interface TOTPSetupProps {
  readonly onComplete?: () => void;
  readonly onCancel?: () => void;
}

function TOTPSetup({ onComplete, onCancel }: TOTPSetupProps) {
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const { enrollTOTP, verifyTOTPEnrollment } = use(AuthContext);

  useEffect(() => {
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

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setupTOTP();
  }, [enrollTOTP]);

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
    onComplete?.();
  }

  if (loading && step === "setup") {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 rounded-lg border border-gray-300 p-6">
        <p className="text-center">Setting up two-factor authentication...</p>
      </div>
    );
  }

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
              {onCancel ? (
                <button
                  className="cursor-pointer rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
                  onClick={onCancel}
                  type="button"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export { TOTPSetup };
