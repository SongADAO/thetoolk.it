"use client";

import { Form } from "radix-ui";
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
    <Form.Root
      className="mx-auto w-full max-w-md space-y-4"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-bold">Two-Factor Authentication</h2>

      <Form.Field name="totp-code">
        <div className="flex items-baseline justify-between">
          <Form.Label className="block text-sm font-medium">
            Enter authentication code from your app
          </Form.Label>
          <Form.Message className="text-xs text-red-600" match="valueMissing">
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
          autoFocus
          className="w-full rounded border border-gray-300 px-3 py-2 text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none"
          maxLength={6}
          onChange={(e) => setCode(e.target.value.replace(/\D/gu, ""))}
          pattern="\d{6}"
          placeholder="000000"
          required
          type="number"
          value={code}
        />
      </Form.Field>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Form.Submit asChild>
          <Button disabled={loading} type="submit">
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </Form.Submit>
        <Button onClick={onCancel} purpose="danger" type="button">
          Cancel
        </Button>
      </div>
    </Form.Root>
  );
}

export { TOTPVerification };
