import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { type Role, type User } from "./storage";
import { api } from "./api";

interface AuthContextValue {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  register: (data: { username: string; email: string; password: string; role: Role }) => Promise<User>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const saved = localStorage.getItem('tuzamurane_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('tuzamurane_user');
      }
    }
  }, []);

  const login = React.useCallback(async (username: string, password: string) => {
    const data = await api.post('/auth/login', { username, password });
    localStorage.setItem('tuzamurane_token', data.token);
    localStorage.setItem('tuzamurane_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = React.useCallback(
    async (data: { username: string; email: string; password: string; role: Role }) => {
      const res = await api.post('/auth/register', data);
      // After register, we usually want them to login or we auto-login
      return res;
    },
    [],
  );

  const logout = React.useCallback(() => {
    localStorage.removeItem('tuzamurane_token');
    localStorage.removeItem('tuzamurane_user');
    setUser(null);
    navigate({ to: "/login" });
  }, [navigate]);

  const hasRole = React.useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
