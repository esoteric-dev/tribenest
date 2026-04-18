"use client";

import Link from "next/link";
import { useCreatorAuth } from "../_contexts/creator-auth";

export default function LandingNav() {
  const { isAuthenticated, authorizations, isLoading } = useCreatorAuth();
  const firstProfile = authorizations[0]?.profile;

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
      <Link href="/" className="text-lg font-bold tracking-tight">
        TribeNest
      </Link>

      <div className="flex items-center gap-4">
        {!isLoading && isAuthenticated && firstProfile ? (
          <Link
            href={`/creators/${firstProfile.subdomain}/dashboard`}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
