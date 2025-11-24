"use client";

import { Form } from "radix-ui";
import { type FormEvent, use, useState } from "react";

import { Button } from "@/components/general/Button";
import { AuthContext } from "@/contexts/AuthContext";

interface EnrollmentState {
  factorId: string;
  qrCode: string;
  secret: string;
  verifyCode: string;
}

function TOTPSetup() {
  const {
    enrollTOTP,
    factors,
    loadFactors,
    unenrollTOTP,
    verifyTOTPEnrollment,
  } = use(AuthContext);

  const [enrollmentState, setEnrollmentState] =
    useState<EnrollmentState | null>(null);

  const [showTotpSetup, setShowTotpSetup] = useState<boolean>(false);

  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  async function handleAddFactor() {
    try {
      setIsPending(true);
      setError("");
      setMessage("");
      setEnrollmentState(null);

      const { data, error: enrollError } = await enrollTOTP(
        `TOTP-${crypto.randomUUID()}`,
      );

      if (enrollError) {
        setError(enrollError.message);

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
          setShowTotpSetup(true);
        } catch {
          setError("Failed to generate QR code");
        }
      }
    } finally {
      setIsPending(false);
    }
  }

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!enrollmentState) {
      return;
    }

    try {
      setIsPending(true);
      setError("");

      const { error: verifyError } = await verifyTOTPEnrollment(
        enrollmentState.factorId,
        enrollmentState.verifyCode,
      );

      if (verifyError) {
        setError(verifyError.message);

        return;
      }

      setShowTotpSetup(false);
      setEnrollmentState(null);
      setMessage("Two-factor authentication enabled successfully!");

      await loadFactors();
    } finally {
      setIsPending(false);
    }
  }

  async function handleUnenroll(factorId: string) {
    try {
      setIsPending(true);
      setError("");
      setMessage("");

      const { error: unenrollError } = await unenrollTOTP(factorId);

      if (unenrollError) {
        setError(unenrollError.message);
      } else {
        setMessage("Two-factor authentication factor removed successfully");
        await loadFactors();
      }
    } finally {
      setIsPending(false);
    }
  }

  async function onCancel() {
    try {
      if (enrollmentState?.factorId) {
        await handleUnenroll(enrollmentState.factorId);
      }
    } catch (err: unknown) {
      console.error("Failed to unenroll TOTP factor:", err);
    }

    setError("");
    setMessage("");
    setEnrollmentState(null);
    setShowTotpSetup(false);
  }

  if (showTotpSetup) {
    if (isPending && !enrollmentState) {
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

            <Form.Root className="space-y-4" onSubmit={handleVerify}>
              <Form.Field name="verify-code">
                <div className="flex items-baseline justify-between">
                  <Form.Label className="block text-sm font-medium">
                    Enter verification code from your app
                  </Form.Label>
                  <Form.Message
                    className="text-xs text-red-600"
                    match="valueMissing"
                  >
                    Please enter your code
                  </Form.Message>
                  <Form.Message
                    className="text-xs text-red-600"
                    match="patternMismatch"
                  >
                    Code must be 6 digits
                  </Form.Message>
                </div>
                <Form.Control
                  autoComplete="off"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  onChange={(e) =>
                    setEnrollmentState({
                      ...enrollmentState,
                      verifyCode: e.target.value.replace(/\D/gu, ""),
                    })
                  }
                  placeholder="000000"
                  required
                  type="number"
                  value={enrollmentState.verifyCode}
                />
              </Form.Field>

              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Form.Submit asChild>
                  <Button disabled={isPending} type="submit">
                    {isPending ? "Verifying..." : "Verify and Enable"}
                  </Button>
                </Form.Submit>
                <Button onClick={onCancel} purpose="danger" type="button">
                  Cancel
                </Button>
              </div>
            </Form.Root>
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
            <Button
              disabled={isPending}
              onClick={handleAddFactor}
              type="button"
            >
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
                        className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 data-[status=verified]:bg-green-100 data-[status=verified]:text-green-800"
                        data-status={factor.status}
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
                    disabled={isPending}
                    onClick={async () => handleUnenroll(factor.id)}
                    purpose="danger"
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
          <p className="text-sm text-green-600" role="alert">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export { TOTPSetup };
