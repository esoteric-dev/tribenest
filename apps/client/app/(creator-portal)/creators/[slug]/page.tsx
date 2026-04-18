import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export default async function CreatorPublicPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="text-lg font-bold tracking-tight">
          TribeNest
        </Link>
        <Link
          href={`//${slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "varalabs.systems"}`}
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          Visit channel →
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-3xl mb-6">
          📺
        </div>
        <h1 className="text-3xl font-bold mb-2">{slug}</h1>
        <p className="text-white/40 mb-8">Creator on TribeNest</p>

        <div className="flex gap-4">
          <Link
            href={`//${slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "varalabs.systems"}`}
            className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm transition-colors"
          >
            Watch live
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/30 text-white/60 hover:text-white font-semibold text-sm transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
