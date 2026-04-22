import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";
import { sendLoginOtp, verifyLoginOtp } from "../services/auth.api";


export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


   const handleLogin = async ({ email, password }) => {
  setLoading(true)
  try {
    const data = await login({ email, password });

    if (!data || !data.user) {
      setUser(null);
      return;
      // throw new Error("Invalid credentials");
    }

    setUser(data.user);

  } catch (err) {
    setUser(null);             
    console.error(err);
    throw err;                 
  } finally {
    setLoading(false);
  }
};

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
        } catch (err) {
            
        } finally {
            setLoading(false)
        }
    }

    const handleSendOtp = async ({ email }) => {
  setLoading(true);
  try {
    await sendLoginOtp({ email });
  } catch (err) {
    console.error(err);
    throw err; // ✅ IMPORTANT
  } finally {
    setLoading(false);
  }
    };

    const handleOtpLogin = async ({ email, otp }) => {
  setLoading(true);
  try {
    const data = await verifyLoginOtp({ email, otp });
    setUser(data.user);
  } catch (err) {
    setUser(null);
    console.error(err);
    throw err; // ✅ IMPORTANT
  } finally {
    setLoading(false);
  }
};

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            setUser(null)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        const getAndSetUser = async () => {
    try {
        const data = await getMe();

        // ✅ HANDLE LOGOUT CASE
        if (!data || !data.user) {
            setUser(null);
            return;
        }

        setUser(data.user);

    } catch (err) {
        setUser(null); // fallback safety
    } finally {
        setLoading(false);
    }
};

        getAndSetUser()

    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout,handleSendOtp,
  handleOtpLogin };
}