"use client";

import { CreatorAuthProvider } from "../_contexts/creator-auth";
import AriStreamNav from "../_components/AriStream-nav";
import AriStreamFooter from "../_components/AriStream-footer";
import Link from "next/link";

export default function UseCasesPage() {
  return (
    <CreatorAuthProvider>
      <div className="dark bg-background text-on-background min-h-screen font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
        <AriStreamNav />

        <main className="pt-32 pb-16">
          {/* Use Cases Hero */}
          <section className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center mb-24">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-primary text-label-sm font-semibold uppercase tracking-wider mb-6">
              <span className="material-symbols-outlined text-[16px]">groups</span>
              Tailored Live Solutions
            </span>
            <h1 className="text-headline-xl font-headline-xl text-on-background max-w-4xl mx-auto mb-6 leading-tight">
              Designed for <span className="text-primary glow-effect px-2">Every Story Teller.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
              Whether you are an independent creator broadcasting gaming sessions or a global enterprise deploying town hall meetings, AriStream matches your workflow.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-full font-bold hover:bg-primary-fixed transition-all glow-effect shadow-[0_0_20px_rgba(178,197,255,0.2)]">
                Launch Live Stream
              </Link>
              <a href="#use-cases-list" className="inline-flex items-center justify-center bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high font-label-md text-label-md px-8 py-3.5 rounded-full font-bold transition-all">
                Select Your Industry
              </a>
            </div>
          </section>

          {/* Use Cases Sections */}
          <section id="use-cases-list" className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-32 flex flex-col gap-24">

            {/* Case 1: Creators & Gamers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
              <div className="relative group overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container p-2">
                <div className="w-full h-[320px] bg-surface-container-lowest rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50" />
                  <span className="material-symbols-outlined text-[100px] text-primary/30 group-hover:scale-110 transition-transform duration-300">sports_esports</span>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <span className="text-primary font-label-md text-label-md font-bold uppercase tracking-wider">Creators &amp; Gamers</span>
                <h2 className="text-headline-lg font-headline-lg text-on-background">Maximize your reach. Grow your audience.</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Stream your high-fidelity gameplay, digital art, or podcasts to Twitch, YouTube, Kick, and Facebook Live all at once. Build multi-platform communities without needing extra CPU power or costly software.
                </p>
                <div className="flex gap-4">
                  <Link href="/signup" className="inline-flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full font-bold hover:bg-primary-fixed transition-all">
                    Start Gaming Live
                  </Link>
                </div>
              </div>
            </div>

            {/* Case 2: Enterprise & Business */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
              <div className="flex flex-col gap-6 lg:order-2">
                <div className="w-full h-[320px] bg-surface-container-lowest rounded-lg flex items-center justify-center relative overflow-hidden border border-outline-variant/10 bg-surface-container p-2">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50" />
                  <span className="material-symbols-outlined text-[100px] text-primary/30">domain</span>
                </div>
              </div>
              <div className="flex flex-col gap-6 lg:order-1">
                <span className="text-primary font-label-md text-label-md font-bold uppercase tracking-wider">Enterprise &amp; Marketing</span>
                <h2 className="text-headline-lg font-headline-lg text-on-background">Broaden corporate communications securely.</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Broadcast annual general meetings, town halls, marketing launches, and automated webinars to private intranets, YouTube Live, LinkedIn, and social networks in full HD. AriStream matches custom compliance policies.
                </p>
                <div className="flex gap-4">
                  <Link href="/signup" className="inline-flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full font-bold hover:bg-primary-fixed transition-all">
                    Explore Enterprise
                  </Link>
                </div>
              </div>
            </div>

            {/* Case 3: Educators & Classes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
              <div className="relative group overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container p-2">
                <div className="w-full h-[320px] bg-surface-container-lowest rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50" />
                  <span className="material-symbols-outlined text-[100px] text-primary/30 group-hover:scale-110 transition-transform duration-300">school</span>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <span className="text-primary font-label-md text-label-md font-bold uppercase tracking-wider">Education &amp; E-learning</span>
                <h2 className="text-headline-lg font-headline-lg text-on-background">Broadcast online classes globally.</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Run online workshops, classroom lectures, or training modules live. Stream to school websites, educational apps, Facebook Group live panels, and YouTube simultaneously to keep all students aligned.
                </p>
                <div className="flex gap-4">
                  <Link href="/signup" className="inline-flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full font-bold hover:bg-primary-fixed transition-all">
                    Teach Live
                  </Link>
                </div>
              </div>
            </div>

            {/* Case 4: Non-Profit & Worship */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
              <div className="flex flex-col gap-6 lg:order-2">
                <div className="w-full h-[320px] bg-surface-container-lowest rounded-lg flex items-center justify-center relative overflow-hidden border border-outline-variant/10 bg-surface-container p-2">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50" />
                  <span className="material-symbols-outlined text-[100px] text-primary/30">favorite</span>
                </div>
              </div>
              <div className="flex flex-col gap-6 lg:order-1">
                <span className="text-primary font-label-md text-label-md font-bold uppercase tracking-wider">Non-Profit &amp; Worship</span>
                <h2 className="text-headline-lg font-headline-lg text-on-background">Engage communities &amp; drive support.</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Stream religious services, fundraising events, volunteer orientations, and community dialogues instantly. Bring global family members and community panels together across all social platforms.
                </p>
                <div className="flex gap-4">
                  <Link href="/signup" className="inline-flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full font-bold hover:bg-primary-fixed transition-all">
                    Worship &amp; Share
                  </Link>
                </div>
              </div>
            </div>

          </section>

          {/* Simple Use Cases Footer CTA */}
          <section className="relative px-margin-mobile md:px-margin-desktop py-24 bg-surface-container border-y border-outline-variant/10 overflow-hidden text-center mb-16">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(178,197,255,0.15),rgba(0,0,0,0))]" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-headline-lg font-headline-lg text-on-background mb-6">Create customized channels on the fly</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
                Ready to stream exactly the way you want? Sign up now and deploy your customized broadcasting settings in seconds.
              </p>
              <Link href="/signup" className="inline-flex items-center justify-center bg-primary text-on-primary font-headline-md text-[18px] px-10 py-4 rounded-full font-bold hover:bg-primary-fixed transition-all glow-effect shadow-[0_0_30px_rgba(178,197,255,0.4)]">
                Launch Free Stream
              </Link>
            </div>
          </section>
        </main>

        <AriStreamFooter />
      </div>
    </CreatorAuthProvider>
  );
}
