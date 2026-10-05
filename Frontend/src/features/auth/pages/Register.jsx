import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Link } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import '../auth.form.scss';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { user, loading, handleRegister } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("Please fill in all required fields to create your account.");
      return;
    }
    try {
      setError("");
      setSubmitting(true);
      await handleRegister({ username, email, password });
      navigate("/");
    } catch {
      setError("Registration failed. Please check your credentials and try again.");
    } finally {
      setSubmitting(false);
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
        <h1>Begin Your Readiness Journey</h1>
        <p>From Resume to Ready. Personalized roadmaps, AI interview studios, and smart resume scoring.</p>
      </div>

      <div className="form-container">
        <div className="form-header-group">
          <h2 className="title">Create Account</h2>
          <p className="subtitle">Start preparing for your dream engineering & tech roles</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* USERNAME */}
          <div className="input-group">
            <label htmlFor="reg-username">Full Name / Display Name</label>
            <div className="input-with-icon">
              <User size={16} className="field-icon" />
              <input
                id="reg-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                autoComplete="name"
                placeholder="Krish Sharma"
                required
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="input-group">
            <label htmlFor="reg-email">Work or Personal Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="field-icon" />
              <input
                id="reg-email"
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
          <div className="input-group password-group">
            <label htmlFor="reg-password">Create Secure Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input
                id="reg-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
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

          <button type="submit" className="button primary-button" disabled={isBusy}>
            <span>{isBusy ? "Creating Account..." : "Create Account & Get Started"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
