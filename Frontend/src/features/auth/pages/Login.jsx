import React, { useState, useEffect } from 'react';
import '../auth.form.scss';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { user, loading, handleLogin, handleSendOtp, handleOtpLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState("password"); // password | otp
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      // PASSWORD LOGIN
      if (mode === "password") {
        if (!email || !password) {
          setError("Please provide both email and password.");
          return;
        }

        setSubmitting(true);
        await handleLogin({ email, password });
        navigate("/");
      }
      // OTP LOGIN
      else {
        if (!email) {
          setError("Please provide your registered email address.");
          return;
        }

        // STEP 1: SEND OTP
        if (!otpSent) {
          setSubmitting(true);
          await handleSendOtp({ email });
          setOtpSent(true);
          setTimer(30);
          return;
        }

        // STEP 2: VERIFY OTP
        if (!otp) {
          setError("Please enter the verification code sent to your email.");
          return;
        }

        setSubmitting(true);
        await handleOtpLogin({ email, otp });
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  // TIMER LOGIC
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // RESEND OTP
  const handleResend = async () => {
    try {
      await handleSendOtp({ email });
      setTimer(30);
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    }
  };

  const isBusy = submitting || loading;

  return (
    <main className="auth-page">
      {/* BRAND & HEADER */}
      <div className="auth-header">
        <div className="auth-brand-pill">
          <Sparkles size={14} className="brand-icon" />
          <span>PrepAI Career Command Center</span>
        </div>
        <h1>Elevate Your Career Trajectory</h1>
        <p>From Resume to Ready. Master technical interviews and accelerate your readiness.</p>
      </div>

      <div className="form-container">
        <div className="form-header-group">
          <h2 className="title">Welcome Back</h2>
          <p className="subtitle">Sign in to resume your interview prep and roadmap</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* AUTH MODE TOGGLE */}
          <div className="mode-toggle" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "password"}
              className={mode === "password" ? "active" : ""}
              onClick={() => {
                setMode("password");
                setOtpSent(false);
                setTimer(0);
              }}
            >
              <Lock size={14} />
              <span>Password</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mode === "otp"}
              className={mode === "otp" ? "active" : ""}
              onClick={() => {
                setMode("otp");
                setPassword("");
              }}
            >
              <KeyRound size={14} />
              <span>One-Time Code</span>
            </button>
          </div>

          {/* EMAIL */}
          <div className="input-group">
            <label htmlFor="login-email">Work or Personal Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="field-icon" />
              <input
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          {mode === "password" && (
            <div className="input-group password-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="field-icon" />
                <input
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your secure password"
                  required
                />
                <button
                  type="button"
                  className="toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* OTP INPUT */}
          {mode === "otp" && otpSent && (
            <div className="input-group">
              <label htmlFor="login-otp">Verification Code (6-digit)</label>
              <div className="input-with-icon">
                <KeyRound size={16} className="field-icon" />
                <input
                  id="login-otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter code received"
                  autoComplete="one-time-code"
                  required
                />
              </div>
            </div>
          )}

          {/* OTP SENT NOTIFICATION */}
          {mode === "otp" && otpSent && (
            <div className="otp-success">
              <ShieldCheck size={16} />
              <span>Verification code sent to {email}</span>
            </div>
          )}

          {/* OTP RESEND TIMER */}
          {mode === "otp" && otpSent && (
            <div className="resend-wrapper">
              {timer > 0 ? (
                <span className="timer-text">Resend code available in {timer}s</span>
              ) : (
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResend}
                >
                  Resend Verification Code
                </button>
              )}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button className="button primary-button" type="submit" disabled={isBusy}>
            <span>
              {isBusy
                ? "Authenticating..."
                : mode === "password"
                ? "Sign In to Workspace"
                : otpSent
                ? "Verify & Continue"
                : "Send Verification Code"}
            </span>
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="footer">
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
