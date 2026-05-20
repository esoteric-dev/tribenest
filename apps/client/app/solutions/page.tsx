"use client";

import { CreatorAuthProvider } from "../_contexts/creator-auth";
import AriStreamNav from "../_components/AriStream-nav";
import AriStreamFooter from "../_components/AriStream-footer";
import Link from "next/link";

export default function SolutionsPage() {
  return (
    <CreatorAuthProvider>
      <div className="dark bg-background text-on-background min-h-screen font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
        <AriStreamNav />

        <main className="pt-32 pb-16">
          {/* Solutions Hero */}
          <section className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center mb-24">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-primary text-label-sm font-semibold uppercase tracking-wider mb-6">
              <span className="material-symbols-outlined text-[16px]">explore</span>
              Complete Streaming Suite
            </span>
            <h1 className="text-headline-xl font-headline-xl text-on-background max-w-4xl mx-auto mb-6 leading-tight">
              One Stream. <span className="text-primary glow-effect px-2">Infinite Channels.</span> Reach the World.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
              Go live on Twitch, YouTube, Facebook, and 30+ platforms simultaneously. Stream from your browser or your favorite encoder with professional overlays.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-full font-bold hover:bg-primary-fixed transition-all glow-effect shadow-[0_0_20px_rgba(178,197,255,0.2)]">
                Start Streaming Free
              </Link>
              <a href="#solutions-grid" className="inline-flex items-center justify-center bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high font-label-md text-label-md px-8 py-3.5 rounded-full font-bold transition-all">
                Explore Features
              </a>
            </div>
          </section>

          {/* Solutions Grid */}
          <section id="solutions-grid" className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">

              {/* Solution 1: Multistreaming */}
              <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-8 hover:border-primary/30 transition-all group flex flex-col justify-between">
                <div>
                  <span className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">cell_merge</span>
                  </span>
                  <h3 className="text-headline-md font-headline-md text-on-background mb-4">
                    Multistreaming &amp; Syndication
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    Connect and stream to YouTube, Twitch, Kick, Facebook Live, and custom RTMP endpoints at the exact same time. Zero extra load on your computer or local internet connection.
                  </p>
                  <ul className="flex flex-col gap-3 font-body-sm text-body-sm text-neutral-muted mb-8">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      Simultaneous delivery to 30+ destinations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      Custom RTMP destinations for private endpoints
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      Stream delay configuration &amp; fine-tuning
                    </li>
                  </ul>
                </div>
                <Link href="/signup" className="text-primary hover:text-primary-fixed font-label-md text-label-md flex items-center gap-1 group-hover:gap-2 transition-all">
                  Get Started <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              {/* Solution 2: AriStream Studio */}
              <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-8 hover:border-primary/30 transition-all group flex flex-col justify-between">
                <div>
                  <span className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">video_camera_front</span>
                  </span>
                  <h3 className="text-headline-md font-headline-md text-on-background mb-4">
                    AriStream Studio
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    Professional, broadcast-quality streaming tools right in your browser. No complicated software setup required. Invite guests, share screen, add logos, graphics, and custom templates.
                  </p>
                  <ul className="flex flex-col gap-3 font-body-sm text-body-sm text-neutral-muted mb-8">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      Browser-based live video production
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      HD 1080p video with pristine stereo sound
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      Interactive overlay graphics, overlays, and ticker tapes
                    </li>
                  </ul>
                </div>
                <Link href="/signup" className="text-primary hover:text-primary-fixed font-label-md text-label-md flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open Studio <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              {/* Solution 3: Scheduled Video Uploads */}
              <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-8 hover:border-primary/30 transition-all group flex flex-col justify-between">
                <div>
                  <span className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">schedule_send</span>
                  </span>
                  <h3 className="text-headline-md font-headline-md text-on-background mb-4">
                    Pre-Recorded Live Streaming
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    Upload your pre-recorded video, choose your channels, set the date and time, and go live automatically. Reach global audiences even when you are asleep or away from your desk.
                  </p>
                  <ul className="flex flex-col gap-3 font-body-sm text-body-sm text-neutral-muted mb-8">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      Automated 24/7 loops or scheduled launches
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      Support for massive file formats up to 4K resolution
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      Simulated live broadcast feel on destination players
                    </li>
                  </ul>
                </div>
                <Link href="/signup" className="text-primary hover:text-primary-fixed font-label-md text-label-md flex items-center gap-1 group-hover:gap-2 transition-all">
                  Schedule Stream <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              {/* Solution 4: Unified Cross-Platform Chat */}
              <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-8 hover:border-primary/30 transition-all group flex flex-col justify-between">
                <div>
                  <span className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">forum</span>
                  </span>
                  <h3 className="text-headline-md font-headline-md text-on-background mb-4">
                    Unified Social Chat Feed
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    Stop swapping browser tabs to read chat. Combine real-time chat messages from YouTube, Twitch, Facebook, and more into a single dashboard. Embed chat messages directly onto your stream.
                  </p>
                  <ul className="flex flex-col gap-3 font-body-sm text-body-sm text-neutral-muted mb-8">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      Consolidated feed with distinct network icons
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      Live overlay styles matching your stream branding
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      Quick replies &amp; moderation features built-in
                    </li>
                  </ul>
                </div>
                <Link href="/signup" className="text-primary hover:text-primary-fixed font-label-md text-label-md flex items-center gap-1 group-hover:gap-2 transition-all">
                  Connect Chat <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

            </div>
          </section>

          {/* Interactive Solutions CTA */}
          <section className="relative px-margin-mobile md:px-margin-desktop py-24 bg-surface-container border-y border-outline-variant/10 overflow-hidden text-center mb-16">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(178,197,255,0.15),rgba(0,0,0,0))]" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-headline-lg font-headline-lg text-on-background mb-6">Ready to scale your streaming network?</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
                Setup takes under 2 minutes. Connect your channels, import your assets, and reach millions of viewers today.
              </p>
              <Link href="/signup" className="inline-flex items-center justify-center bg-primary text-on-primary font-headline-md text-[18px] px-10 py-4 rounded-full font-bold hover:bg-primary-fixed transition-all glow-effect shadow-[0_0_30px_rgba(178,197,255,0.4)]">
                Create Free Account
              </Link>
            </div>
          </section>
        </main>

        <AriStreamFooter />
      </div>
    </CreatorAuthProvider>
  );
}
