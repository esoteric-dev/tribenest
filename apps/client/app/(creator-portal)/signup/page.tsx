"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCreatorAuth } from "../../_contexts/creator-auth";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const { signup, createProfile, isAuthenticated, authorizations } = useCreatorAuth();
  const router = useRouter();
  const params = useSearchParams();
  const initialStep = params.get("step") === "2" ? 2 : 1;
  const [step, setStep] = useState(initialStep);

  // Step 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 fields
  const [channelName, setChannelName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in and has profile, send to dashboard
  useEffect(() => {
    if (isAuthenticated && authorizations.length > 0) {
      const profile = authorizations.find((a) => a.isOwner)?.profile ?? authorizations[0].profile;
      router.replace(`/creators/${profile.subdomain}/dashboard`);
    }
    // If logged in but no profile, go to step 2
    if (isAuthenticated && authorizations.length === 0 && step === 1) {
      setStep(2);
    }
  }, [isAuthenticated, authorizations]);

  // Auto-generate slug from channel name
  useEffect(() => {
    if (slugEdited) return;
    setSlug(
      channelName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50),
    );
  }, [channelName, slugEdited]);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup({ email, password, firstName, lastName });
      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const profile = await createProfile({ subdomain: slug, name: channelName });
      router.push(`/creators/${profile.subdomain}/dashboard`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not create channel. Try a different slug.");
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
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8">
            <StepDot active={step >= 1} done={step > 1} label="Account" />
            <div className="flex-1 h-px bg-white/10" />
            <StepDot active={step >= 2} done={false} label="Channel" />
          </div>

          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold mb-1">Create your account</h1>
              <p className="text-white/40 text-sm mb-8">Step 1 of 2 — your personal details</p>

              <form onSubmit={handleStep1} className="flex flex-col gap-5">
                {error && <ErrorBox message={error} />}

                <div className="flex gap-3">
                  <Field label="First name">
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      required
                      maxLength={25}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Last name">
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required
                      maxLength={25}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Password">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className={inputClass}
                  />
                </Field>

                <button type="submit" disabled={loading} className={btnClass}>
                  {loading ? "Creating account…" : "Continue"}
                </button>
              </form>

              <p className="text-center text-white/40 text-sm mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-orange-400 hover:text-orange-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold mb-1">Set up your channel</h1>
              <p className="text-white/40 text-sm mb-8">Step 2 of 2 — your public creator page</p>

              <form onSubmit={handleStep2} className="flex flex-col gap-5">
                {error && <ErrorBox message={error} />}

                <Field label="Channel name">
                  <input
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="My Awesome Channel"
                    required
                    minLength={4}
                    maxLength={50}
                    className={inputClass}
                  />
                </Field>

                <Field label="Channel URL">
                  <div className="flex items-center rounded-lg overflow-hidden border border-white/10 focus-within:border-orange-500/60 transition-colors bg-white/5">
                    <span className="px-3 py-3 text-sm text-white/30 border-r border-white/10 whitespace-nowrap select-none">
                      varalabs.systems/creators/
                    </span>
                    <input
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                        setSlugEdited(true);
                      }}
                      placeholder="my-channel"
                      required
                      minLength={4}
                      maxLength={50}
                      className="flex-1 px-3 py-3 bg-transparent text-white placeholder-white/20 focus:outline-none text-sm"
                    />
                  </div>
                  <p className="text-xs text-white/30 mt-1">Letters, numbers and hyphens only. Cannot be changed later.</p>
                </Field>

                <button type="submit" disabled={loading} className={btnClass}>
                  {loading ? "Creating channel…" : "Create channel"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 transition-colors text-sm";

const btnClass =
  "w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-white/60">{label}</label>
      {children}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      {message}
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          done
            ? "bg-orange-500 text-white"
            : active
              ? "border-2 border-orange-500 text-orange-400"
              : "border-2 border-white/10 text-white/20"
        }`}
      >
        {done ? "✓" : ""}
      </div>
      <span className={`text-xs ${active ? "text-white/60" : "text-white/20"}`}>{label}</span>
    </div>
  );
}
