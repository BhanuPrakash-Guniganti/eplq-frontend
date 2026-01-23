import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { BASE_URL } from "./config";


//const BASE_URL = "https://eplq-backend.onrender.com";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ NEW
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("eplq_token", data.token);
      localStorage.setItem("eplq_email", email); // ✅ store email for profile dropdown

      // ✅ NEW: store real user object (role, email, id)
      if (data.user) {
        localStorage.setItem("eplq_user", JSON.stringify(data.user));
        setUser?.(data.user);
      }

      setMessage("Login success");
      window.location.href = "/search";
    } catch (err) {
      console.error(err);
      setMessage("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">EPLQ Login</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            Email
            <input
              className="login-input"
              type="email"
              value={email}
              disabled={isSubmitting}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            Password
            <div className="password-wrapper">
              <input
                className="login-input"
                type={showPassword ? "text" : "password"}
                value={password}
                disabled={isSubmitting}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                disabled={isSubmitting}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : "Login"}
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}

        {/* ✅ Footer (same layout as Register page) */}
        <div className="login-footer">
          <span>Don’t have an account?</span>
          <button
            type="button"
            className="login-register-link"
            disabled={isSubmitting}
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
