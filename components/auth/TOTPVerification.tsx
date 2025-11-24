"use client";

import { type FormEvent, use, useState } from "react";

import { Button } from "@/components/general/Button";
import { AuthContext } from "@/contexts/AuthContext";

interface TOTPVerificationProps {
  onCancel: () => void;
  onVerified: () => void;
}

function TOTPVerification({
  onCancel,
  onVerified,
}: Readonly<TOTPVerificationProps>) {
  const { verifyTOTP } = use(AuthContext);

  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: verifyError } = await verifyTOTP(code);

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      setCode("");
      return;
    }

    setLoading(false);
    setCode("");
    onVerified();
  }

  return (
    <form className="mx-auto w-full max-w-md space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold">Two-Factor Authentication</h2>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="totp-code">
          Enter authentication code from your app
        </label>
        <input
          autoComplete="off"
          autoFocus
          className="w-full rounded border border-gray-300 px-3 py-2 text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none"
          id="totp-code"
          maxLength={6}
          onChange={(e) => setCode(e.target.value.replace(/\D/gu, ""))}
          pattern="\d{6}"
          placeholder="000000"
          required
          type="text"
          value={code}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button disabled={loading} type="submit">
          {loading ? "Verifying..." : "Verify"}
        </Button>
        <Button onClick={onCancel} purpose="danger" type="button">
          Cancel
        </Button>
      </div>
    </form>
  );
}

export { TOTPVerification };
