import { Sprout, TrendingUp, ShieldCheck } from "lucide-react";

export function BrandPanel() {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
      style={{ background: "var(--gradient-brand)" }}
    >
      {/* decorative orbs */}
      <div
        className="absolute -top-32 -right-32 size-96 rounded-full blur-3xl opacity-30"
        style={{ background: "var(--gradient-gold)" }}
      />
      <div
        className="absolute -bottom-40 -left-20 size-96 rounded-full blur-3xl opacity-20"
        style={{ background: "var(--gradient-primary)" }}
      />
      {/* grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="size-11 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Sprout className="size-6 text-[oklch(0.2_0.04_80)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">TUZAMURANE</h1>
            <p className="text-xs text-white/60 uppercase tracking-widest">Cooperative</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Sales Information<br />Management System
          </h2>
          <p className="mt-4 text-white/70 text-base max-w-md leading-relaxed">
            Manage sales, customers, products, and inventory in a simple, secure, and fast way.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          {[
            { icon: TrendingUp, text: "Real-time reports" },
            { icon: ShieldCheck, text: "Role-Based Security" },
            { icon: Sprout, text: "Built for Cooperatives" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-white/80">
              <div className="size-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                <Icon className="size-4" />
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-xs text-white/50">
        © {new Date().getFullYear()} TUZAMURANE Cooperative · SIMS
      </div>
    </div>
  );
}
