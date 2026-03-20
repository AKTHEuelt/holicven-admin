"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/dashboard");
    } else {
      setError("Feil brukernavn eller passord");
    }
  }

  return (
    <div className="min-h-screen bg-holicven-dark flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md border border-holicven-green/30">
        <h1 className="text-3xl font-bold text-holicven-green mb-2 text-center">
          Høl i CV'en
        </h1>
        <p className="text-gray-400 text-center mb-8">Admin Panel</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Brukernavn</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-holicven-green"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Passord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-holicven-green"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-holicven-green text-black font-bold py-3 rounded-lg hover:bg-holicven-green/80 transition"
          >
            Logg inn
          </button>
        </form>

        <p className="text-gray-500 text-sm text-center mt-6">
          Standard: admin / holicven2026
        </p>
      </div>
    </div>
  );
}
