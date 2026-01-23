// src/App.jsx
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import Search from "./Search";
import AdminUpload from "./AdminUpload";
import Register from "./pages/Register.jsx";
import EditPoi from "./pages/EditPoi.jsx";
import PoiDetails from "./PoiDetails.jsx";
import Favourites from "./pages/Favourites";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Header from "./components/Header";

function AppLayout() {
  // ✅ REAL USER (loaded from localStorage after login)
  const [user, setUser] = useState(null);

  // ✅ Load user on refresh
  useEffect(() => {
    try {
      const saved = localStorage.getItem("eplq_user");
      if (saved) setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem("eplq_user");
    }
  }, []);

  const location = useLocation();
  const hideHeader =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!hideHeader && <Header user={user} />}

      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/search" replace />} />

        {/* ✅ Public routes */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />

        {/* Public pages */}
        <Route path="/search" element={<Search />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* ✅ Protected routes (Outlet pattern) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/upload" element={<AdminUpload />} />
          <Route path="/admin/pois/:id/edit" element={<EditPoi />} />
          <Route path="/poi/:id" element={<PoiDetails />} />
          <Route path="/favourites" element={<Favourites />} />
        </Route>

        {/* 404 route */}
        <Route
          path="*"
          element={<h2 style={{ padding: "2rem" }}>404 - Page Not Found</h2>}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;

