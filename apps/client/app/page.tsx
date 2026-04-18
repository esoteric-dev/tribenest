import Link from "next/link";
import { CreatorAuthProvider } from "./_contexts/creator-auth";
import LandingNav from "./_components/landing-nav";

export default function Home() {
  return (
    <CreatorAuthProvider>
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        <LandingNav />

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 md:py-36">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/60 mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
            Stream. Schedule. Grow.
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-tight mb-6">
            Your stage,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              your audience
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-xl mb-10">
            Upload pre-recorded videos, schedule them to go live, and let your community tune in — all from one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-colors text-base"
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-lg border border-white/10 hover:border-white/30 text-white/70 hover:text-white font-semibold transition-colors text-base"
            >
              Sign in
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-white/5 py-20 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📹"
              title="Upload & Schedule"
              description="Upload your pre-recorded video and pick a date and time. It goes live automatically — no need to be online."
            />
            <FeatureCard
              icon="🌐"
              title="Your own channel"
              description="Get a personalised page at your subdomain. Share it with your audience and let them watch live or on-demand."
            />
            <FeatureCard
              icon="🔗"
              title="One-click connections"
              description="Connect Twitch, YouTube, or Facebook Live with a single click and multistream to all of them at once."
            />
          </div>
        </section>

        <footer className="border-t border-white/5 py-8 px-4 text-center text-white/30 text-sm">
          © {new Date().getFullYear()} TribeNest · Built for creators
        </footer>
      </div>
    </CreatorAuthProvider>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-3">
      <span className="text-3xl">{icon}</span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
