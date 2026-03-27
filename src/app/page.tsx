import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

/* ── Mockup: Chrome Extension ── */
const ExtensionMockup = () => (
  <div className="w-[320px] rounded-2xl shadow-2xl overflow-hidden border border-border/60 bg-[#FAF8F5] text-[#2D2A26] font-sans shrink-0">
    {/* Header */}
    <div className="px-5 pt-5 pb-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">CodeCycle</h3>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#E8F0E8] text-[#5B8C5A] border border-[#5B8C5A]/20">
          3/5
        </span>
      </div>
      <p className="text-xs text-[#5B8C5A] font-medium mt-1.5">Dashboard &rarr;</p>
    </div>

    {/* Problem Card */}
    <div className="px-5 pb-3">
      <div className="rounded-xl border border-black/[0.06] bg-white/70 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold flex-1">Two Sum</span>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-500 border border-blue-500/20">
            Review
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#E8F0E8] text-[#5B8C5A]">
            Easy
          </span>
          <span className="text-xs text-[#7A756D]">Array &middot; Hash Table</span>
        </div>
      </div>
    </div>

    {/* Open Button */}
    <div className="px-5 pb-3">
      <div className="w-full py-3 rounded-xl bg-gradient-to-br from-[#5B8C5A] to-[#4A7349] text-white text-center text-sm font-semibold shadow-md">
        Open on LeetCode
      </div>
    </div>

    {/* Rating */}
    <div className="px-5 pb-5">
      <p className="text-xs text-[#7A756D] font-medium mb-2.5">How did it go?</p>
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: "Failed", desc: "Couldn't solve", hoverBg: "hover:bg-red-50" },
          { label: "Struggled", desc: "Solved with difficulty", hoverBg: "hover:bg-amber-50" },
          { label: "Solved", desc: "Got it with effort", hoverBg: "hover:bg-green-50" },
          { label: "Instant", desc: "Remembered it", hoverBg: "hover:bg-emerald-50" },
        ].map((r) => (
          <div
            key={r.label}
            className={`rounded-xl border border-black/[0.06] bg-white/70 px-3 py-2.5 shadow-sm transition ${r.hoverBg}`}
          >
            <p className="text-xs font-semibold">{r.label}</p>
            <p className="text-[10px] text-[#A8A299] mt-0.5">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── Mockup: Dashboard ── */
const DashboardMockup = () => (
  <div className="w-full max-w-[520px] rounded-2xl shadow-2xl overflow-hidden border border-border/60 bg-background shrink-0">
    {/* Top bar */}
    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold">CodeCycle</h3>
        <p className="text-xs text-muted-foreground">Your daily LeetCode review</p>
      </div>
      <span className="text-xs text-muted-foreground">Logout</span>
    </div>

    <div className="p-6 space-y-4">
      {/* Today's Review card */}
      <div className="rounded-xl border border-border p-4">
        <h4 className="text-sm font-semibold">Today&apos;s Review</h4>
        <p className="text-xs text-muted-foreground mt-1">2/5 completed &middot; 3 remaining</p>
        <div className="mt-3 inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium">
          Continue Review
        </div>
      </div>

      {/* Sync card */}
      <div className="rounded-xl border border-border p-4">
        <h4 className="text-sm font-semibold">Sync Problems</h4>
        <p className="text-xs text-muted-foreground mt-1">Fetch your solved problems from LeetCode</p>
        <div className="mt-3 inline-block px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
          Sync from LeetCode
        </div>
      </div>

      {/* Settings card */}
      <div className="rounded-xl border border-border p-4">
        <h4 className="text-sm font-semibold">Settings</h4>
        <div className="mt-3 space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Daily Goal</span>
              <span className="font-medium">5 problems</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-primary" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Max New Per Day</span>
              <span className="font-medium">2 problems</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full w-1/5 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ── Data ── */
const features = [
  {
    title: "Spaced Repetition",
    description:
      "Problems resurface at scientifically optimal intervals so you retain patterns long-term, not just before an interview.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>
    ),
  },
  {
    title: "Auto-Sync from LeetCode",
    description:
      "Connect your LeetCode account and we pull in every problem you've solved. No manual tracking.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
    ),
  },
  {
    title: "Daily Review Queue",
    description:
      "Each day you get a focused set of problems — a mix of new challenges and past problems due for review.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
    ),
  },
  {
    title: "Difficulty-Aware Scheduling",
    description:
      "Rate how each problem went. The algorithm adapts — problems you struggle with come back sooner.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    ),
  },
];

const steps = [
  {
    step: "1",
    title: "Connect LeetCode",
    description: "Link your account so we can import your solved problems automatically.",
  },
  {
    step: "2",
    title: "Review Daily",
    description: "Open CodeCycle each day and work through your personalized queue.",
  },
  {
    step: "3",
    title: "Rate & Repeat",
    description: "Tell us how it went — the algorithm handles the scheduling.",
  },
];

/* ── Page ── */
const LandingPage = async () => {
  const user = await getAuthUser();
  const isLoggedIn = !!user;

  const ctaHref = isLoggedIn ? "/dashboard" : "/login";
  const ctaLabel = isLoggedIn ? "Go to Dashboard" : "Get Started";

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">CodeCycle</span>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button asChild size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/60 text-xs font-medium text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Free &amp; open source
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Stop re-learning
              <br />
              <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                LeetCode problems
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
              CodeCycle uses spaced repetition to make sure every problem you solve stays solved. Review smarter, not harder.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="text-base h-12 px-8">
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base h-12 px-8">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Extension Preview ─── */}
      <section className="py-20 sm:py-28 px-6 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-5 text-center lg:text-left">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Chrome Extension</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Review problems without
                <br className="hidden sm:block" />
                {" "}leaving your browser
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
                The CodeCycle Chrome extension sits in your toolbar. Click it to see today&apos;s problems, open them on LeetCode, and rate how they went — all in a compact popup.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground max-w-md mx-auto lg:mx-0" role="list">
                {[
                  "One-click access from your toolbar",
                  "Auto-syncs your LeetCode session",
                  "Rate problems and track progress inline",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent blur-2xl pointer-events-none" aria-hidden="true" />
                <ExtensionMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Dashboard Preview ─── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-5 text-center lg:text-left">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Web Dashboard</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Your command center
                <br className="hidden sm:block" />
                {" "}for LeetCode mastery
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
                View your daily queue, sync new problems, tune your review settings, and browse your entire problem library — all from one dashboard.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground max-w-md mx-auto lg:mx-0" role="list">
                {[
                  "Daily progress at a glance",
                  "One-click LeetCode sync",
                  "Customizable daily goal & new problem limit",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent blur-2xl pointer-events-none" aria-hidden="true" />
                <DashboardMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-20 sm:py-28 px-6 bg-muted/40 scroll-mt-14">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-14">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Up and running in 60 seconds</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-14">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Built for long-term retention</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border p-6 space-y-4 transition-colors hover:bg-muted/50"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="py-20 sm:py-28 px-6 bg-muted/40">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to stop forgetting?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Connect your LeetCode account and start reviewing in under a minute. It&apos;s free.
          </p>
          <Button asChild size="lg" className="text-base h-12 px-10">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">CodeCycle</span>
          <span>Built for LeetCoders who want to actually remember.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
