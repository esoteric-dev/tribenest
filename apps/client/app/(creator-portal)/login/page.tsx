"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreatorAuth } from "../../_contexts/creator-auth";

export default function LoginPage() {
  const { login } = useCreatorAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auths = await login(email, password);
      const profile = auths.find((a) => a.isOwner)?.profile ?? auths[0]?.profile;
      if (profile) {
        router.push(`/creators/${profile.subdomain}/dashboard`);
      } else {
        // Account exists but no profile yet — go to profile setup step
        router.push("/signup?step=2");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="text-lg font-bold tracking-tight">
          TribeNest
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-white/40 text-sm mb-8">Sign in to your creator account</p>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 transition-colors text-sm"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 transition-colors text-sm"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors text-sm"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-orange-400 hover:text-orange-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-white/60">{label}</label>
      {children}
    </div>
  );
}
