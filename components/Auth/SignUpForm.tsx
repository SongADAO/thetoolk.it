"use client";

import { FormEvent, use, useState } from "react";

import { AuthContext } from "@/contexts/AuthContext";

export default function SignUpForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const { signUp } = use(AuthContext);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await signUp(email, password);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for confirmation link!");
    }

    setLoading(false);
  };

  return (
    <form className="mx-auto max-w-md space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold">Sign Up</h2>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          id="password"
          minLength={6}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      <button
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
        type="submit"
      >
        {loading ? "Signing up..." : "Sign Up"}
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
