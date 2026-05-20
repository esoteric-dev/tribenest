"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import AriStreamNav from "../../_components/AriStream-nav";
import { useCreatorAuth } from "../../_contexts/creator-auth";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const {
    signup,
    createProfile,
    isAuthenticated,
    authorizations,
    signInWithGoogle,
    resendVerification,
  } = useCreatorAuth();
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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && authorizations.length > 0) {
      const profile =
        authorizations.find((a) => a.isOwner)?.profile ??
        authorizations[0].profile;
      router.replace(`/creators/${profile.subdomain}/dashboard`);
    }
    if (isAuthenticated && authorizations.length === 0 && step === 1) {
      setStep(2);
    }
  }, [isAuthenticated, authorizations]);

  useEffect(() => {
    if (slugEdited) return;
    setSlug(
      channelName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50)
    );
  }, [channelName, slugEdited]);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup({ email, password, firstName, lastName });
      await resendVerification();
      setMessage("Verification email sent! Please check your inbox.");
      setStep(2);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      setStep(2);
    } catch (err: any) {
      setError(err?.message ?? "Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTwitchSignIn = () => {
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const redirectUri =
      typeof window !== "undefined"
        ? `${window.location.origin}/signup/twitch/callback`
        : "";
    window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user:read:email`;
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const profile = await createProfile({ subdomain: slug, name: channelName });
      router.push(`/creators/${profile.subdomain}/dashboard`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
        "Could not create channel. Try a different slug."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body-md overflow-x-hidden antialiased">
      <AriStreamNav />

      {/* Main: Split Screen */}
      <main className="flex-grow flex relative">
        {/* Left Side: Visual */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-container-lowest items-center justify-center border-r border-white/10">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD6_C5HFy5JAUsQl-fYJ8HZAa5hFVjMwHZql7j0xzpBK3jsxZKeHbRRQnckrygMA-KT4cM8Clgzh9u6ZHkwHJqe3FipY6JLL18O85TY8iG-fqsOXURXb7qOz6nyaxDatgBqJDyo-Jn-KLzl-xxdWPLSR5JlSJLm8rlHQ-QwlbuzCQgUkTJ3KTUVTSxfF3x1JCw7DtaQXN5L9Zl5_u6QU2yXNtQUvUEEUxttEFrM3ebWtlbwnXdkHTzLeV6rYiutrUVs1ANcstyW__M')",
            }}
          />
          {/* Glow effects */}
          <div className="absolute w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] portal-glow mix-blend-screen" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-platform-twitch/10 rounded-full blur-[80px] mix-blend-screen" />
          {/* Content */}
          <div className="relative z-10 p-margin-desktop max-w-lg pt-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container/50 border border-white/10 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-label-sm font-label-sm text-primary">
                System Status: Optimal
              </span>
            </div>
            <h1 className="text-headline-xl font-headline-xl text-on-surface mb-6 leading-tight">
              Command your broadcast.
            </h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant mb-12">
              Join elite creators managing high-stakes, multi-platform streams
              from a single, low-friction dashboard.
            </p>
            <div className="flex gap-4 opacity-60">
              {["videocam", "router", "analytics"].map((icon) => (
                <div
                  key={icon}
                  className="w-12 h-12 rounded bg-surface-container border border-white/5 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined" data-icon={icon}>
                    {icon}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop pt-24 bg-surface relative overflow-y-auto">
          {/* Mobile background glow */}
          <div className="lg:hidden absolute top-0 right-0 w-full h-1/2 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="w-full max-w-md relative z-10">
            {step === 1 ? (
              <>
                <div className="mb-10">
                  <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">
                    Join the Future of Broadcasting
                  </h2>
                  <p className="text-body-md font-body-md text-on-surface-variant">
                    Start reaching 30+ platforms simultaneously in minutes.
                  </p>
                </div>

                {error && <ErrorBox message={error} />}

                {/* Social Auth */}
                <div className="flex flex-col gap-3 mb-8">
                  <button
                    id="google-signup-btn"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-transparent border border-outline-variant hover:border-primary/50 hover:bg-surface-container-high transition-all duration-200 text-label-md font-label-md text-on-surface group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span
                      className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface transition-colors"
                      data-icon="login"
                    >
                      login
                    </span>
                    Continue with Google
                  </button>
                  <button
                    id="twitch-signup-btn"
                    onClick={handleTwitchSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-transparent border border-outline-variant hover:border-platform-twitch/50 hover:bg-surface-container-high transition-all duration-200 text-label-md font-label-md text-on-surface group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span
                      className="material-symbols-outlined text-platform-twitch"
                      data-icon="hub"
                    >
                      hub
                    </span>
                    Continue with Twitch
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px bg-outline-variant flex-grow opacity-50" />
                  <span className="text-label-sm font-label-sm text-neutral-muted uppercase tracking-wider whitespace-nowrap">
                    or sign up with email
                  </span>
                  <div className="h-px bg-outline-variant flex-grow opacity-50" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleStep1} className="flex flex-col gap-5">
                  <div className="flex gap-3">
                    <Field label="First Name">
                      <input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jane"
                        required
                        maxLength={25}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Last Name">
                      <input
                        id="last-name"
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
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      required
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Password">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className={inputClass}
                    />
                  </Field>

                  <button
                    id="create-account-btn"
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full bg-primary text-on-primary text-label-md font-label-md py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(178,197,255,0.2)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create My Account
                        <span
                          className="material-symbols-outlined"
                          data-icon="arrow_forward"
                        >
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-body-sm font-body-sm text-on-surface-variant">
                  Already have an account?
                  <Link
                    href="/login"
                    className="text-primary hover:text-primary-fixed transition-colors font-medium ml-1"
                  >
                    Log In
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="mb-10">
                  <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">
                    Set Up Your Channel
                  </h2>
                  <p className="text-body-md font-body-md text-on-surface-variant">
                    Create your public creator page to get started.
                  </p>
                </div>

                {message && <SuccessBox message={message} />}
                {error && <ErrorBox message={error} />}

                <form onSubmit={handleStep2} className="flex flex-col gap-5">
                  <Field label="Channel Name">
                    <input
                      id="channel-name"
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
                    <div className="flex items-center rounded-lg overflow-hidden border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all bg-surface-container-high">
                      <span className="px-3 py-3 text-body-md font-body-md text-on-surface-variant border-r border-outline-variant whitespace-nowrap select-none bg-surface-container">
                        aristream.com/
                      </span>
                      <input
                        id="channel-slug"
                        value={slug}
                        onChange={(e) => {
                          setSlug(
                            e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                          );
                          setSlugEdited(true);
                        }}
                        placeholder="my-channel"
                        required
                        minLength={4}
                        maxLength={50}
                        className="flex-1 px-3 py-3 bg-transparent text-body-md font-body-md text-on-surface placeholder:text-neutral-muted/50 focus:outline-none"
                      />
                    </div>
                    <p className="text-label-sm font-label-sm text-on-surface-variant mt-1 opacity-70">
                      Letters, numbers and hyphens only.
                    </p>
                  </Field>

                  <button
                    id="create-channel-btn"
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full bg-primary text-on-primary text-label-md font-label-md py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(178,197,255,0.2)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                        Creating channel…
                      </>
                    ) : (
                      <>
                        Launch My Channel
                        <span
                          className="material-symbols-outlined"
                          data-icon="arrow_forward"
                        >
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Shared styles ───────────────────────────────────────── */

const inputClass =
  "w-full bg-surface-container-high border border-outline-variant rounded-lg p-3 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-neutral-muted/50";

/* ─── Utility components ──────────────────────────────────── */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-label-sm font-label-sm text-on-surface-variant">
        {label}
      </label>
      {children}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-body-sm font-body-sm mb-6">
      <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
      <p>{message}</p>
    </div>
  );
}

function SuccessBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-status-ready/10 border border-status-ready/30 text-status-ready text-body-sm font-body-sm mb-6">
      <span className="material-symbols-outlined text-[18px] shrink-0">
        check_circle
      </span>
      <p>{message}</p>
    </div>
  );
}
