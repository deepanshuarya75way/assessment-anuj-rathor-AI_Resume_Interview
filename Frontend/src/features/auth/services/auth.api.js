import api from "../../../utils/api";

export async function register({ username, email, password }) {
try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        return response.data

    } catch (err) {
        console.log(err)
    }

};

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password
    });

    return response.data;

  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);

    throw new Error(err.response?.data?.message || "Login failed"); // ✅ FIX
  }
}

export const sendLoginOtp = async ({ email }) => {
  try {
    const response = await api.post("/api/auth/login-otp/send", {
      email
    });

    return response.data;

  } catch (err) {
    console.error("Send OTP error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Failed to send OTP");
  }
};

export const verifyLoginOtp = async ({ email, otp }) => {
  try {
    const response = await api.post("/api/auth/login-otp/verify", {
      email,
      otp
    });

    return response.data;

  } catch (err) {
    console.error("OTP verify error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Invalid OTP");
  }
};

export async function logout() {
  try{
      const response = await api.get('/api/auth/logout');
  return response.data;
  }
  catch(err){
    console.log(err);
  }
}

export async function getMe() {
  try {
    const response = await api.get('/api/auth/get-me');
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      return null; // ✅ expected case
    }

    console.error("getMe error:", err.message);
    return null;
  }
}