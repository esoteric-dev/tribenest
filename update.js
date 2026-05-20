const fs = require('fs');

const navCode = `"use client";

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
              href={\`/creators/\${firstProfile.subdomain}/dashboard\`}
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
`;
fs.writeFileSync('apps/client/app/_components/landing-nav.tsx', navCode);

const pageCode = `import Link from "next/link";
import { CreatorAuthProvider } from "./_contexts/creator-auth";
import LandingNav from "./_components/landing-nav";

export default function Home() {
  return (
    <CreatorAuthProvider>
      <div className="bg-background text-on-surface font-body-md antialiased overflow-x-hidden min-h-screen flex flex-col">
        <LandingNav />

        {/* Main Content */}
        <main className="flex-grow pt-24">
          {/* Hero Section */}
          <section className="relative py-xl px-gutter max-w-container-max mx-auto flex flex-col items-center text-center mt-xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-container/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
            
            <div className="inline-flex items-center space-x-unit border border-outline-variant rounded-full px-sm py-unit bg-surface-container-low mb-lg">
              <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.6)] animate-pulse"></span>
              <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest">Live Streaming Reimagined</span>
            </div>
            
            <h1 className="font-display-hero text-display-hero text-white mb-lg max-w-4xl mx-auto leading-tight">
              Your Stage. <br/> <span className="text-gradient">Every Platform.</span> <br/> One Upload.
            </h1>
            
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-xl">
              Upload your pre-recorded content once and TribeNest automatically schedules and broadcasts it as a live stream across Twitch, YouTube, and Facebook.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-md sm:space-y-0 sm:space-x-md mb-xl">
              <Link href="/signup" className="btn-gradient text-white font-button text-button px-xl py-md rounded-lg hover:scale-105 active:scale-95 transition-transform duration-200 text-lg flex items-center justify-center">
                Start Streaming Free
              </Link>
              <button className="bg-surface-container-high border border-outline-variant text-white font-button text-button px-xl py-md rounded-lg hover:border-primary-container hover:bg-surface-container transition-colors duration-200 text-lg flex items-center justify-center">
                <span className="material-symbols-outlined mr-sm">play_circle</span>
                Watch how it works
              </button>
            </div>
            
            {/* Hero Visual */}
            <div className="relative w-full max-w-5xl mt-lg rounded-xl border border-outline-variant bg-surface overflow-hidden hover-primary-glow transition-shadow duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none"></div>
              <img 
                alt="Dashboard Mockup" 
                className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXMps6gKF4g54M_xhR-Vy1RfxwfsA7EhgXO2vYrql6uRPvwvvhvjQcYRJZcEG6BJFar2SfHTu_2i6JOsrGx78WTIlP7vs3C0VwSze_ggEkMy_3u783I2rBHxTB9s9fzhbp4P-2Zj-bC0hqNMsMbDKYxnj1BulKAk4wHGJHe2QMLfrByXIjqQJkhLpy4FRy-fH3xbgyY0FUJwf-a6IpYzo6YFtgM82k4jLOWnK89awR3v3mbpQ3doxoquMpnsWctIcaD8t2608bkB-b"
              />
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-xl px-gutter max-w-4xl mx-auto text-center mt-xl mb-xl border-t border-outline-variant pt-xl">
            <h2 className="font-h2 text-h2 text-white mb-md">Ready to go live everywhere?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">Join thousands of creators amplifying their reach without the extra effort.</p>
            <Link href="/signup" className="inline-block btn-gradient text-white font-button text-button px-xl py-md rounded-lg hover:scale-105 active:scale-95 transition-transform duration-200 text-lg shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)]">
              Get Started Now
            </Link>
          </section>
        </main>

        {/* Footer */}
        <footer className="w-full py-16 px-8 bg-[#0A0A0F] border-t border-[#1E1E2E] font-['Syne']">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
            <div className="col-span-1 md:col-span-1">
              <div className="text-xl font-bold text-white mb-lg">
                TribeNest
              </div>
              <p className="font-body-sm text-body-sm text-gray-500 mb-md">
                The ultimate pre-recorded live streaming platform for modern creators.
              </p>
              <div className="flex space-x-md">
                <span className="material-symbols-outlined text-gray-500 hover:text-violet-400 cursor-pointer transition-colors">videocam</span>
                <span className="material-symbols-outlined text-gray-500 hover:text-violet-400 cursor-pointer transition-colors">podcasts</span>
              </div>
            </div>
            <div>
              <h3 className="font-h3 text-h3 text-white mb-md text-sm uppercase tracking-wider">Product</h3>
              <ul className="space-y-sm">
                <li><Link className="font-body-sm text-body-sm text-gray-500 hover:text-violet-400 transition-colors" href="/#features">Features</Link></li>
                <li><Link className="font-body-sm text-body-sm text-gray-500 hover:text-violet-400 transition-colors" href="/#pricing">Pricing</Link></li>
                <li><Link className="font-body-sm text-body-sm text-gray-500 hover:text-violet-400 transition-colors" href="/integrations">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-h3 text-h3 text-white mb-md text-sm uppercase tracking-wider">Company</h3>
              <ul className="space-y-sm">
                <li><Link className="font-body-sm text-body-sm text-gray-500 hover:text-violet-400 transition-colors" href="/about">About Us</Link></li>
                <li><Link className="font-body-sm text-body-sm text-gray-500 hover:text-violet-400 transition-colors" href="/careers">Careers</Link></li>
                <li><Link className="font-body-sm text-body-sm text-gray-500 hover:text-violet-400 transition-colors" href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-h3 text-h3 text-white mb-md text-sm uppercase tracking-wider">Legal</h3>
              <ul className="space-y-sm">
                <li><Link className="font-body-sm text-body-sm text-gray-500 hover:text-violet-400 transition-colors" href="/privacy">Privacy Policy</Link></li>
                <li><Link className="font-body-sm text-body-sm text-gray-500 hover:text-violet-400 transition-colors" href="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-xl pt-lg border-t border-outline-variant flex justify-between items-center">
            <p className="font-body-sm text-body-sm text-gray-500">© {new Date().getFullYear()} TribeNest. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </CreatorAuthProvider>
  );
}
`;
fs.writeFileSync('apps/client/app/page.tsx', pageCode);

console.log('Update script finished.');
