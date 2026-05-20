const fs = require('fs');

const tailwindConfig = `import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./_components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-container": "#ff5f1f",
        "inverse-surface": "#e5e2e3",
        "on-primary": "#5c1900",
        "on-secondary-fixed-variant": "#44474b",
        "primary-fixed-dim": "#ffb59c",
        "on-secondary-container": "#b6b8be",
        "surface-container": "#1f1f20",
        "outline": "#aa897f",
        "primary-fixed": "#ffdbcf",
        "secondary": "#c4c6cc",
        "on-primary-fixed": "#390c00",
        "tertiary": "#c9c6c5",
        "on-tertiary-fixed-variant": "#474646",
        "on-primary-fixed-variant": "#832700",
        "tertiary-fixed": "#e5e2e1",
        "inverse-on-surface": "#303031",
        "outline-variant": "#5b4138",
        "secondary-fixed": "#e0e2e8",
        "on-tertiary-fixed": "#1c1b1b",
        "on-surface-variant": "#e3bfb3",
        "on-primary-container": "#561700",
        "on-tertiary": "#313030",
        "on-tertiary-container": "#2d2c2c",
        "surface-dim": "#131314",
        "primary": "#ffb59c",
        "on-surface": "#e5e2e3",
        "inverse-primary": "#ab3600",
        "surface-container-lowest": "#0e0e0f",
        "error-container": "#93000a",
        "surface-container-high": "#2a2a2b",
        "on-secondary": "#2d3135",
        "on-error": "#690005",
        "secondary-container": "#46494e",
        "surface-container-low": "#1b1b1c",
        "error": "#ffb4ab",
        "secondary-fixed-dim": "#c4c6cc",
        "tertiary-fixed-dim": "#c9c6c5",
        "surface-bright": "#39393a",
        "background": "#131314",
        "surface-variant": "#353436",
        "surface-container-highest": "#353436",
        "surface": "#131314",
        "on-error-container": "#ffdad6",
        "tertiary-container": "#959393",
        "on-secondary-fixed": "#181c20",
        "on-background": "#e5e2e3",
        "surface-tint": "#ffb59c",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "16px",
        "container-max": "1440px",
        "margin": "32px",
        "unit": "4px"
      },
      fontFamily: {
        "headline-xl": ["Space Grotesk", "sans-serif"],
        "label-caps": ["Space Grotesk", "sans-serif"],
        "body-base": ["Inter", "sans-serif"],
        "data-mono": ["Space Grotesk", "sans-serif"],
        "headline-md": ["Space Grotesk", "sans-serif"]
      },
      fontSize: {
        "headline-xl": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "label-caps": ["12px", { "lineHeight": "1.0", "letterSpacing": "0.1em", "fontWeight": "700" }],
        "body-base": ["16px", { "lineHeight": "1.6", "letterSpacing": "0.01em", "fontWeight": "400" }],
        "data-mono": ["14px", { "lineHeight": "1.4", "letterSpacing": "0.05em", "fontWeight": "500" }],
        "headline-md": ["24px", { "lineHeight": "1.2", "letterSpacing": "0.02em", "fontWeight": "600" }]
      }
    },
  },
} satisfies Config;
`;
fs.writeFileSync('tailwind.config.ts', tailwindConfig);

