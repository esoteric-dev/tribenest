"use client";

import { CreatorAuthProvider } from "../_contexts/creator-auth";
import AriStreamNav from "../_components/AriStream-nav";
import AriStreamFooter from "../_components/AriStream-footer";
import Link from "next/link";

export default function AboutPage() {
  const stats = [
    { value: "10M+", label: "Creators Worldwide" },
    { value: "500M+", label: "Streams Delivered" },
    { value: "30+", label: "Platforms Connected" },
    { value: "99.99%", label: "Platform Uptime" },
  ];

  const values = [
    {
      title: "Creators First",
      desc: "Every product choice we make starts with one question: how does this help the creator grow their audience?",
      icon: "mood",
    },
    {
      title: "High Performance",
      desc: "Live video demands perfection. Our custom global edge routing ensures sub-second latency and pristine delivery.",
      icon: "bolt",
    },
    {
      title: "Accessibility",
      desc: "Broadcast software should not require a PhD. We build simple, robust workflows that anyone can deploy in minutes.",
      icon: "accessibility",
    },
  ];

  return (
    <CreatorAuthProvider>
      <div className="dark bg-background text-on-background min-h-screen font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
        <AriStreamNav />

        <main className="pt-32 pb-16">
          {/* About Hero */}
          <section className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center mb-24">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-primary text-label-sm font-semibold uppercase tracking-wider mb-6">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Our Story &amp; Mission
            </span>
            <h1 className="text-headline-xl font-headline-xl text-on-background max-w-4xl mx-auto mb-6 leading-tight">
              We Empower Creators to <span className="text-primary glow-effect px-2">Reach the World.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
              AriStream is founded on a simple belief: your live message shouldn&apos;t be restricted to a single browser tab or social network. We build premium infrastructure to syndicate your talent everywhere instantly.
            </p>
          </section>

          {/* Stats Section */}
          <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-32">
            <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter text-center">
                {stats.map((stat, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <span className="text-headline-xl font-headline-xl text-primary font-black">
                      {stat.value}
                    </span>
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Core Values Section */}
          <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-32">
            <h2 className="text-headline-lg font-headline-lg text-on-background text-center mb-16">
              The Values That Drive Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {values.map((val, i) => (
                <div
                  key={i}
                  className="bg-surface-container border border-outline-variant/10 rounded-xl p-8 hover:border-primary/30 transition-all group"
                >
                  <span className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">{val.icon}</span>
                  </span>
                  <h3 className="text-headline-md font-headline-md text-on-background mb-4">
                    {val.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Mission Details Section */}
          <section className="px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto mb-24 text-center">
            <h2 className="text-headline-lg font-headline-lg text-on-background mb-6">
              Our Journey
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
              Launched in 2024, AriStream set out to solve a major technical bottleneck. Multi-destination live streaming previously required specialized multi-PC setups, ultra-high upload bandwidth, or expensive custom encoding rigs.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-8">
              We developed our custom AriStream syndication mesh to solve this problem globally. Today, our cloud architecture syndicates billions of video packets daily, allowing bedroom streams and enterprise panels to reach millions of screens concurrently with absolute ease.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-full font-bold hover:bg-primary-fixed transition-all glow-effect shadow-[0_0_20px_rgba(178,197,255,0.2)]"
            >
              Join Our Journey
            </Link>
          </section>
        </main>

        <AriStreamFooter />
      </div>
    </CreatorAuthProvider>
  );
}
