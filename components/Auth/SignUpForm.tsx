"use client";

import Link from "next/link";
// import { useRouter } from "next/navigation";
import { FormEvent, use, useState } from "react";

import { AuthContext } from "@/contexts/AuthContext";

function SignUpForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const { signUp } = use(AuthContext);
  // const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error: signUpError } = await signUp(email, password);

    if (signUpError) {
      setMessage(signUpError.message);
    } else {
      setPassword("");
      setEmail("");
      setMessage("Check your email for confirmation link!");
      // Redirect after successful login
      // router.push("/");
    }

    setLoading(false);
  };

  return (
    <form className="mx-auto w-full max-w-lg space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold">Create an Account</h2>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          id="password"
          minLength={6}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      <div className="flex items-start gap-2">
        <input
          className="size-[24px] rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          id="agree"
          required
          type="checkbox"
          value="1"
        />
        <label className="mb-1 block text-sm font-medium" htmlFor="agree">
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
        </label>
      </div>

      <button
        className="w-full cursor-pointer rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        disabled={loading}
        type="submit"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>

      {message ? (
        <p
          className={`text-sm ${message.includes("Check") ? "text-green-600" : "text-red-600"}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

export { SignUpForm };
