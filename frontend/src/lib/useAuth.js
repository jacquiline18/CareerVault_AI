import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./supabase";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate("/login");
      setUser(session.user);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) return navigate("/login");
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return { user, loading };
}
