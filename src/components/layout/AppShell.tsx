import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  ShoppingCart,
  FileBarChart,
  LogOut,
  Sprout,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/products", label: "Products", icon: Package },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/profile", label: "Profile", icon: UserCircle },
] as const;

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!user) {
    if (typeof window !== "undefined") navigate({ to: "/login" });
    return null;
  }

  const current = nav.find((n) => path.startsWith(n.to));

  return (
    <div className="flex min-h-screen" style={{ background: "var(--gradient-subtle)" }}>
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col relative">
        <div
          className="absolute inset-y-0 right-0 w-px"
          style={{ background: "var(--sidebar-border)" }}
        />
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Sprout className="size-5 text-[oklch(0.2_0.04_80)]" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight">TUZAMURANE</h1>
              <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">
                SIMS
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative overflow-hidden",
                  active
                    ? "text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                )}
                style={
                  active
                    ? { background: "var(--gradient-gold)" }
                    : undefined
                }
              >
                <Icon className="size-4 shrink-0" />
                <span>{label}</span>
                {active && (
                  <span className="absolute right-3 size-1.5 rounded-full bg-current opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-accent/50 mb-2">
            <div
              className="size-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-[11px] text-sidebar-foreground/60 capitalize">{user.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={logout}
          >
            <LogOut className="size-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-background/80 backdrop-blur-sm flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {current?.label ?? "Dashboard"}
            </h2>
            <p className="text-xs text-muted-foreground">
              TUZAMURANE Cooperative · Sales Information Management
            </p>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </header>
        <div className="flex-1 p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
