import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, sendLoginOtp, verifyLoginOtp } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });

      if (!data || !data.user) {
        setUser(null);
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setUser(data.user);
      return data;
    } catch (err) {
      setUser(null);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const data = await register({ username, email, password });
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      if (data?.user) {
        setUser(data.user);
      }
      return data;
    } catch (err) {
      console.error("Register error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async ({ email }) => {
    setLoading(true);
    try {
      return await sendLoginOtp({ email });
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async ({ email, otp }) => {
    setLoading(true);
    try {
      const data = await verifyLoginOtp({ email, otp });
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      setUser(data.user);
      return data;
    } catch (err) {
      setUser(null);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      localStorage.removeItem("token");
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    handleRegister,
    handleLogin,
    handleLogout,
    handleSendOtp,
    handleOtpLogin,
  };
};
