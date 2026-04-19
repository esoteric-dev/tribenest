"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "creator_portal_token";

function TwitchOAuthContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Connecting your Twitch channel…");

  useEffect(() => {
    const code = params.get("code");
    const profileId = params.get("state");
    const token = localStorage.getItem(TOKEN_KEY);

    if (!code || !profileId || !token) {
      setStatus("error");
      setMessage("Missing required parameters. Please try again.");
      return;
    }

    fetch(`${API_URL}/streams/oauth/twitch/token?code=${encodeURIComponent(code)}&profileId=${profileId}`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error || data.status === "error") throw new Error(data.message);
        setStatus("success");
        setMessage("Twitch connected! Redirecting…");
        setTimeout(() => {
          fetch(`${API_URL}/accounts/authorizations`, { headers: { authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((auths) => {
              const profile = auths.find((a: any) => a.profileId === profileId)?.profile;
              if (profile?.subdomain) {
                router.replace(`/creators/${profile.subdomain}/dashboard`);
              } else {
                router.replace("/");
              }
            });
        }, 1500);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Failed to connect Twitch. Please try again.");
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center mx-auto mb-6 text-3xl">💜</div>
        {status === "loading" && (
          <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto mb-4" />
        )}
        {status === "success" && <div className="text-2xl mb-4">✓</div>}
        {status === "error" && <div className="text-2xl mb-4 text-red-400">✗</div>}
        <p className={`text-sm ${status === "error" ? "text-red-400" : "text-white/60"}`}>{message}</p>
        {status === "error" && (
          <button onClick={() => router.back()} className="mt-4 text-orange-400 text-sm hover:text-orange-300">
            Go back
          </button>
        )}
      </div>
    </div>
  );
}

export default function TwitchOAuthPage() {
  return <Suspense><TwitchOAuthContent /></Suspense>;
}
