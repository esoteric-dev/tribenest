"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreatorAuth } from "../_contexts/creator-auth";

const NAV_LINKS = ["Products", "Solutions", "Use Cases", "Pricing", "About"];

export default function AriStreamNav() {
  const { isAuthenticated, authorizations, isLoading, signInWithGoogle } =
    useCreatorAuth();
  const router = useRouter();

  const profile =
    authorizations?.find((a) => a.isOwner)?.profile ?? authorizations?.[0]?.profile;

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/20 transition-all duration-300">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        {/* Brand + nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-headline-md text-headline-md font-black tracking-tighter text-on-background flex items-center gap-2"
          >
            <span
              className="material-symbols-outlined text-primary"
              data-icon="stream"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stream
            </span>
            AriStream
          </Link>

          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/" className="font-label-md text-label-md text-on-surface-variant font-medium hover:text-primary transition-colors duration-200">
              Products
            </Link>
            <Link href="/solutions" className="font-label-md text-label-md text-on-surface-variant font-medium hover:text-primary transition-colors duration-200">
              Solutions
            </Link>
            <Link href="/use-cases" className="font-label-md text-label-md text-on-surface-variant font-medium hover:text-primary transition-colors duration-200">
              Use Cases
            </Link>
            <Link href="/pricing" className="font-label-md text-label-md text-on-surface-variant font-medium hover:text-primary transition-colors duration-200">
              Pricing
            </Link>
            <Link href="/about" className="font-label-md text-label-md text-on-surface-variant font-medium hover:text-primary transition-colors duration-200">
              About
            </Link>
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {!isLoading && isAuthenticated && profile ? (
            <Link
              href={`/creators/${profile.subdomain}/dashboard`}
              className="inline-flex items-center justify-center bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-2 rounded-full font-bold hover:bg-primary-container/90 transition-all glow-effect"
            >
              Go to Dashboard
            </Link>
          ) : !isLoading && isAuthenticated ? (
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-2 rounded-full font-bold hover:bg-primary-container/90 transition-all glow-effect"
            >
              Finish Setup
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline-flex font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-2 rounded-full font-bold hover:bg-primary-container/90 transition-all glow-effect"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
