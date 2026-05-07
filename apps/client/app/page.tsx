import Link from "next/link";
import { CreatorAuthProvider } from "./_contexts/creator-auth";
import LandingNav from "./_components/landing-nav";

export default function Home() {
  return (
    <CreatorAuthProvider>
      <div className="bg-[#050505] text-on-background min-h-screen flex flex-col font-body-base text-body-base selection:bg-primary-container selection:text-black">
        <LandingNav />

        {/* Main Canvas */}
        <main className="flex-grow pt-32 pb-24 px-8 max-w-container-max mx-auto w-full flex flex-col gap-16">
          {/* Hero Section */}
          <section className="relative w-full rounded-DEFAULT glass-panel overflow-hidden border border-surface-variant group">
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen">
              <img 
                alt="Data Stream" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgSCHtA2_4H0zyyBkuMrLIwnNm8vdVS22MlnyhJKK8RGuz3cV98S4H5IxyvafE-mLWHT3_DYRLiE3zsLQP6zLnxzreN9f_-7xoPWGdrZZM0zejZDdNrkLtCTT0un6P_3b1c9I-L8uSHLb2JxJFn-9HV7wT-Rh6WgVU3XP4JPNYRM86BkbS-CVau8IZOdQeCYq4T1dLWCQB7Gq7fP9TBBA_oeXW5WIn92tA5PbzCmqNJLhy3l0Stw4m4Vqgaw3ls6FwrpJ43Eq-GwUP"
              />
            </div>
            <div className="relative z-10 p-12 md:p-24 flex flex-col items-center text-center gap-6 bg-gradient-to-t from-[#050505] to-transparent">
              <div className="font-label-caps text-label-caps text-primary-container px-3 py-1 border border-primary-container/30 bg-primary-container/10 rounded-sm inline-block mb-4">
                [SYSTEM_OK] CYBER-INDUSTRIAL PROTOCOL
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-background max-w-4xl uppercase">
                Unlimited Reach.<br/><span className="text-primary-container">One Stream.</span>
              </h1>
              <p className="max-w-2xl text-on-surface-variant font-body-base text-body-base mt-4">
                Deploy your broadcast across all major tactical networks simultaneously. Zero latency. Maximum impact. The ultimate transmission terminal for elite operators.
              </p>
              <div className="mt-8 flex gap-4">
                <Link href="/signup" className="font-label-caps text-label-caps bg-primary-container text-black px-8 py-4 border border-primary-container hover:shadow-[0_0_15px_rgba(255,95,31,0.8)] transition-all uppercase">
                  Initialize Uplink
                </Link>
                <button className="font-label-caps text-label-caps bg-transparent text-primary-container px-8 py-4 border border-primary-container hover:bg-primary-container/10 transition-all uppercase">
                  View Architecture
                </button>
              </div>
            </div>
          </section>

          {/* Tactical Features Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Feature 1 */}
            <div className="glass-panel p-8 rounded-DEFAULT flex flex-col gap-6 glow-hover transition-all duration-300 h-80 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary-container" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background uppercase">Zero-Latency<br/>Core</h3>
              <p className="font-body-base text-body-base text-on-surface-variant text-sm">Instantaneous data packet delivery bypassing standard civilian routing protocols.</p>
              <div className="mt-auto pt-4 border-t border-surface-variant flex items-center justify-between">
                <span className="font-data-mono text-data-mono text-zinc-500">PING: <span className="text-primary-container">0.02ms</span></span>
                <div className="h-1 w-24 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container w-full shadow-[0_0_8px_rgba(255,95,31,0.8)]"></div>
                </div>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="glass-panel p-8 rounded-DEFAULT flex flex-col gap-6 glow-hover transition-all duration-300 h-80 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary-container" style={{fontVariationSettings: "'FILL' 1"}}>hub</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background uppercase">Multi-Platform<br/>Relay</h3>
              <p className="font-body-base text-body-base text-on-surface-variant text-sm">Simultaneous vector injection into Twitch, YouTube, and Kick architectures from a single origin.</p>
              <div className="mt-auto pt-4 border-t border-surface-variant flex gap-2">
                <span className="font-label-caps text-label-caps text-zinc-400 border border-surface-variant px-2 py-1 rounded-sm">TWITCH</span>
                <span className="font-label-caps text-label-caps text-zinc-400 border border-surface-variant px-2 py-1 rounded-sm">YT</span>
                <span className="font-label-caps text-label-caps text-zinc-400 border border-surface-variant px-2 py-1 rounded-sm">KICK</span>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="glass-panel p-8 rounded-DEFAULT flex flex-col gap-6 glow-hover transition-all duration-300 h-80 relative overflow-hidden group md:col-span-1 md:row-span-1">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary-container" style={{fontVariationSettings: "'FILL' 1"}}>query_stats</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background uppercase">Tactical<br/>Analytics</h3>
              <p className="font-body-base text-body-base text-on-surface-variant text-sm">Live telemetry and cross-node viewer mapping displayed in an elite HUD environment.</p>
              <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-surface-variant">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-zinc-600">CONCURRENT</span>
                  <span className="font-data-mono text-data-mono text-on-background text-lg">124,592</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-zinc-600">RETENTION</span>
                  <span className="font-data-mono text-data-mono text-primary-container text-lg">94.2%</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-[#050505] w-full border-t border-zinc-900 mt-auto border-white/5">
          <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-orange-500 font-bold font-['Space_Grotesk'] text-[10px] tracking-widest uppercase">
              © {new Date().getFullYear()} VARA LABS. CYBER-INDUSTRIAL TRANSMISSION PROTOCOL ACTIVE.
            </div>
            <div className="flex gap-6 font-['Space_Grotesk'] text-[10px] tracking-widest uppercase text-zinc-600">
              <Link className="hover:text-orange-400 transition-colors" href="#">Protocol</Link>
              <Link className="hover:text-orange-400 transition-colors" href="#">Nodes</Link>
              <Link className="hover:text-orange-400 transition-colors" href="#">Security</Link>
              <Link className="hover:text-orange-400 transition-colors" href="#">Support</Link>
            </div>
          </div>
        </footer>
      </div>
    </CreatorAuthProvider>
  );
}
