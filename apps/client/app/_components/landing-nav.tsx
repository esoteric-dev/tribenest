"use client";

import Link from "next/link";
import { useCreatorAuth } from "../_contexts/creator-auth";

export default function LandingNav() {
  const { isAuthenticated, authorizations, isLoading } = useCreatorAuth();
  const firstProfile = authorizations[0]?.profile;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-black/60 dark:bg-[#050505]/80 backdrop-blur-xl docked full-width border-b border-white/10 shadow-[0_0_15px_rgba(255,95,31,0.15)]">
      <Link href="/" className="text-2xl font-black text-orange-600 dark:text-[#FF5F1F] tracking-[0.2em] font-['Space_Grotesk'] uppercase">
        Vara Labs
      </Link>
      <div className="hidden md:flex items-center gap-8 font-['Space_Grotesk'] tracking-tight uppercase font-bold text-sm">
        <Link className="text-orange-500 border-b-2 border-orange-500 pb-1 hover:border-orange-500/50 hover:shadow-[0_0_10px_rgba(255,95,31,0.3)] transition-all duration-300 active:scale-[0.97]" href="#">Broadcast</Link>
        <Link className="text-zinc-400 hover:text-white transition-colors hover:border-orange-500/50 hover:shadow-[0_0_10px_rgba(255,95,31,0.3)] duration-300 active:scale-[0.97]" href="#">Network</Link>
        <Link className="text-zinc-400 hover:text-white transition-colors hover:border-orange-500/50 hover:shadow-[0_0_10px_rgba(255,95,31,0.3)] duration-300 active:scale-[0.97]" href="#">Specs</Link>
        <Link className="text-zinc-400 hover:text-white transition-colors hover:border-orange-500/50 hover:shadow-[0_0_10px_rgba(255,95,31,0.3)] duration-300 active:scale-[0.97]" href="#">Terminal</Link>
      </div>
      <div className="flex items-center gap-4">
        {!isLoading && isAuthenticated && firstProfile ? (
          <Link
            href={`/creators/${firstProfile.subdomain}/dashboard`}
            className="font-label-caps text-label-caps bg-primary-container text-black px-6 py-2 border border-primary-container hover:shadow-[0_0_8px_rgba(255,95,31,0.8)] transition-all uppercase"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" className="hidden md:block font-label-caps text-label-caps text-zinc-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="font-label-caps text-label-caps bg-primary-container text-black px-6 py-2 border border-primary-container hover:shadow-[0_0_8px_rgba(255,95,31,0.8)] transition-all uppercase"
            >
              Launch Console
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
