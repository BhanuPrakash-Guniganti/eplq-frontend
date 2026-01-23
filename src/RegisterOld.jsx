// frontend/src/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // ✅ reuse same styling classes

const BASE_URL = "https://eplq-backend.onrender.com";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

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
        body: JSON.stringify({ email, password, role }),
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
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            Role
            <select
              className="login-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
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
