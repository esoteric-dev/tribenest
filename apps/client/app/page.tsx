import Link from "next/link";
import { CreatorAuthProvider } from "./_contexts/creator-auth";
import LandingNav from "./_components/landing-nav";

export default function Home() {
  return (
    <CreatorAuthProvider>
      <div className="bg-[#050505] text-on-background min-h-screen flex flex-col font-body-base text-body-base selection:bg-primary-container selection:text-black">
        <LandingNav />

        <main className="flex-grow pt-32 pb-24 px-8 max-w-container-max mx-auto w-full flex flex-col gap-20">

          {/* Hero */}
          <section className="relative w-full rounded-DEFAULT glass-panel overflow-hidden border border-surface-variant">
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen">
              <img
                alt="Streaming visualization"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgSCHtA2_4H0zyyBkuMrLIwnNm8vdVS22MlnyhJKK8RGuz3cV98S4H5IxyvafE-mLWHT3_DYRLiE3zsLQP6zLnxzreN9f_-7xoPWGdrZZM0zejZDdNrkLtCTT0un6P_3b1c9I-L8uSHLb2JxJFn-9HV7wT-Rh6WgVU3XP4JPNYRM86BkbS-CVau8IZOdQeCYq4T1dLWCQB7Gq7fP9TBBA_oeXW5WIn92tA5PbzCmqNJLhy3l0Stw4m4Vqgaw3ls6FwrpJ43Eq-GwUP"
              />
            </div>
            <div className="relative z-10 p-12 md:p-24 flex flex-col items-center text-center gap-6 bg-gradient-to-t from-[#050505] to-transparent">
              <div className="font-label-caps text-label-caps text-primary-container px-3 py-1 border border-primary-container/30 bg-primary-container/10 rounded-sm inline-block">
                Multi-Platform Live Streaming
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-background max-w-4xl uppercase">
                Stream Everywhere.<br /><span className="text-primary-container">From One Place.</span>
              </h1>
              <p className="max-w-xl text-on-surface-variant font-body-base text-body-base mt-2">
                Upload a pre-recorded video, set a time, and go live on Twitch, YouTube, and more — all at once. No studio. No hassle.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="font-label-caps text-label-caps bg-primary-container text-black px-8 py-4 border border-primary-container hover:shadow-[0_0_15px_rgba(255,95,31,0.8)] transition-all uppercase"
                >
                  Start for Free
                </Link>
                <Link
                  href="/login"
                  className="font-label-caps text-label-caps bg-transparent text-primary-container px-8 py-4 border border-primary-container hover:bg-primary-container/10 transition-all uppercase"
                >
                  Sign In
                </Link>
              </div>
              <p className="text-zinc-600 text-xs mt-2">No credit card required</p>
            </div>
          </section>

          {/* How it works */}
          <section className="flex flex-col gap-8">
            <div className="text-center">
              <span className="font-label-caps text-label-caps text-primary-container">How it works</span>
              <h2 className="font-headline-xl text-3xl font-bold text-on-background mt-2 uppercase">
                Go Live in 3 Steps
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {[
                {
                  step: "01",
                  icon: "upload",
                  title: "Upload Your Video",
                  desc: "Record your content ahead of time and upload it to Vara Labs. Any format, any length.",
                },
                {
                  step: "02",
                  icon: "schedule",
                  title: "Pick a Time",
                  desc: "Schedule when your stream goes live. We handle the countdown automatically.",
                },
                {
                  step: "03",
                  icon: "sensors",
                  title: "Stream Everywhere",
                  desc: "Your video broadcasts live to Twitch, YouTube, Kick, and more — simultaneously.",
                },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="glass-panel p-8 rounded-DEFAULT flex flex-col gap-4 glow-hover transition-all duration-300 relative overflow-hidden group">
                  <div className="flex items-center gap-3">
                    <span className="font-label-caps text-label-caps text-primary-container/40 text-2xl font-bold">{step}</span>
                    <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-background">{title}</h3>
                  <p className="font-body-base text-body-base text-on-surface-variant text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="glass-panel p-8 rounded-DEFAULT flex flex-col gap-6 glow-hover transition-all duration-300 h-72 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background uppercase">Reliable &amp; Fast</h3>
              <p className="font-body-base text-body-base text-on-surface-variant text-sm">
                Your stream starts on time, every time. Built for creators who can't afford downtime.
              </p>
              <div className="mt-auto pt-4 border-t border-surface-variant flex items-center justify-between">
                <span className="font-data-mono text-data-mono text-zinc-500">Uptime: <span className="text-primary-container">99.9%</span></span>
                <div className="h-1 w-24 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container w-full shadow-[0_0_8px_rgba(255,95,31,0.8)]"></div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-DEFAULT flex flex-col gap-6 glow-hover transition-all duration-300 h-72 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background uppercase">All Platforms</h3>
              <p className="font-body-base text-body-base text-on-surface-variant text-sm">
                Connect your accounts once. Stream to all platforms from a single dashboard.
              </p>
              <div className="mt-auto pt-4 border-t border-surface-variant flex gap-2">
                <span className="font-label-caps text-label-caps text-zinc-400 border border-surface-variant px-2 py-1 rounded-sm">TWITCH</span>
                <span className="font-label-caps text-label-caps text-zinc-400 border border-surface-variant px-2 py-1 rounded-sm">YOUTUBE</span>
                <span className="font-label-caps text-label-caps text-zinc-400 border border-surface-variant px-2 py-1 rounded-sm">KICK</span>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-DEFAULT flex flex-col gap-6 glow-hover transition-all duration-300 h-72 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>query_stats</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background uppercase">Live Analytics</h3>
              <p className="font-body-base text-body-base text-on-surface-variant text-sm">
                See your viewers across every platform in real time. Know what's working.
              </p>
              <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-surface-variant">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-zinc-600">VIEWERS</span>
                  <span className="font-data-mono text-data-mono text-on-background text-lg">124,592</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-zinc-600">RETENTION</span>
                  <span className="font-data-mono text-data-mono text-primary-container text-lg">94.2%</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="glass-panel rounded-DEFAULT border border-surface-variant p-12 md:p-20 flex flex-col items-center text-center gap-6">
            <h2 className="font-headline-xl text-headline-xl text-on-background max-w-2xl uppercase">
              Ready to Grow Your Audience?
            </h2>
            <p className="text-on-surface-variant max-w-lg text-body-base">
              Join thousands of creators who stream smarter with Vara Labs. Free to start, no technical setup required.
            </p>
            <Link
              href="/signup"
              className="font-label-caps text-label-caps bg-primary-container text-black px-10 py-4 border border-primary-container hover:shadow-[0_0_20px_rgba(255,95,31,0.8)] transition-all uppercase mt-2"
            >
              Create Your Free Account
            </Link>
          </section>

        </main>

        {/* Footer */}
        <footer className="bg-[#050505] w-full border-t border-white/5">
          <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-orange-500 font-bold font-['Space_Grotesk'] text-[10px] tracking-widest uppercase">
              © {new Date().getFullYear()} Vara Labs · Built for Creators
            </div>
            <div className="flex gap-6 font-['Space_Grotesk'] text-[10px] tracking-widest uppercase text-zinc-600">
              <Link className="hover:text-orange-400 transition-colors" href="#">Features</Link>
              <Link className="hover:text-orange-400 transition-colors" href="#">Pricing</Link>
              <Link className="hover:text-orange-400 transition-colors" href="#">Privacy</Link>
              <Link className="hover:text-orange-400 transition-colors" href="#">Support</Link>
            </div>
          </div>
        </footer>
      </div>
    </CreatorAuthProvider>
  );
}
