import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, Truck, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight, Loader2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

type Tone = "primary" | "gold" | "blue" | "rose" | "violet";

const toneStyles: Record<Tone, { bg: string; ring: string }> = {
  primary: {
    bg: "linear-gradient(135deg, oklch(0.46 0.13 160), oklch(0.62 0.16 158))",
    ring: "oklch(0.46 0.13 160 / 0.15)",
  },
  gold: {
    bg: "linear-gradient(135deg, oklch(0.78 0.14 85), oklch(0.68 0.16 70))",
    ring: "oklch(0.78 0.14 85 / 0.18)",
  },
  blue: {
    bg: "linear-gradient(135deg, oklch(0.6 0.13 230), oklch(0.5 0.15 250))",
    ring: "oklch(0.6 0.13 230 / 0.15)",
  },
  rose: {
    bg: "linear-gradient(135deg, oklch(0.65 0.18 25), oklch(0.6 0.2 15))",
    ring: "oklch(0.65 0.18 25 / 0.15)",
  },
  violet: {
    bg: "linear-gradient(135deg, oklch(0.55 0.18 300), oklch(0.5 0.2 285))",
    ring: "oklch(0.55 0.18 300 / 0.15)",
  },
};

function Stat({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  value: string | number;
  icon: any;
  tone: Tone;
  hint?: string;
}) {
  const s = toneStyles[tone];
  return (
    <Card
      className="relative overflow-hidden border-0 transition-all hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="absolute -top-12 -right-12 size-32 rounded-full blur-2xl opacity-40"
        style={{ background: s.bg }}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </CardTitle>
        <div
          className="size-9 rounded-lg flex items-center justify-center text-white shadow-md"
          style={{ background: s.bg }}
        >
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {hint && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <ArrowUpRight className="size-3" /> {hint}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        // We catch individual failures to avoid total crash
        const results = await Promise.allSettled([
          api.get("/customers"),
          api.get("/products"),
          api.get("/suppliers"),
          api.get("/sales"),
        ]);
        
        const [cRes, pRes, sRes, saRes] = results;
        
        const c = cRes.status === 'fulfilled' ? cRes.value : [];
        const p = pRes.status === 'fulfilled' ? pRes.value : [];
        const s = sRes.status === 'fulfilled' ? sRes.value : [];
        const sales = saRes.status === 'fulfilled' ? saRes.value : [];

        setStats({
          customers: c.length,
          products: p.length,
          suppliers: s.length,
          sales: sales.length,
          revenue: sales.reduce((acc: number, item: any) => acc + Number(item.total_amount || 0), 0),
          recent: sales.slice(0, 5),
          lowStock: p.filter((item: any) => item.stock <= 10).slice(0, 5),
        });
      } catch (e: any) {
        setError(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Syncing with MySQL...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4 text-center p-8 bg-muted/10 rounded-3xl border border-dashed border-muted">
        <div className="p-5 rounded-full bg-rose-50 text-rose-500 shadow-inner">
           <AlertTriangle className="size-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight">Backend Connection Failed</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Please make sure the Backend Server is running (`node server.js`) and MySQL (XAMPP) is started.
          </p>
          {error && <code className="block mt-4 p-2 bg-muted text-[10px] rounded border overflow-auto max-w-md mx-auto">{error}</code>}
        </div>
        <Button onClick={() => window.location.reload()} variant="default" className="mt-4 px-8 shadow-lg">
          Reconnect System
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div
        className="relative overflow-hidden rounded-[2rem] p-10 text-white"
        style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-elegant)" }}
      >
        <div
          className="absolute -top-20 -right-20 size-80 rounded-full blur-3xl opacity-30"
          style={{ background: "var(--gradient-gold)" }}
        />
        <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
          <div className="space-y-2">
            <p className="text-white/60 text-xs uppercase tracking-widest font-bold">Incamake (Overview)</p>
            <h1 className="text-4xl font-extrabold tracking-tight">
              TUZAMURANE SIMS
            </h1>
            <p className="text-white/70 text-lg font-medium max-w-xl">
              Welcome back! Live insights from your cooperative database are ready.
            </p>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-sm font-semibold shadow-xl">
            <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Live MySQL Sync
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Stat label="Customers" value={stats.customers} icon={Users} tone="blue" />
        <Stat label="Products" value={stats.products} icon={Package} tone="primary" />
        <Stat label="Suppliers" value={stats.suppliers} icon={Truck} tone="violet" />
        <Stat label="Sales" value={stats.sales} icon={ShoppingCart} tone="rose" />
        <Stat
          label="Revenue (RWF)"
          value={stats.revenue.toLocaleString()}
          icon={DollarSign}
          tone="gold"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="size-5 text-emerald-500" /> Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {stats.recent.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <ShoppingCart className="size-12 text-muted/30 mx-auto" />
                <p className="text-sm text-muted-foreground">No sales recorded today.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recent.map((s: any) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white border border-muted/50 hover:border-primary/20 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className="size-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner"
                          style={{ background: "var(--gradient-primary)" }}
                        >
                          <ShoppingCart className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">
                            {s.customer_name || "General Sale"}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                             <Loader2 className="size-3" /> {new Date(s.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="font-black text-sm text-primary">
                        {Number(s.total_amount).toLocaleString()} RWF
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-rose-600">
              <AlertTriangle className="size-5" /> Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {stats.lowStock.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Package className="size-12 text-emerald-500/20 mx-auto" />
                <p className="text-sm text-emerald-600 font-medium">Inventory levels are healthy.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.lowStock.map((p: any) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 border border-rose-100/50 hover:bg-rose-50 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="size-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                        style={{ background: "var(--gradient-gold)" }}
                      >
                        <Package className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Unit: {p.unit || 'pcs'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-black px-3 py-1 rounded-full bg-rose-600 text-white shadow-sm">
                        {p.stock} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