const globalsCss = `@import "tailwindcss";
@import "tw-animate-css";
@source "../../../packages/frontend-shared";

:root {
  --background: oklch(0.94 0 236.5);
  --foreground: oklch(0.32 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.32 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.32 0 0);
  --primary: oklch(0.64 0.17 36.44);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.97 0 264.54);
  --secondary-foreground: oklch(0.45 0.03 256.8);
  --muted: oklch(0.98 0 247.84);
  --muted-foreground: oklch(0.55 0.02 264.36);
  --accent: oklch(0.91 0.02 243.82);
  --accent-foreground: oklch(0.38 0.14 265.52);
  --destructive: oklch(0.64 0.21 25.33);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.9 0.01 247.88);
  --input: oklch(0.97 0 264.54);
  --ring: oklch(0.64 0.17 36.44);
  --chart-1: oklch(0.72 0.06 248.68);
  --chart-2: oklch(0.79 0.09 35.96);
  --chart-3: oklch(0.58 0.08 254.16);
  --chart-4: oklch(0.5 0.08 259.49);
  --chart-5: oklch(0.42 0.1 264.03);
  --sidebar: oklch(0.9 0 258.33);
  --sidebar-foreground: oklch(0.32 0 0);
  --sidebar-primary: oklch(0.64 0.17 36.44);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.91 0.02 243.82);
  --sidebar-accent-foreground: oklch(0.38 0.14 265.52);
  --sidebar-border: oklch(0.93 0.01 264.53);
  --sidebar-ring: oklch(0.64 0.17 36.44);
  --font-sans: Inter, sans-serif;
  --font-serif: Source Serif 4, serif;
  --font-mono: JetBrains Mono, monospace;
  --radius: 0.75rem;
  --shadow-2xs: 0px 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0px 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow-md: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 2px 4px -1px hsl(0 0% 0% / 0.1);
  --shadow-lg: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 4px 6px -1px hsl(0 0% 0% / 0.1);
  --shadow-xl: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 8px 10px -1px hsl(0 0% 0% / 0.1);
  --shadow-2xl: 0px 1px 3px 0px hsl(0 0% 0% / 0.25);
}

.dark {
  --background: oklch(0.26 0.03 262.67);
  --foreground: oklch(0.92 0 0);
  --card: oklch(0.31 0.03 268.64);
  --card-foreground: oklch(0.92 0 0);
  --popover: oklch(0.29 0.02 268.4);
  --popover-foreground: oklch(0.92 0 0);
  --primary: oklch(0.64 0.17 36.44);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.31 0.03 266.71);
  --secondary-foreground: oklch(0.92 0 0);
  --muted: oklch(0.31 0.03 266.71);
  --muted-foreground: oklch(0.72 0 0);
  --accent: oklch(0.34 0.06 267.59);
  --accent-foreground: oklch(0.88 0.06 254.13);
  --destructive: oklch(0.64 0.21 25.33);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.38 0.03 269.73);
  --input: oklch(0.38 0.03 269.73);
  --ring: oklch(0.64 0.17 36.44);
  --chart-1: oklch(0.72 0.06 248.68);
  --chart-2: oklch(0.77 0.09 34.19);
  --chart-3: oklch(0.58 0.08 254.16);
  --chart-4: oklch(0.5 0.08 259.49);
  --chart-5: oklch(0.42 0.1 264.03);
  --sidebar: oklch(0.31 0.03 267.74);
  --sidebar-foreground: oklch(0.92 0 0);
  --sidebar-primary: oklch(0.64 0.17 36.44);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.34 0.06 267.59);
  --sidebar-accent-foreground: oklch(0.88 0.06 254.13);
  --sidebar-border: oklch(0.38 0.03 269.73);
  --sidebar-ring: oklch(0.64 0.17 36.44);
  --font-sans: Inter, sans-serif;
  --font-serif: Source Serif 4, serif;
  --font-mono: JetBrains Mono, monospace;
  --radius: 0.75rem;
  --shadow-2xs: 0px 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0px 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow-md: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 2px 4px -1px hsl(0 0% 0% / 0.1);
  --shadow-lg: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 4px 6px -1px hsl(0 0% 0% / 0.1);
  --shadow-xl: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 8px 10px -1px hsl(0 0% 0% / 0.1);
  --shadow-2xl: 0px 1px 3px 0px hsl(0 0% 0% / 0.25);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}

@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400&family=Space+Grotesk:wght@500;600;700&display=swap');

@layer utilities {
  .glass-panel {
      background: rgba(5, 5, 5, 0.6);
      backdrop-filter: blur(12px);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 1px solid rgba(255, 255, 255, 0.05);
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .glow-hover:hover {
      box-shadow: 0 0 8px rgba(255, 95, 31, 0.5);
      border-color: #ff5f1f;
  }
}
`;
fs.writeFileSync('app/globals.css', globalsCss);

const navCode = `"use client";

import Link from "next/link";
import { useCreatorAuth } from "../_contexts/creator-auth";

export default function LandingNav() {
  const { isAuthenticated, authorizations, isLoading } = useCreatorAuth();
  const firstProfile = authorizations[0]?.profile;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-black/60 dark:bg-[#050505]/80 backdrop-blur-xl docked full-width border-b border-white/10 shadow-[0_0_15px_rgba(255,95,31,0.15)]">
      <Link href="/" className="text-2xl font-black text-orange-600 dark:text-[#FF5F1F] tracking-[0.2em] font-['Space_Grotesk'] uppercase">
        Vara Labs
      </Link>
      <div className="hidden md:flex items-center gap-8 font-['Space_Grotesk'] tracking-tight uppercase font-bold text-sm">
        <Link className="text-orange-500 border-b-2 border-orange-500 pb-1 hover:border-orange-500/50 hover:shadow-[0_0_10px_rgba(255,95,31,0.3)] transition-all duration-300 active:scale-[0.97]" href="#">Broadcast</Link>
        <Link className="text-zinc-400 hover:text-white transition-colors hover:border-orange-500/50 hover:shadow-[0_0_10px_rgba(255,95,31,0.3)] duration-300 active:scale-[0.97]" href="#">Network</Link>
        <Link className="text-zinc-400 hover:text-white transition-colors hover:border-orange-500/50 hover:shadow-[0_0_10px_rgba(255,95,31,0.3)] duration-300 active:scale-[0.97]" href="#">Specs</Link>
        <Link className="text-zinc-400 hover:text-white transition-colors hover:border-orange-500/50 hover:shadow-[0_0_10px_rgba(255,95,31,0.3)] duration-300 active:scale-[0.97]" href="#">Terminal</Link>
      </div>
      <div className="flex items-center gap-4">
        {!isLoading && isAuthenticated && firstProfile ? (
          <Link
            href={\`/creators/\${firstProfile.subdomain}/dashboard\`}
            className="font-label-caps text-label-caps bg-primary-container text-black px-6 py-2 border border-primary-container hover:shadow-[0_0_8px_rgba(255,95,31,0.8)] transition-all uppercase"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" className="hidden md:block font-label-caps text-label-caps text-zinc-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="font-label-caps text-label-caps bg-primary-container text-black px-6 py-2 border border-primary-container hover:shadow-[0_0_8px_rgba(255,95,31,0.8)] transition-all uppercase"
            >
              Launch Console
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
`;
fs.writeFileSync('app/_components/landing-nav.tsx', navCode);

const pageCode = `import Link from "next/link";
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
`;
fs.writeFileSync('app/page.tsx', pageCode);

console.log('Update script finished.');
