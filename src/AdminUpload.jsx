import "./AdminUpload.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "./config";


// ✅ centralized fetch helper (adds token + handles 401 globally)
import { apiFetch } from "./api/apiFetch";

function AdminUpload() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("hospital");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [pois, setPois] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Google import state (existing)
  const [googlePlaces, setGooglePlaces] = useState([]);
  const [googleStatus, setGoogleStatus] = useState("");

  // ✅ NEW simple "Fetch nearby POIs" state
  const [radius, setRadius] = useState("2000");
  const [type, setType] = useState("restaurant");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logout clicked");
    localStorage.removeItem("eplq_token");
    window.location.href = "/login";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Uploading...");

    try {
      const token = localStorage.getItem("eplq_token");
      if (!token) {
        setMessage("No admin token. Please log in again.");
        return;
      }

      const res = await apiFetch("/api/admin/pois", {
        method: "POST",
        body: JSON.stringify({
          name,
          category,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Upload failed");
      } else {
        setMessage("POI created");
        setName("");
        setLat("");
        setLng("");
        setDescription("");
        fetchPois();
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error");
    }
  };

  // ✅ FIXED: fetchPois now checks res.ok
  const fetchPois = async () => {
    try {
      const token = localStorage.getItem("eplq_token");
      if (!token) {
        setMessage("No admin token. Please log in again.");
        return;
      }

      const res = await apiFetch("/api/admin/pois");

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load POIs.");
        return;
      }

      setPois(data.pois || []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load POIs.");
    }
  };

  // ✅ Google import handler (existing)
  const handleImportFromGoogle = async () => {
    try {
      setGoogleStatus("Loading from Google...");
      const params = new URLSearchParams({
        lat: lat || "17.4236",
        lng: lng || "78.4287",
        radius: 2000,
        type: category === "all" ? "" : category,
      });

   
      const res = await fetch(`${BASE_URL}/api/google/nearby?${params.toString()}`);

      const data = await res.json();

      if (!res.ok) {
        setGoogleStatus(data.message || "Failed to load from Google.");
        return;
      }

      setGooglePlaces(data.results || []);
      setGoogleStatus(`Loaded ${data.results?.length || 0} places.`);
    } catch (err) {
      console.error(err);
      setGoogleStatus("Network error loading from Google.");
    }
  };

  // ✅ Save one Geoapify place to backend
  const handleSaveGeoPlace = async (place) => {
    try {
      const token = localStorage.getItem("eplq_token");
      if (!token) {
        setMessage("No admin token. Please log in again.");
        return;
      }

      const res = await apiFetch("/api/admin/pois/from-geoapify", {
        method: "POST",
        body: JSON.stringify({
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          category: place.categories?.[0] || category,
          description: place.vicinity,
          place_id: place.place_id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to save place");
        return;
      }

      setMessage(`Saved: ${data.poi.name}`);
      fetchPois(); // refresh existing POIs list

      // ✅ NEW: remove saved place from list
      setGooglePlaces((prev) =>
        prev.filter((p) => p.place_id !== place.place_id)
      );
    } catch (err) {
      console.error(err);
      setMessage("Network error while saving place");
    }
  };

  // ✅ FIXED: safe parsing so HTML response doesn't crash UI
  const handleFetchPlaces = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        lat,
        lng,
        radius,
        type,
      });

      const res = await fetch(
        `https://eplq-backend.onrender.com/api/google/nearby?${params.toString()}`
      );

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Backend returned HTML instead of JSON: " + text.slice(0, 100)
        );
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch places");
      }

      setPlaces(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    console.log("handleDelete clicked with id:", id);
    const confirmed = window.confirm(
      "Are you sure you want to delete this place from EPLQ Admin?"
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("eplq_token");
      if (!token) {
        setMessage("No admin token. Please log in again.");
        return;
      }

      const res = await apiFetch(`/api/admin/pois/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Delete failed");
        return;
      }

      setPois((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      setMessage("Network error while deleting");
    }
  };

  useEffect(() => {
    fetchPois();
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-header">
        <span className="app-name">EPLQ Admin</span>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="admin-card">
        <h2 className="admin-title">EPLQ - Admin POI Upload</h2>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <label className="admin-label">Name</label>
            <input
              className="admin-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-row">
            <label className="admin-label">Category</label>
            <select
              className="admin-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="hospital">Hospital</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="shopping">Shopping</option>
              <option value="hotel">Hotel</option>
              <option value="restaurant">Restaurant</option>
              <option value="education">Education</option>
              <option value="temple">Temple</option>
            </select>
          </div>

          <div className="admin-form-row">
            <label className="admin-label">Latitude</label>
            <input
              className="admin-input"
              type="number"
              step="0.0001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-row">
            <label className="admin-label">Longitude</label>
            <input
              className="admin-input"
              type="number"
              step="0.0001"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-row">
            <label className="admin-label">Description (optional)</label>
            <textarea
              className="admin-textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short info about this place"
            />
          </div>

          <button type="submit" className="admin-button">
            Upload POI
          </button>
        </form>

        {message && <p style={{ marginTop: 10 }}>{message}</p>}

        {/* ✅ Geoapify import UI */}
        <button type="button" onClick={handleImportFromGoogle}>
          Fetch nearby from Google
        </button>
        <p>{googleStatus}</p>

        {googlePlaces.length > 0 && (
          <section>
            <h3>Geoapify Places (not saved yet)</h3>
            {googlePlaces.map((p) => (
              <div key={p.place_id} className="admin-poi-item">
                <strong>{p.name}</strong>
                <br />
                {p.vicinity}
                <br />
                <button
                  type="button"
                  className="admin-button"
                  style={{ marginTop: "6px" }}
                  onClick={() => handleSaveGeoPlace(p)}
                >
                  Save to EPLQ
                </button>
              </div>
            ))}
          </section>
        )}

        {/* ✅ Simple Fetch Places UI */}
        <section style={{ marginTop: "18px" }}>
          <h3>Fetch nearby POIs (simple)</h3>

          <div className="admin-form-row">
            <label className="admin-label">Radius (meters)</label>
            <input
              className="admin-input"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="2000"
            />
          </div>

          <div className="admin-form-row">
            <label className="admin-label">Type</label>
            <input
              className="admin-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="restaurant"
            />
          </div>

          <button onClick={handleFetchPlaces} disabled={loading}>
            {loading ? "Loading..." : "Fetch places"}
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {places.length > 0 && (
            <ul>
              {places.map((p) => (
                <li key={p.place_id}>
                  <strong>{p.name}</strong> – {p.vicinity}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="admin-poi-list">
          <h3>Existing POIs</h3>
          <input
            className="admin-input"
            style={{ maxWidth: "300px", marginBottom: "10px" }}
            placeholder="Search by name or category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {pois
            .filter((poi) => {
              const term = searchTerm.toLowerCase();
              return (
                poi.name.toLowerCase().includes(term) ||
                poi.category.toLowerCase().includes(term)
              );
            })
            .map((poi) => (
              <div key={poi._id} className="admin-poi-item">
                <strong>{poi.name}</strong> ({poi.category})
                <br />
                {poi.latitude}, {poi.longitude}
                {poi.description && (
                  <>
                    <br />
                    <em>{poi.description}</em>
                  </>
                )}
                <br />
                <button
                  type="button"
                  className="admin-button"
                  style={{ marginTop: "6px", marginRight: "6px" }}
                  onClick={() => navigate(`/admin/pois/${poi._id}/edit`)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-button"
                  style={{ marginTop: "6px", backgroundColor: "#c0392b" }}
                  onClick={() => handleDelete(poi._id)}
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default AdminUpload;
