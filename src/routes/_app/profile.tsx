import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { User, Mail, Shield, Key, Save, UserCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    toast.success("Password changed successfully!");
    setForm({ ...form, currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and account security.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="h-24" style={{ background: "var(--gradient-primary)" }} />
            <CardContent className="pt-0 -mt-12 flex flex-col items-center text-center">
              <div className="size-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
                <div className="size-full flex items-center justify-center text-3xl font-black text-white" style={{ background: "var(--gradient-gold)" }}>
                  {user?.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <h3 className="mt-4 text-xl font-bold">{user?.username}</h3>
              <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
              <div className="mt-6 w-full pt-6 border-t space-y-3 text-left">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Mail className="size-3" /> {user?.email}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Shield className="size-3" /> Account Active
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCircle className="size-5 text-primary" /> Personal Information
              </CardTitle>
              <CardDescription>Update your account's username and email address.</CardDescription>
            </CardHeader>
            <form onSubmit={saveProfile}>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={form.username} 
                      onChange={(e) => setForm({...form, username: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={form.email} 
                      onChange={(e) => setForm({...form, email: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t justify-end">
                <Button type="submit" style={{ background: "var(--gradient-primary)" }}>
                  <Save className="size-4 mr-2" /> Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="size-5 text-primary" /> Change Password
              </CardTitle>
              <CardDescription>Ensure your account is using a strong, unique password.</CardDescription>
            </CardHeader>
            <form onSubmit={changePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input 
                    id="current" 
                    type="password" 
                    value={form.currentPassword}
                    onChange={(e) => setForm({...form, currentPassword: e.target.value})}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input 
                      id="new" 
                      type="password" 
                      value={form.newPassword}
                      onChange={(e) => setForm({...form, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input 
                      id="confirm" 
                      type="password" 
                      value={form.confirmPassword}
                      onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t justify-end">
                <Button type="submit" style={{ background: "var(--gradient-primary)" }}>
                  <Key className="size-4 mr-2" /> Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
