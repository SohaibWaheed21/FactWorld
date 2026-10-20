import Link from "next/link";

export const metadata = {
  title: "Avatar Art Credits - 3D Country Globe",
  description: "Asset and art attributions for country pixel-art characters",
};

export default function CreditsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8 md:p-16 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors mb-8"
        >
          ← Back to 3D Globe
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Avatar Art Credits</h1>
        <p className="text-zinc-400 text-sm mb-10">
          Attributions, sources, and licenses for character avatars featured on the 3D Country Globe.
        </p>

        <div className="space-y-6">
          {/* Japan Avatar Credit */}
          <section
            id="jpn"
            className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🇯🇵</span>
              <div>
                <h2 className="text-lg font-semibold text-white">Japan (JPN) Avatar</h2>
                <p className="text-xs text-zinc-400">Tiny Pixel Japan Male Character Pack</p>
              </div>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed mb-4">
              <strong>Tiny Pixel Japan Male Character Pack by LyniaDesign (itch.io)</strong>
            </p>
            <div className="rounded-xl bg-black/40 border border-white/5 p-4 text-xs text-zinc-400 leading-relaxed space-y-1.5">
              <p className="font-semibold text-zinc-300">License Terms:</p>
              <p>
                The author&apos;s license allows commercial use and modification, and does not allow
                reselling or redistributing the pack itself.
              </p>
            </div>
          </section>

          {/* China Avatar Credit */}
          <section
            id="chn"
            className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🇨🇳</span>
              <div>
                <h2 className="text-lg font-semibold text-white">China (CHN) Avatar</h2>
                <p className="text-xs text-zinc-400">Universal LPC Character Spritesheet</p>
              </div>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed mb-4">
              Generated via the <strong>Liberated Pixel Cup (LPC) Universal Spritesheet Character Generator</strong>.
              Authored by multiple community contributors under CC-BY-SA 3.0 and GPL 3.0 licenses.
            </p>
            <a
              href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/avatars/credits.csv`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2"
            >
              View Full LPC Contributors CSV ↗
            </a>
          </section>

          {/* Australia Avatar Credit */}
          <section
            id="aus"
            className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🇦🇺</span>
              <div>
                <h2 className="text-lg font-semibold text-white">Australia (AUS) Avatar</h2>
                <p className="text-xs text-zinc-400">Universal LPC Character Spritesheet</p>
              </div>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed mb-4">
              Generated via the <strong>Liberated Pixel Cup (LPC) Universal Spritesheet Character Generator</strong>.
              Authored by multiple community contributors under OGA-BY 3.0, CC-BY-SA 3.0, and GPL 3.0 licenses.
            </p>
            <div className="flex flex-wrap gap-4 text-xs">
              <a
                href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/avatars/australian.csv`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 underline underline-offset-2"
              >
                View Contributors CSV ↗
              </a>
              <a
                href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/avatars/australian-credits.txt`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 underline underline-offset-2"
              >
                View Detailed Attribution TXT ↗
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
