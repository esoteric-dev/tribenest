"use client";

import Link from "next/link";
import { useCreatorAuth } from "../_contexts/creator-auth";

export default function LandingNav() {
  const { isAuthenticated, authorizations, isLoading } = useCreatorAuth();
  const firstProfile = authorizations[0]?.profile;

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#12121A]/60 backdrop-blur-xl border-b border-[#1E1E2E] shadow-2xl font-['Syne'] tracking-tight">
      <div className="flex justify-between items-center px-8 h-20 w-full max-w-container-max mx-auto">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
          TribeNest
        </Link>
        <div className="hidden md:flex space-x-lg">
          <Link className="text-gray-400 hover:text-white transition-colors hover:scale-105 duration-200" href="/#features">Features</Link>
          <Link className="text-gray-400 hover:text-white transition-colors hover:scale-105 duration-200" href="/#pricing">Pricing</Link>
          <Link className="text-gray-400 hover:text-white transition-colors hover:scale-105 duration-200" href="/docs">Docs</Link>
        </div>
        <div className="flex items-center space-x-md">
          {!isLoading && isAuthenticated && firstProfile ? (
            <Link
              href={`/creators/${firstProfile.subdomain}/dashboard`}
              className="btn-gradient text-white font-button text-button px-lg py-sm rounded-lg hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors hover:scale-105 duration-200 hidden md:block">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-gradient text-white font-button text-button px-lg py-sm rounded-lg hover:scale-105 active:scale-95 transition-transform duration-200 flex items-center"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
