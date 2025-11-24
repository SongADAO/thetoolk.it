"use client";

import { useRouter } from "next/navigation";
import { Form } from "radix-ui";
import { type FormEvent, use, useState } from "react";

import { TOTPVerification } from "@/components/auth/TOTPVerification";
import { Button } from "@/components/general/Button";
import { AuthContext } from "@/contexts/AuthContext";

function SignInForm() {
  const { signIn, signOut } = use(AuthContext);

  const router = useRouter();

  const [needsTOTP, setNeedsTOTP] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setIsPending(true);
    setError("");

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error: signInError } = await signIn(email, password);

    if (signInError) {
      // Check if the error is due to MFA being required
      if (
        signInError.message?.includes("MFA") ||
        signInError.message?.includes("factor")
      ) {
        setPassword("");
        setEmail("");
        // User must complete MFA verification
        setNeedsTOTP(true);
      } else {
        throw new Error(signInError.message);
      }
    } else if (data?.user?.factors && data.user.factors.length > 0) {
      setPassword("");
      setEmail("");
      // User has MFA enabled
      setNeedsTOTP(true);
    } else {
      setPassword("");
      setEmail("");
      // Redirect after successful login
      router.push("/pro");
    }

    setIsPending(false);
  }

  function handleTOTPVerified() {
    setNeedsTOTP(false);
    router.push("/pro");
  }

  async function handleTOTPCancel() {
    setNeedsTOTP(false);
    // Sign out the user since they cancelled MFA verification
    await signOut("local");
    setError("Two-factor authentication is required to sign in.");
  }

  if (needsTOTP) {
    return (
      <TOTPVerification
        onCancel={handleTOTPCancel}
        onVerified={handleTOTPVerified}
      />
    );
  }

  return (
    <Form.Root
      className="mx-auto w-full max-w-md space-y-4"
      onSubmit={handleSubmit}
    >
      <h1 className="text-2xl font-bold">Sign In</h1>

      <Form.Field name="email">
        <div className="flex items-baseline justify-between">
          <Form.Label className="block text-sm font-medium">Email</Form.Label>
          <Form.Message className="text-xs text-red-600" match="valueMissing">
            Please enter your email
          </Form.Message>
          <Form.Message className="text-xs text-red-600" match="typeMismatch">
            Please provide a valid email
          </Form.Message>
        </div>
        <Form.Control
          autoComplete="email"
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
      </Form.Field>

      <Form.Field name="password">
        <div className="flex items-baseline justify-between">
          <Form.Label className="block text-sm font-medium">
            Password
          </Form.Label>
          <Form.Message className="text-xs text-red-600" match="valueMissing">
            Please enter your password
          </Form.Message>
        </div>
        <Form.Control
          autoComplete="current-password"
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
      </Form.Field>

      <Form.Submit asChild>
        <Button disabled={isPending} type="submit" width="full">
          {isPending ? "Signing in..." : "Sign In"}
        </Button>
      </Form.Submit>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </Form.Root>
  );
}

export { SignInForm };
