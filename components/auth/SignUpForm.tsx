"use client";

import Link from "next/link";
import { Form } from "radix-ui";
import { type FormEvent, use, useState } from "react";

import { Button } from "@/components/general/Button";
import { AuthContext } from "@/contexts/AuthContext";

function SignUpForm() {
  const { signUp } = use(AuthContext);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error: signUpError } = await signUp(email, password, {
      emailRedirectTo: `${window.location.origin}/pro`,
    });

    if (signUpError) {
      setMessage(signUpError.message);
    } else {
      setPassword("");
      setEmail("");
      setMessage("Check your email for confirmation link!");
    }

    setLoading(false);
  }

  return (
    <Form.Root
      className="mx-auto w-full max-w-md space-y-4"
      onSubmit={handleSubmit}
    >
      <h1 className="text-2xl font-bold">Create an Account</h1>

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
            Please enter a password
          </Form.Message>
          <Form.Message className="text-xs text-red-600" match="tooShort">
            Password must be at least 8 characters
          </Form.Message>
        </div>
        <Form.Control
          autoComplete="new-password"
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          minLength={8}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
      </Form.Field>

      <Form.Field name="agree">
        <div className="flex items-start gap-2">
          <Form.Control
            className="size-[24px] rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            type="checkbox"
            value="1"
          />
          <Form.Label className="block text-sm font-medium">
            I agree to the{" "}
            <Link
              className="text-blue-600 underline hover:text-blue-800"
              href="/terms-of-service"
              target="_blank"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              className="text-blue-600 underline hover:text-blue-800"
              href="/privacy-policy"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </Form.Label>
        </div>
        <Form.Message className="text-xs text-red-600" match="valueMissing">
          You must agree to the terms
        </Form.Message>
      </Form.Field>

      <Form.Submit asChild>
        <Button disabled={loading} type="submit" width="full">
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </Form.Submit>

      {message ? (
        <p
          className={`text-sm ${message.includes("Check") ? "text-green-600" : "text-red-600"}`}
          role="alert"
        >
          {message}
        </p>
      ) : null}
    </Form.Root>
  );
}

export { SignUpForm };
