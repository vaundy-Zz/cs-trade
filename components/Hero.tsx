import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/30 p-8 shadow-xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 opacity-40" />
      <div className="relative grid gap-8 md:grid-cols-[2fr,1fr]">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-semibold md:text-5xl">Built for speed, resilience, and scale.</h1>
          <p className="text-lg text-slate-200/90">
            This starter demonstrates how to combine streaming SSR, Redis-backed caching, tailored database queries, and telemetry-first design for blazing-fast experiences.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <MetricCard label="TTFB" value="< 150 ms" trend="Improved" />
            <MetricCard label="Time to Interactive" value="1.2 s" trend="Improved" />
            <MetricCard label="CLS" value="0.03" trend="Stable" />
            <MetricCard label="LCP" value="1.8 s" trend="Improved" />
          </div>
        </div>
        <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-black/40">
          <Image
            src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80"
            alt="Server performance dashboard"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover opacity-80"
          />
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-slate-100 shadow">
      <p className="text-sm uppercase tracking-wide text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs uppercase text-emerald-400">{trend}</p>
    </div>
  );
}
