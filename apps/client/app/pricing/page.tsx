"use client";

import { CreatorAuthProvider } from "../_contexts/creator-auth";
import AriStreamNav from "../_components/AriStream-nav";
import AriStreamFooter from "../_components/AriStream-footer";
import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");

  const plans = [
    {
      name: "Free",
      description: "Perfect for testing and casual creators.",
      price: { monthly: 0, yearly: 0 },
      features: [
        "Stream to 2 channels",
        "AriStream watermark logo",
        "Basic live chat integration",
        "Standard studio overlays",
        "Up to 1080p stream quality",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Standard",
      description: "Grow your network and remove watermarks.",
      price: { monthly: 19, yearly: 16 },
      features: [
        "Stream to 5 channels",
        "No AriStream watermark logo",
        "Custom RTMP destinations",
        "Advanced live studio overlays",
        "6 hours pre-recorded video stream",
        "Prioritized support feed",
      ],
      cta: "Go Standard",
      popular: true,
    },
    {
      name: "Professional",
      description: "Power your brand with customized streaming.",
      price: { monthly: 49, yearly: 41 },
      features: [
        "Stream to 8 channels",
        "No AriStream watermark logo",
        "3 Custom RTMP destinations",
        "Split-feed video source input",
        "10 hours pre-recorded video stream",
        "Dedicated RTMP pull sources",
        "24/7 dedicated system support",
      ],
      cta: "Go Professional",
      popular: false,
    },
  ];

  const faqs = [
    {
      q: "Does streaming to multiple platforms require a fast internet connection?",
      a: "No! AriStream handles all the distribution in our cloud servers. You send a single video stream to us, and we route it to 30+ destinations simultaneously. Your computer and internet load remain exactly the same as streaming to a single destination.",
    },
    {
      q: "Can I cancel or upgrade my subscription plan at any time?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription plan directly from your dashboard billing settings with single-click convenience. If you cancel, your premium features remain active until the end of your billing cycle.",
    },
    {
      q: "What video encoders does AriStream support?",
      a: "AriStream is fully compatible with any standard live encoder. This includes popular tools like OBS Studio, Streamlabs Desktop, vMix, Wirecast, Zoom, and hardware encoders like LiveU or Teradek.",
    },
    {
      q: "Can I stream pre-recorded video files live?",
      a: "Absolutely! With our standard and professional plans, you can upload pre-recorded broadcasts (MP4, MKV, etc.) directly, set the date and time, and our scheduler will stream them to all your channels automatically.",
    },
  ];

  return (
    <CreatorAuthProvider>
      <div className="dark bg-background text-on-background min-h-screen font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
        <AriStreamNav />

        <main className="pt-32 pb-16">
          {/* Pricing Hero */}
          <section className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center mb-16">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-primary text-label-sm font-semibold uppercase tracking-wider mb-6">
              <span className="material-symbols-outlined text-[16px]">payments</span>
              Flexible &amp; Scalable Plans
            </span>
            <h1 className="text-headline-xl font-headline-xl text-on-background max-w-4xl mx-auto mb-6 leading-tight">
              Fair Pricing. <span className="text-primary glow-effect px-2">No Hidden Fees.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
              Pick the right tier for your brand or streaming operations. Save up to 20% by switching to yearly billing.
            </p>

            {/* Billing period switcher */}
            <div className="inline-flex items-center bg-surface-container border border-outline-variant/30 p-1 rounded-full">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-full font-label-md text-label-md transition-all ${billingPeriod === "monthly"
                    ? "bg-primary text-on-primary font-bold shadow-md"
                    : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-6 py-2 rounded-full font-label-md text-label-md transition-all flex items-center gap-1.5 ${billingPeriod === "yearly"
                    ? "bg-primary text-on-primary font-bold shadow-md"
                    : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                Yearly
                <span className="bg-primary-container text-on-primary-container text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  Save 20%
                </span>
              </button>
            </div>
          </section>

          {/* Pricing Grid */}
          <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-stretch">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`bg-surface-container border rounded-xl p-8 flex flex-col justify-between hover:scale-[1.02] transition-all relative ${plan.popular
                      ? "border-primary shadow-[0_0_25px_rgba(178,197,255,0.15)] scale-[1.01]"
                      : "border-outline-variant/10"
                    }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[11px] px-3.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <h3 className="text-headline-md font-headline-md text-on-background mb-2">
                      {plan.name}
                    </h3>
                    <p className="font-body-sm text-body-sm text-neutral-muted mb-6 min-h-[40px]">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-headline-xl font-headline-xl text-on-background">
                        ${billingPeriod === "monthly" ? plan.price.monthly : plan.price.yearly}
                      </span>
                      <span className="font-label-md text-label-md text-on-surface-variant">
                        /month
                      </span>
                    </div>
                    <div className="h-px bg-outline-variant/10 mb-8" />
                    <ul className="flex flex-col gap-4 font-body-sm text-body-sm text-neutral-muted mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                            check
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/signup"
                    className={`w-full py-3.5 px-6 rounded-lg font-label-md text-label-md text-center font-bold active:scale-[0.98] transition-all ${plan.popular
                        ? "bg-primary text-on-primary hover:bg-primary-fixed shadow-[0_0_20px_rgba(178,197,255,0.2)]"
                        : "bg-surface-container-high border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest"
                      }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing FAQ Section */}
          <section className="px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto mb-24">
            <h2 className="text-headline-lg font-headline-lg text-on-background text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="flex flex-col gap-6">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container border border-outline-variant/10 rounded-xl p-6"
                >
                  <h4 className="font-label-md text-label-md text-on-background font-bold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      help_outline
                    </span>
                    {faq.q}
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant pl-7 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Footer CTA */}
          <section className="relative px-margin-mobile md:px-margin-desktop py-24 bg-surface-container border-y border-outline-variant/10 overflow-hidden text-center mb-16">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(178,197,255,0.15),rgba(0,0,0,0))]" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-headline-lg font-headline-lg text-on-background mb-6">
                Start reaching a wider audience today
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
                Sign up instantly. Free account gives you everything you need to start streaming.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-primary text-on-primary font-headline-md text-[18px] px-10 py-4 rounded-full font-bold hover:bg-primary-fixed transition-all glow-effect shadow-[0_0_30px_rgba(178,197,255,0.4)]"
              >
                Start Streaming Free
              </Link>
            </div>
          </section>
        </main>

        <AriStreamFooter />
      </div>
    </CreatorAuthProvider>
  );
}
