'use client';
import { CreatorAuthProvider, useCreatorAuth } from "./_contexts/creator-auth";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AriStreamNav from "./_components/AriStream-nav";
import AriStreamFooter from "./_components/AriStream-footer";

export default function Home() {
  const [displayCount, setDisplayCount] = useState(0);
  const packetRef = useRef<HTMLSpanElement>(null);
  const targetCount = 125701227;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && displayCount === 0) {
          const duration = 2000; // ms
          const start = performance.now();
          const step = (timestamp) => {
            const progress = Math.min((timestamp - start) / duration, 1);
            setDisplayCount(Math.floor(progress * targetCount));
            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };
          requestAnimationFrame(step);
          if (packetRef.current) {
            packetRef.current.classList.add('packet-animate');
          }
        }
      });
    }, { threshold: 0.3 });

    const section = document.getElementById('stats-section');
    if (section) observer.observe(section);
    return () => {
      if (section) observer.unobserve(section);
    };
  }, [displayCount]);

  return (
    <CreatorAuthProvider>
      <div className="dark bg-background text-on-background min-h-screen font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
        <AriStreamNav />

        <main className="pt-24 pb-16">
          {/* Hero Section & Portal */}
          <section className="relative min-h-[921px] flex flex-col items-center justify-start pt-16 px-margin-mobile md:px-margin-desktop text-center overflow-hidden">
            <div className="z-10 max-w-3xl mx-auto space-y-6 mb-16 relative">
              <h1 className="font-headline-xl text-headline-xl md:text-[72px] md:leading-[80px] font-black tracking-tighter text-on-background bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-muted">
                One live video<br />30+ destinations
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto font-medium uppercase tracking-widest text-sm opacity-80">
                AriStream helps you to go live on multiple platforms at the same time, and turn your streams into vertical short videos.
              </p>
              <HeroActions />
            </div>

            {/* Portal Visualization */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[140%] max-w-[1400px] h-[600px] pointer-events-none flex flex-col items-center justify-start opacity-60">
              <span ref={packetRef} className="packet" aria-hidden="true"></span>
              {/* Glowing Origin Point */}
              <div className="w-2 h-2 rounded-full bg-status-live pulse-live absolute top-0 shadow-[0_0_20px_10px_rgba(255,59,48,0.3)]"></div>
              {/* Rays SVG */}
              <svg className="w-full h-full absolute top-2 left-0" preserveAspectRatio="none" viewBox="0 0 1400 600">
                <defs>
                  <linearGradient id="rayGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(178, 197, 255, 0.4)" />
                    <stop offset="100%" stopColor="rgba(178, 197, 255, 0.05)" />
                  </linearGradient>
                </defs>
                <path className="ray-line" d="M 700 0 C 700 150, 100 350, 100 500" fill="none" opacity="0.3" stroke="url(#rayGradient)" strokeWidth="1" />
                <path className="ray-line" d="M 700 0 C 700 150, 200 350, 200 500" fill="none" opacity="0.4" stroke="url(#rayGradient)" strokeWidth="1" />
                <path className="ray-line" d="M 700 0 C 700 150, 350 350, 350 500" fill="none" opacity="0.5" stroke="url(#rayGradient)" strokeWidth="1.5" />
                <path className="ray-line" d="M 700 0 C 700 150, 500 350, 500 500" fill="none" opacity="0.6" stroke="url(#rayGradient)" strokeWidth="2" />
                <path className="ray-line" d="M 700 0 C 700 150, 600 350, 600 500" fill="none" opacity="0.7" stroke="url(#rayGradient)" strokeWidth="2" />
                <path className="glow-effect ray-line" d="M 700 0 C 700 200, 700 300, 700 500" fill="none" stroke="rgba(178, 197, 255, 0.8)" strokeWidth="3" />
                <path className="ray-line" d="M 700 0 C 700 150, 800 350, 800 500" fill="none" opacity="0.7" stroke="url(#rayGradient)" strokeWidth="2" />
                <path className="ray-line" d="M 700 0 C 700 150, 900 350, 900 500" fill="none" opacity="0.6" stroke="url(#rayGradient)" strokeWidth="2" />
                <path className="ray-line" d="M 700 0 C 700 150, 1050 350, 1050 500" fill="none" opacity="0.5" stroke="url(#rayGradient)" strokeWidth="1.5" />
                <path className="ray-line" d="M 700 0 C 700 150, 1200 350, 1200 500" fill="none" opacity="0.4" stroke="url(#rayGradient)" strokeWidth="1" />
                <path className="ray-line" d="M 700 0 C 700 150, 1300 350, 1300 500" fill="none" opacity="0.3" stroke="url(#rayGradient)" strokeWidth="1" />
              </svg>

              {/* Platform Arc */}
              <div className="absolute bottom-[20%] w-full flex justify-center items-center gap-4 md:gap-8 px-4 flex-wrap z-20 mt-[400px]">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><span className="material-symbols-outlined text-[#FF0000]" data-icon="smart_display">smart_display</span></div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><span className="material-symbols-outlined text-[#9146FF]" data-icon="videogame_asset">videogame_asset</span></div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><span className="material-symbols-outlined text-[#1877F2]" data-icon="thumb_up">thumb_up</span></div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><span className="material-symbols-outlined text-[#0A66C2]" data-icon="work">work</span></div>
                <div className="w-16 h-16 rounded-2xl bg-surface-container-highest border border-primary/50 flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_15px_rgba(178,197,255,0.3)] glow-effect relative -top-4"><span className="material-symbols-outlined text-primary text-3xl" data-icon="stream">stream</span></div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><span className="material-symbols-outlined text-[#1DA1F2]" data-icon="chat">chat</span></div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><span className="material-symbols-outlined text-[#E1306C]" data-icon="photo_camera">photo_camera</span></div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><span className="material-symbols-outlined text-[#000000] dark:text-white" data-icon="music_note">music_note</span></div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><span className="material-symbols-outlined text-neutral-muted" data-icon="more_horiz">more_horiz</span></div>
              </div>
            </div>

            {/* Trusted By text below the portal visual area */}
            <div className="mt-[450px] z-20 text-center space-y-4">
              <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-on-surface-variant/60">Trusted by 10m creators and 100k businesses</p>
              <div className="flex flex-wrap justify-center gap-6 opacity-40 grayscale text-sm font-semibold tracking-wider text-on-surface">
                <span>GLOBAL BRANDS</span>
                <span>MEDIA</span>
                <span className="text-primary opacity-100 grayscale-0 border border-primary/30 px-3 py-1 rounded-full">TRENDING TECH</span>
                <span>RETAIL</span>
                <span>SPORTS</span>
                <span>ENTERTAINMENT</span>
                <span>GAMING</span>
                <span>FINANCE</span>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section id="stats-section" className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest border-y border-outline-variant/10">
            <div className="max-w-container-max mx-auto text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="font-headline-xl text-headline-xl md:text-[96px] md:leading-[100px] font-black text-on-background tracking-tighter">{new Intl.NumberFormat().format(displayCount)}</span>
                <span className="font-label-md text-label-md text-primary tracking-widest uppercase">Streams Delivered</span>
              </div>
              <div className="mt-8 flex justify-center gap-12 text-on-surface-variant font-label-sm">
                <div className="flex flex-col items-center gap-1"><span className="text-xl font-bold text-on-background">99.9%</span><span className="uppercase tracking-wider">Uptime</span></div>
                <div className="flex flex-col items-center gap-1"><span className="text-xl font-bold text-on-background">30+</span><span className="uppercase tracking-wider">Platforms</span></div>
                <div className="flex flex-col items-center gap-1"><span className="text-xl font-bold text-on-background">50ms</span><span className="uppercase tracking-wider">Latency</span></div>
              </div>
            </div>
          </section>

          {/* Bento Grid Features */}
          <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">Command your broadcast.</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Everything you need to produce, distribute, and analyze professional live streams from one browser window.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
              {/* Feature 1: Studio */}
              <div className="md:col-span-2 bg-surface-container-high rounded-2xl p-8 border border-outline-variant/20 relative overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center mb-6"><span className="material-symbols-outlined text-primary" data-icon="movie_filter">movie_filter</span></div>
                    <h3 className="font-headline-md text-headline-md text-on-background mb-2">Professional Studio</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md">Add branding, overlays, and guests directly in your browser. No extra software required.</p>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-64 h-48 bg-surface-container-lowest rounded-tl-xl border-t border-l border-outline-variant/20 p-4 shadow-2xl opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="w-full h-24 bg-surface-container-high rounded border border-outline-variant/10 mb-2 flex items-center justify-center"><span className="material-symbols-outlined text-on-surface-variant/30 text-4xl" data-icon="videocam">videocam</span></div>
                    <div className="flex gap-2"><div className="w-1/2 h-12 bg-surface-container-high rounded border border-outline-variant/10"></div><div className="w-1/2 h-12 bg-surface-container-high rounded border border-outline-variant/10"></div></div>
                  </div>
                </div>
              </div>

              {/* Feature 2: Multistream */}
              <div className="bg-surface-container-high rounded-2xl p-8 border border-outline-variant/20 relative overflow-hidden group hover:border-primary/5 transition-colors">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center mb-6"><span className="material-symbols-outlined text-primary" data-icon="share">share</span></div>
                    <h3 className="font-headline-md text-headline-md text-on-background mb-2">Multistreaming</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Reach wider audiences by broadcasting to 30+ destinations simultaneously.</p>
                  </div>
                </div>
              </div>

              {/* Feature 3: Analytics */}
              <div className="bg-surface-container-high rounded-2xl p-8 border border-outline-variant/20 relative overflow-hidden group hover:border-primary/5 transition-colors">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center mb-6"><span className="material-symbols-outlined text-primary" data-icon="insights">insights</span></div>
                    <h3 className="font-headline-md text-headline-md text-on-background mb-2">Cross-Platform Analytics</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Measure your success across all channels in one unified dashboard.</p>
                  </div>
                </div>
              </div>

              {/* Feature 4: Chat */}
              <div className="md:col-span-2 bg-surface-container-high rounded-2xl p-8 border border-outline-variant/20 relative overflow-hidden group hover:border-primary/5 transition-colors">
                <div className="relative z-10 flex flex-col h-full justify-between w-1/2">
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center mb-6"><span className="material-symbols-outlined text-primary" data-icon="forum">forum</span></div>
                    <h3 className="font-headline-md text-headline-md text-on-background mb-2">Unified Chat</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Read and reply to messages from multiple streaming platforms on one screen.</p>
                  </div>
                </div>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-72 h-64 bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4 shadow-2xl opacity-80 group-hover:opacity-100 transition-opacity flex flex-col gap-3">
                  <div className="w-3/4 h-10 bg-surface-container-highest rounded-lg border border-outline-variant/10 ml-auto flex items-center px-3"><div className="w-4 h-4 rounded-full bg-platform-youtube mr-2"></div><div className="h-2 w-16 bg-on-surface-variant/20 rounded"></div></div>
                  <div className="w-4/5 h-10 bg-surface-container-highest rounded-lg border border-outline-variant/10 mr-auto flex items-center px-3"><div className="w-4 h-4 rounded-full bg-platform-twitch mr-2"></div><div className="h-2 w-24 bg-on-surface-variant/20 rounded"></div></div>
                  <div className="w-2/3 h-10 bg-surface-container-highest rounded-lg border border-outline-variant/10 ml-auto flex items-center px-3"><div className="w-4 h-4 rounded-full bg-[#1877F2] mr-2"></div><div className="h-2 w-12 bg-on-surface-variant/20 rounded"></div></div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 px-margin-mobile md:px-margin-desktop">
            <div className="max-w-4xl mx-auto text-center bg-surface-container-high rounded-3xl p-12 md:p-24 border border-outline-variant/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background/0 to-background/0"></div>
              <div className="relative z-10">
                <h2 className="font-headline-xl text-headline-xl text-on-background mb-6">Ready to go live?</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl mx-auto">Join millions of creators and businesses who use AriStream to reach a wider audience.</p>
                <button className="inline-flex items-center justify-center bg-primary text-on-primary font-headline-md text-[18px] px-10 py-4 rounded-full font-bold hover:bg-primary-fixed transition-all glow-effect shadow-[0_0_30px_rgba(178,197,255,0.4)]">Get Started for Free</button>
              </div>
            </div>
          </section>
        </main>

        <AriStreamFooter />

        {/* Fixed Floating Help Button */}
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-surface-container-high border border-outline-variant/30 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-colors shadow-lg z-50 group">
          <span className="material-symbols-outlined" data-icon="help">help</span>
          <span className="absolute right-full mr-4 bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-outline-variant/20">Need help?</span>
        </button>

        {/* Global Styles */}
      </div>
    </CreatorAuthProvider>
  );
}

