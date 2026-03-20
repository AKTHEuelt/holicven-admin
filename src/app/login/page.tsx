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
    <div className="min-h-screen relative" style={{ backgroundImage: "url('/newspaper.png')", backgroundSize: "100%", backgroundPosition: "center", backgroundRepeat: "repeat" }}>
      <div className="absolute inset-0 bg-white/30"></div>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur p-8 rounded-xl w-full max-w-md border-2 border-black shadow-lg">
          <h1 className="text-3xl font-bold text-black mb-2 text-center">
            Høl i CV'en
          </h1>
          <p className="text-gray-600 text-center mb-8">Admin Panel</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Brukernavn</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-black transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Passord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-black transition"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Logg inn
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            Standard: admin / holicven2026
          </p>
        </div>
      </div>
    </div>
  );
}
