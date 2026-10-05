import { createContext, useState, useEffect } from "react";
import { getMe } from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Check if token exists synchronously: if no token, loading is false instantly (0ms stall)
  const hasToken = typeof localStorage !== "undefined" && !!localStorage.getItem("token");
  const [loading, setLoading] = useState(hasToken);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getMe();
        if (isMounted) {
          if (!data || !data.user) {
            localStorage.removeItem("token");
            setUser(null);
          } else {
            setUser(data.user);
          }
        }
      } catch (err) {
        if (isMounted) {
          localStorage.removeItem("token");
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
