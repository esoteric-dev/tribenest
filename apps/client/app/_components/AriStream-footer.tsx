"use client";

import Link from "next/link";

export default function AriStreamFooter() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/10">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-gutter px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
        <div className="col-span-2 md:col-span-1 flex flex-col gap-6">
          <Link
            className="font-headline-sm text-headline-sm font-bold text-on-background flex items-center gap-2"
            href="/"
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
          <p className="font-body-sm text-body-sm text-neutral-muted max-w-[200px]">
            © {new Date().getFullYear()} AriStream, Inc. All rights reserved.
            AriStream is a professional multistreaming platform.
          </p>
          <div className="flex gap-4">
            <span
              className="material-symbols-outlined text-neutral-muted hover:text-on-background transition-colors cursor-pointer"
              data-icon="smart_display"
            >
              smart_display
            </span>
            <span
              className="material-symbols-outlined text-neutral-muted hover:text-on-background transition-colors cursor-pointer"
              data-icon="chat"
            >
              chat
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md text-on-background font-bold uppercase tracking-wider mb-2">
            Products
          </h4>
          <Link
            className="font-label-sm text-label-sm text-neutral-muted hover:text-on-background transition-colors"
            href="/solutions"
          >
            Multistreaming
          </Link>
          <Link
            className="font-label-sm text-label-sm text-neutral-muted hover:text-on-background transition-colors"
            href="/solutions"
          >
            Upload &amp; Stream
          </Link>
          <Link
            className="font-label-sm text-label-sm text-neutral-muted hover:text-on-background transition-colors"
            href="/solutions"
          >
            Studio
          </Link>
          <Link
            className="font-label-sm text-label-sm text-neutral-muted hover:text-on-background transition-colors"
            href="/solutions"
          >
            Clips
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md text-on-background font-bold uppercase tracking-wider mb-2">
            Community
          </h4>
          <Link
            className="font-label-sm text-label-sm text-neutral-muted hover:text-on-background transition-colors"
            href="#"
          >
            Discord
          </Link>
          <Link
            className="font-label-sm text-label-sm text-neutral-muted hover:text-on-background transition-colors"
            href="#"
          >
            Developers
          </Link>
          <Link
            className="font-label-sm text-label-sm text-neutral-muted hover:text-on-background transition-colors"
            href="#"
          >
            Referral Program
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md text-on-background font-bold uppercase tracking-wider mb-2">
            Resources
          </h4>
          <Link
            className="font-label-sm text-label-sm text-neutral-muted hover:text-on-background transition-colors"
            href="#"
          >
            Blog
          </Link>
          <Link
            className="font-label-sm text-label-sm text-neutral-muted hover:text-on-background transition-colors"
            href="#"
          >
            Help Center
          </Link>
          <Link
            className="font-label-sm text-label-sm text-neutral-muted hover:text-on-background transition-colors"
            href="/pricing"
          >
            Pricing
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md text-on-background font-bold uppercase tracking-wider mb-2">
            Company
          </h4>
          <Link
            className="font-label-sm text-label-sm text-neutral-muted hover:text-on-background transition-colors"
            href="/about"
          >
            About
          </Link>
          <Link
            className="font-label-sm text-label-sm text-neutral-muted hover:text-on-background transition-colors"
            href="#"
          >
            Careers
          </Link>
        </div>
      </div>
    </footer>
  );
}
