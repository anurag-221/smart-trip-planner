import TempLogin from "@/components/LoginBtn";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          Smart Trip Planner
        </h1>

        <Link
          href="/trips"
          className="text-sm text-emerald-400 hover:underline"
        >
          My Trips
        </Link>
        <TempLogin />
      </header>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
          Plan trips together.  
          <span className="text-emerald-400 block">
            In real-time.
          </span>
        </h2>

        <p className="text-slate-400 text-lg">
          Create trips, collaborate with friends, split expenses,
          chat live, and stay organized — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link
            href="/trips"
            className="px-6 py-3 rounded-lg bg-emerald-600 font-medium hover:bg-emerald-500 transition"
          >
            View Trips
          </Link>

          <Link
            href="/trips"
            className="px-6 py-3 rounded-lg border border-slate-700 hover:bg-slate-900 transition"
          >
            Create New Trip
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Feature
          title="🗺️ Smart Itinerary"
          desc="Plan places day-wise with full flexibility."
        />
        <Feature
          title="💬 Live Collaboration"
          desc="Chat and sync changes instantly with your group."
        />
        <Feature
          title="💰 Expense Splitting"
          desc="Track and divide trip expenses fairly."
        />
        <Feature
          title="🔔 Realtime Updates"
          desc="See updates instantly — no refresh needed."
        />
        <Feature
          title="📱 PWA Ready"
          desc="Install on mobile and use it like an app."
        />
        <Feature
          title="🔒 Secure Access"
          desc="Role-based access for owners and collaborators."
        />
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 pb-6">
        Built for collaborative travel ✨
      </footer>
    </main>
  );
}

function Feature({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-slate-400 text-sm">{desc}</p>
    </div>
  );
}