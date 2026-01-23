// frontend/src/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Login.css"; // ✅ reuse same styling classes
import { BASE_URL } from "../config";


//const BASE_URL = "https://eplq-backend.onrender.com";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // ✅ NEW: show/hide password
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Loading...");

    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Error");
      } else {
        setMessage("Registered successfully!");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">EPLQ Register</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            Email
            <input
              className="login-input"
              type="email"
              value={email}
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
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          <button type="submit" className="login-button">
            Register
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}

        {/* ✅ Centered footer */}
        <div className="login-footer">
          <span>Already have an account?</span>
          <button
            type="button"
            className="login-register-link"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
