import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Header.css";

function Header({ user }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // ✅ login state
  const isLoggedIn = !!localStorage.getItem("eplq_token");

  // ✅ NEW: read stored email for profile dropdown
  const email = localStorage.getItem("eplq_email");

  const handleLogout = () => {
    localStorage.removeItem("eplq_token");
    localStorage.removeItem("eplq_email"); // ✅ NEW
    localStorage.removeItem("eplq_searchDraft");
    setOpen(false);
    navigate("/login");
  };

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <span className="logo-circle">EPLQ</span>
        <span className="logo-text">POI Finder</span>
      </div>

      <nav className="top-bar-nav">
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>
        <NavLink to="/search" className="nav-link">
          Search POIs
        </NavLink>
        <NavLink to="/about" className="nav-link">
          About
        </NavLink>
        <NavLink to="/contact" className="nav-link">
          Contact
        </NavLink>

        {/* ✅ Only logged-in users */}
        {isLoggedIn && (
          <NavLink to="/favourites" className="nav-link">
            My Favourites
          </NavLink>
        )}

        {/* ✅ Not logged in → show Login & Register */}
        {!isLoggedIn && (
          <>
            <NavLink to="/login" className="nav-link">
              Login
            </NavLink>
            <NavLink to="/register" className="nav-link">
              Register
            </NavLink>
          </>
        )}
      </nav>

      {/* ✅ Right side actions */}
      {isLoggedIn && (
        <div className="top-bar-actions">
          <div className="admin-box">
            {user?.role === "admin" && (
              <button
                className="pill-button admin"
                onClick={() => navigate("/admin/upload")}
              >
                Admin upload
              </button>
            )}

            <div className="profile-circle" onClick={() => setOpen(!open)}>
              <span className="profile-icon">
                {(email && email[0].toUpperCase()) || "U"}
              </span>
            </div>

            {open && (
              <div className="profile-menu">
                {/* ✅ NEW: show full email */}
                <div className="profile-menu-item">{email || "User"}</div>

                {/* optional: show role line */}
                <div className="profile-menu-item">
                  Role: {user?.role || "user"}
                </div>

                <button
  type="button"
  className="profile-menu-item as-button logout"
  onClick={handleLogout}
>
  Logout
</button>


              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
