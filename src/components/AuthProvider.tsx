"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { User, SupabaseClient } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    // Supabase SDK를 lazy import하여 초기 번들에서 제외
    import("@/lib/supabase-auth").then(({ createBrowserSupabaseClient }) => {
      const supabase = createBrowserSupabaseClient();
      supabaseRef.current = supabase;

      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user ?? null);
        setLoading(false);
      });

      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
    });
  }, []);

  async function signOut() {
    if (supabaseRef.current) {
      await supabaseRef.current.auth.signOut();
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
