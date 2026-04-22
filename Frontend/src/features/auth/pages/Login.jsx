import React, { useState, useEffect } from 'react';
import '../auth.form.scss'
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

const Login = () => {

  const { loading, handleLogin, handleSendOtp, handleOtpLogin } = useAuth();;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState("password"); // password | otp
   const [otp, setOtp] = useState("");
   const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  // 🔥 HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      // 🔐 PASSWORD LOGIN
      if (mode === "password") {
        if (!email || !password) {
          setError("⚠ Please fill all fields");
          return;
        }

        await handleLogin({ email, password });
        navigate("/");
      }

      // 📩 OTP LOGIN
      else {
        if (!email) {
          setError("⚠ Please enter email");
          return;
        }

        // STEP 1: SEND OTP
        if (!otpSent) {
          await handleSendOtp({ email });
          setOtpSent(true);
          setTimer(30);
          return;
        }

        // STEP 2: VERIFY OTP
        if (!otp) {
          setError("⚠ Please enter OTP");
          return;
        }

        await handleOtpLogin({ email, otp });
        navigate("/");
      }

    } catch (err) {
      setError(err.message || "❌ Something went wrong");
    }
  };

  // ⏱ TIMER LOGIC
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

   // 🔄 RESEND OTP
  const handleResend = async () => {
    try {
      await handleSendOtp({ email });
      setTimer(30);
    } catch (err) {
      setError(err.message);
    }
  };
  

  if (loading) {
    return (
      <main>
        <div className="loader"></div>
      </main>
    )
  }

    return (
    <main>
        {/* 🔥 HEADLINE */}
        <div className="auth-header">
            <h1>Welcome to AI-Powered Interview Prep & Resume Builder</h1>
            <p>
            Practice technical questions, build strong resumes, and get job-ready 🚀
            </p>
        </div>
      <div className="form-container">

        <h1 className="title">Welcome Back 👋</h1>
        <p className="subtitle">Login to continue your journey 🚀</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* 🔥 MODE SWITCH */}
          <div className="mode-toggle">
            <button
              type="button"
              className={mode === "password" ? "active" : ""}
              onClick={() => {
                setMode("password");
                setOtpSent(false);
                setTimer(0);
              }}
            >
              Password
            </button>

            <button
              type="button"
              className={mode === "otp" ? "active" : ""}
              onClick={() => {
                setMode("otp");
                setPassword("");
              }}
            >
              OTP
            </button>
          </div>

          {/* EMAIL */}
          <div className="input-group">
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
            />
          </div>

          {/* PASSWORD */}
          {mode === "password" && (
            <div className="input-group password-group">
              <label>Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />
              <span
                className="toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>
          )}

          {/* OTP INPUT */}
          {mode === "otp" && otpSent && (
            <div className="input-group">
              <label>Enter OTP</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
            </div>
          )}

          {/* OTP MESSAGE */}
          {mode === "otp" && otpSent && (
            <p style={{ color: "green", textAlign: "center" }}>
              OTP sent to your email 📩
            </p>
          )}

          {/* 🔁 RESEND OTP */}
          {mode === "otp" && otpSent && (
            <div style={{ textAlign: "center" }}>
              {timer > 0 ? (
                <p style={{ color: "gray" }}>
                  Resend OTP in {timer}s
                </p>
              ) : (
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResend}
                >
                  Resend OTP
                </button>
              )}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button className='button primary-button' disabled={loading}>
            {loading
              ? "Processing..."
              : mode === "password"
              ? "Login"
              : otpSent
              ? "Verify OTP"
              : "Send OTP"}
          </button>

        </form>

        <p className="footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>

      </div>
    </main>
  )
}

export default Login;