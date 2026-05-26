import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandPanel } from "@/components/layout/BrandPanel";
import { Sprout, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success("Login successful! Welcome back.");
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: "var(--gradient-subtle)" }}>
      <BrandPanel />

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div
              className="size-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sprout className="size-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight">TUZAMURANE</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">SIMS</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-md hover:shadow-lg transition-all"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-elegant)" }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="size-4 mr-2" /> Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border bg-muted/50 p-4 text-xs">
            <p className="font-semibold text-foreground mb-1">Demo credentials</p>
            <p className="text-muted-foreground">
              Username: <code className="font-mono text-foreground">admin</code> · Password:{" "}
              <code className="font-mono text-foreground">admin123</code>
            </p>
          </div>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