function HeaderActions() {
  const { isAuthenticated, authorizations } = useCreatorAuth();

  if (isAuthenticated) {
    if (authorizations && authorizations.length > 0) {
      const profile = authorizations.find((a) => a.isOwner)?.profile ?? authorizations[0].profile;
      return (
        <Link className="inline-flex items-center justify-center bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-2 rounded-full font-bold hover:bg-primary-container/90 transition-all glow-effect" href={`/creators/${profile?.subdomain}/dashboard`}>Go to Dashboard</Link>
      );
    } else {
      return (
        <Link className="inline-flex items-center justify-center bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-2 rounded-full font-bold hover:bg-primary-container/90 transition-all glow-effect" href="/signup">Finish Setup</Link>
      );
    }
  }

  return (
    <>
      <Link className="hidden md:inline-flex font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200" href="/login">Log In</Link>
      <Link className="inline-flex items-center justify-center bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-2 rounded-full font-bold hover:bg-primary-container/90 transition-all glow-effect" href="/signup">Sign Up</Link>
    </>
  );
}

function HeroActions() {
  const { isAuthenticated, authorizations, signInWithGoogle } = useCreatorAuth();
  const router = useRouter();

  if (isAuthenticated) {
    if (authorizations && authorizations.length > 0) {
      const profile = authorizations.find((a) => a.isOwner)?.profile ?? authorizations[0].profile;
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface-container-low border border-outline-variant text-on-background font-label-md text-label-md px-8 py-3.5 rounded-full hover:bg-surface-container-high transition-colors group" href={`/creators/${profile?.subdomain}/dashboard`}>
            Go to Dashboard
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
          </Link>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface-container-low border border-outline-variant text-on-background font-label-md text-label-md px-8 py-3.5 rounded-full hover:bg-surface-container-high transition-colors group" href="/signup">
            Finish Setup
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
          </Link>
        </div>
      );
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
        <button onClick={() => {
          signInWithGoogle().then(() => router.push('/signup')).catch(console.error);
        }} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-outline-variant text-on-background font-label-md text-label-md px-8 py-3.5 rounded-full hover:bg-surface-container-high transition-colors">
          <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArZt6BlfyJHT1IaGJ8UUTtjjdrWS0P5Tir2UAn8KEljx2zzav5brfbEj6W4b_2CFXejw3D-czblyRai34fVC6Ai2CS6uRH3tBMLncLvlfbvD-go1-TetBn2p5-7rfKJiyhOGuxRLKvESx64aUwHL-WBmeN2gZ0x_Aj3q9xncOG-Q_V53zGAw2mxJ6SFnKB155oiyfFNP4SM1xUipxfRo8Jz-9XqimuCg9AoWLAjz0wCUnd6oHQpS_oPPNB8uELcAovkKnCy4EAcQY" />
          Continue with Google
        </button>
        <Link href="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface-container-low border border-outline-variant text-on-background font-label-md text-label-md px-8 py-3.5 rounded-full hover:bg-surface-container-high transition-colors group">
          Sign up for free
          <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
        </Link>
      </div>
      <p className="font-label-sm text-label-sm text-on-surface-variant mt-4">Existing account? <Link className="text-primary underline hover:text-primary-fixed transition-colors" href="/login">Log In</Link></p>
    </>
  );
}
