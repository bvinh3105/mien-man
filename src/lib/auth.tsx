"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { supabase } from "./supabase";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from profiles table
  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  }

  useEffect(() => {
    // Get initial session — safe khi Supabase offline
    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) fetchProfile(s.user.id);
      })
      .catch(() => {
        // Supabase unreachable — bỏ qua, vẫn cho dùng mã nội bộ
      })
      .finally(() => setLoading(false));

    // Listen for auth changes
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const result = supabase.auth.onAuthStateChange((_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          fetchProfile(s.user.id);
        } else {
          setProfile(null);
        }
      });
      subscription = result.data.subscription;
    } catch {
      // Supabase unreachable — bỏ qua
    }

    return () => subscription?.unsubscribe();
  }, []);

  async function signUp(email: string, password: string, fullName: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      return { error: error?.message ?? null };
    } catch {
      return { error: "Không thể kết nối server. Vui lòng thử lại sau." };
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message ?? null };
    } catch {
      return { error: "Không thể kết nối server. Vui lòng thử lại sau." };
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch {
      // Supabase unreachable — vẫn clear local state
    }
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin: profile?.role === "admin",
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
