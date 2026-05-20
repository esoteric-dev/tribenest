"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreatorAuth } from "../../../../_contexts/creator-auth";
import axios from "axios";
import { firebase } from "../../../../firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TwitchCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#10131c] text-[#e1e2ee] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#006aff]/30 border-t-[#006aff] rounded-full animate-spin"></div>
      </div>
    }>
      <TwitchCallbackContent />
    </Suspense>
  );
}

function TwitchCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const { oauthLogin } = useCreatorAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) {
      setError("No authorization code provided by Twitch.");
      return;
    }

    const authenticateWithTwitch = async () => {
      try {
        // Exchange Twitch code for Firebase custom token on our backend
        const redirectUri = window.location.origin + window.location.pathname;
        const res = await axios.post(`${API_URL}/sessions/twitch/callback`, { code, redirectUri });
        const { customToken } = res.data;

        // Sign in to Firebase with the custom token
        const userCredential = await firebase.signInWithCustomToken(firebase.auth, customToken);
        
        // Get the Firebase ID token
        const idToken = await userCredential.user.getIdToken();

        // Login to our backend using the unified OAuth endpoint
        await oauthLogin(idToken);

        // Redirect to the signup page to complete step 2 (channel creation) or dashboard
        router.push("/signup");
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message ?? err.message ?? "Failed to authenticate with Twitch");
      }
    };

    authenticateWithTwitch();
  }, [code, oauthLogin, router]);

  return (
    <div className="min-h-screen bg-[#10131c] text-[#e1e2ee] flex flex-col font-['Geist',sans-serif] items-center justify-center">
      {error ? (
        <div className="bg-[#272a33] p-8 rounded-3xl border border-[#424655]/30 shadow-2xl text-center max-w-md">
          <span className="material-symbols-outlined text-[48px] text-[#ffb4ab] mb-4">error</span>
          <h1 className="text-2xl font-bold mb-4">Authentication Failed</h1>
          <p className="text-[#a6b9de] mb-8">{error}</p>
          <button 
            onClick={() => router.push("/signup")}
            className="w-full py-4 rounded-full bg-[#006aff] hover:bg-[#0056d1] text-white font-bold transition-all text-[15px]"
          >
            Return to Sign Up
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#006aff]/30 border-t-[#006aff] rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold mb-2">Connecting to Twitch...</h1>
          <p className="text-[#a6b9de]">Please wait while we set up your account.</p>
        </div>
      )}
    </div>
  );
}
