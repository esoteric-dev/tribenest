import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./_components/theme-provider";

export const metadata: Metadata = {
  title: "Vara Labs",
  description: "Stream everywhere. From one place.",
  applicationName: "Vara Labs",
  manifest: "/api/manifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vara Labs",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Vara Labs",
    title: "Vara Labs",
    description: "Stream everywhere. From one place.",
  },
  twitter: {
    card: "summary",
    title: "Vara Labs",
    description: "Stream everywhere. From one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/api/manifest" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap" rel="stylesheet" />
        <script id="tailwind-config" dangerouslySetInnerHTML={{ __html: `tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        error: "#ffb4ab",
        "on-background": "#e1e2ee",
        "primary-container": "#006aff",
        "on-secondary-container": "#a6b9de",
        "surface-container-high": "#272a33",
        "on-tertiary-fixed-variant": "#802900",
        "surface-dim": "#10131c",
        background: "#10131c",
        "tertiary-container": "#cd4700",
        "on-surface-variant": "#c2c6d8",
        "secondary-fixed-dim": "#b4c7ec",
        "surface-container": "#1d1f28",
        "primary-fixed-dim": "#b2c5ff",
        "on-error-container": "#ffdad6",
        "on-tertiary-fixed": "#380d00",
        "surface-tint": "#b2c5ff",
        "tertiary-fixed-dim": "#ffb59a",
        "platform-youtube": "#FF0000",
        "status-ready": "#34C759",
        "surface-container-lowest": "#0b0e16",
        "secondary-fixed": "#d6e3ff",
        "on-secondary-fixed-variant": "#354766",
        "on-error": "#690005",
        "on-primary-container": "#fefbff",
        "outline-variant": "#424655",
        "on-primary-fixed": "#001847",
        "on-primary-fixed-variant": "#0040a1",
        "on-surface": "#e1e2ee",
        "surface-bright": "#363942",
        "on-primary": "#002c72",
        surface: "#10131c",
        "on-secondary-fixed": "#061b38",
        "tertiary-fixed": "#ffdbcf",
        "platform-twitch": "#9146FF",
        "neutral-muted": "#8D8D8D",
        outline: "#8c90a1",
        "on-tertiary": "#5b1b00",
        "on-secondary": "#1e314f",
        "primary-fixed": "#dae2ff",
        "secondary-container": "#374969",
        tertiary: "#ffb59a",
        secondary: "#b4c7ec",
        "inverse-surface": "#e1e2ee",
        "inverse-primary": "#0056d1",
        "surface-variant": "#32343e",
        primary: "#b2c5ff",
        "error-container": "#93000a",
        "status-live": "#FF3B30",
        "inverse-on-surface": "#2d3039",
        "on-tertiary-container": "#fffbff",
        "surface-container-low": "#191b24",
        "surface-container-highest": "#32343e"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        "container-max": "1440px",
        base: "8px",
        "margin-mobile": "16px",
        "margin-desktop": "40px",
        gutter: "24px"
      },
      fontFamily: {
        "headline-md": ["Geist"],
        "headline-lg": ["Geist"],
        "body-lg": ["Geist"],
        "headline-xl": ["Geist"],
        "body-sm": ["Geist"],
        "headline-lg-mobile": ["Geist"],
        "body-md": ["Geist"],
        "label-sm": ["Geist"],
        "label-md": ["Geist"]
      },
      fontSize: {
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-sm": ["12px", { lineHeight: "14px", fontWeight: "500" }],
        "label-md": ["14px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }]
      }
    }
  }
};` }}></script>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;900&display=swap');

          .glow-effect { box-shadow: 0 0 15px rgba(178, 197, 255, 0.5); }
          .pulse-live { animation: pulse-red 2s infinite; }
          @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(255, 59, 48, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0); } }
          .ray-line { stroke-dasharray: 1500; stroke-dashoffset: 1500; animation: dash 3s linear forwards; }
          @keyframes dash { to { stroke-dashoffset: 0; } }
        `}</style>
      </head>
      <body className="bg-background text-on-background min-h-screen font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
