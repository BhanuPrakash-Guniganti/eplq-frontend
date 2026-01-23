import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Search.css";
import PoiCard from "./components/PoiCard";
import Header from "./components/Header";
import { BASE_URL } from "./config";


// ✅ Leaflet Map imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ✅ Leaflet marker icon fix (important for React apps)
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

//const BASE_URL = "https://eplq-backend.onrender.com";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ✅ Helper component: reacts to center changes and pans the map
function ChangeMapCenter({ center }) {
  const map = useMap();
  map.flyTo(center, map.getZoom());
  return null;
}

function Search() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState(2);
  const [category, setCategory] = useState("all");
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState(
    "Enter location details and click Search."
  );

  // ✅ hasSearched flag (empty state fix)
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ Search loading
  const [isSearching, setIsSearching] = useState(false);

  // ✅ separate search error message
  const [searchError, setSearchError] = useState("");

  // ✅ geolocation error message state
  const [geoError, setGeoError] = useState("");

  // ✅ store last successful geolocation as home/default
  const [homeCenter, setHomeCenter] = useState(null);

  // ✅ favourites state + error
  const [favourites, setFavourites] = useState(new Set());
  const [favError, setFavError] = useState("");

  // ✅ favourites success message
  const [favSuccess, setFavSuccess] = useState("");

  // ✅ Drawer state
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigate = useNavigate();

  // ✅ fallback map center
  const fallbackCenter =
    lat && lng ? [parseFloat(lat), parseFloat(lng)] : [17.385, 78.4867];

  // ✅ map center state (source of truth for map)
  const [mapCenter, setMapCenter] = useState(fallbackCenter);

  // ✅ Drawer open handler
  const handleResultClick = (poi) => {
    // ✅ guard against bad coordinates
    if (poi.latitude == null || poi.longitude == null) return;

    setSelectedPoi(poi);
    setIsDrawerOpen(true);
    setMapCenter([poi.latitude, poi.longitude]); // ✅ recenter map on POI click
  };

  // ✅ 1) On mount: Restore only form fields
  useEffect(() => {
    const saved = localStorage.getItem("eplq_searchDraft");
    if (!saved) return;

    try {
      const d = JSON.parse(saved);

      setLat(d.lat || "");
      setLng(d.lng || "");
      setRadius(d.radius ?? 2);
      setCategory(d.category || "all");
      setSearchTerm(d.searchTerm || "");

      if (d.lat && d.lng) {
        setMapCenter([parseFloat(d.lat), parseFloat(d.lng)]);
      }
    } catch {
      localStorage.removeItem("eplq_searchDraft");
    }
  }, []);

  // ✅ 2) Save only form fields (NOT results/status)
  useEffect(() => {
    if (!lat && !lng && category === "all" && !searchTerm && radius === 2) {
      return;
    }

    const draft = { lat, lng, radius, category, searchTerm };
    localStorage.setItem("eplq_searchDraft", JSON.stringify(draft));
  }, [lat, lng, radius, category, searchTerm]);

  // ✅ 3) On mount: Load favourites from backend
  useEffect(() => {
    const loadFavourites = async () => {
      try {
        const token = localStorage.getItem("eplq_token");
        if (!token) return;

        const res = await fetch(`${BASE_URL}/api/user/favourites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("Failed to load favourites:", data.message);
          return;
        }

        const ids = new Set((data.results || []).map((p) => p._id || p.id));
        setFavourites(ids);
      } catch (err) {
        console.error("Error loading favourites:", err);
      }
    };

    loadFavourites();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("eplq_token");
    localStorage.removeItem("eplq_searchDraft");
    navigate("/login");
  };

  const goToAdminUpload = () => {
    navigate("/admin/upload");
  };

  // ✅ Optimistic favourites toggle (with rollback) + keep drawer synced
  const handleToggleFavourite = async (poiId) => {
    const token = localStorage.getItem("eplq_token");
    if (!token) {
      setFavError("Please log in to use favourites.");
      return;
    }

    const wasFav = favourites.has(poiId);

    // ✅ optimistic update
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(poiId)) next.delete(poiId);
      else next.add(poiId);
      return next;
    });

    // ✅ keep drawer state synced
    setSelectedPoi((prev) => {
      if (!prev) return prev;
      const id = prev._id || prev.id;
      if (id !== poiId) return prev;
      return { ...prev, isFavourite: !wasFav };
    });

    setFavError("");
    setFavSuccess("");

    try {
      const res = await fetch(`${BASE_URL}/api/user/favourites/${poiId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        // rollback
        setFavourites((prev) => {
          const next = new Set(prev);
          if (next.has(poiId)) next.delete(poiId);
          else next.add(poiId);
          return next;
        });

        const data = await res.json().catch(() => ({}));
        setFavError(data.message || "Could not update favourites.");
      } else {
        // ✅ success feedback
        setFavSuccess(wasFav ? "Removed from favourites." : "Added to favourites.");
        setTimeout(() => setFavSuccess(""), 2000);
      }
    } catch (err) {
      // rollback
      setFavourites((prev) => {
        const next = new Set(prev);
        if (next.has(poiId)) next.delete(poiId);
        else next.add(poiId);
        return next;
      });

      setFavError("Network error while updating favourites.");
    }
  };

  // ✅ Simple front-end validation (Perplexity suggestion)
  const canSearch =
    lat !== "" &&
    lng !== "" &&
    !isNaN(parseFloat(lat)) &&
    !isNaN(parseFloat(lng)) &&
    radius > 0;

  const handleSearch = async (e) => {
    e.preventDefault();

    setHasSearched(true);
    setIsSearching(true);

    setStatus("Searching nearby POIs...");
    setSearchError("");
    setResults([]);
    setFavError("");
    setFavSuccess("");

    try {
      const token = localStorage.getItem("eplq_token");

      const res = await fetch(`${BASE_URL}/api/user/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          radiusKm: parseFloat(radius),
          category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.message || "Search failed. Please try again.");
        setStatus("Search failed.");
        return;
      }

      setSearchError("");

      const found = data.results || [];
      setResults(found);

      if (lat && lng) {
        setMapCenter([parseFloat(lat), parseFloat(lng)]);
      }

      // ✅ close drawer on new search
      setIsDrawerOpen(false);
      setSelectedPoi(null);

      if (found.length === 0) {
        setStatus(
          `No POIs found within ${data.query.radiusKm} km of (${data.query.latitude}, ${data.query.longitude}).`
        );
      } else {
        setStatus(
          `Found ${found.length} POIs within ${data.query.radiusKm} km of (${data.query.latitude}, ${data.query.longitude}).`
        );
      }
    } catch (err) {
      console.error(err);
      setSearchError(
        "Network error. Please check your connection and try again."
      );
      setStatus("Network error.");
    } finally {
      setIsSearching(false);
    }
  };

  // ✅ Use my location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(
        "Your browser does not support location. Please enter coordinates manually."
      );
      return;
    }

    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latVal = latitude.toFixed(6);
        const lngVal = longitude.toFixed(6);

        setLat(latVal);
        setLng(lngVal);

        const home = [parseFloat(latVal), parseFloat(lngVal)];
        setMapCenter(home);
        setHomeCenter(home);
      },
      () => {
        setGeoError(
          "Couldn’t access your location. Check permission settings or type coordinates manually."
        );
      }
    );
  };

  // ✅ sort by distance
  const sortedResults = [...results].sort((a, b) => a.distanceKm - b.distanceKm);

  // ✅ filter by text
  const filteredResults = sortedResults.filter((poi) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    const name = poi.name?.toLowerCase() || "";
    const desc = poi.description?.toLowerCase() || "";
    return name.includes(term) || desc.includes(term);
  });

  return (
    <div className="page">
      {/* ✅ Reusable header */}
      {/*  <Header user={{ role: "admin" }} /> */}

      {/* ✅ direct card */}
      <div className="card">
        <header className="card-header">
          <h2 className="card-title">EPLQ – Search Nearby POIs</h2>
          <p className="card-subtitle">
            Enter latitude, longitude, a search radius in kilometers, choose a
            category, and click Search to see nearby Points of Interest.
          </p>
        </header>

        <form onSubmit={handleSearch}>
          <div className="form-grid">
            <div className="form-field">
              <label className="label">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
                className="input"
                placeholder="e.g. 17.4000"
              />
            </div>

            <div className="form-field">
              <label className="label">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                required
                className="input"
                placeholder="e.g. 78.5000"
              />
            </div>

            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <button
                type="button"
                className="button secondary-button"
                onClick={handleUseCurrentLocation}
              >
                Use my location
              </button>

              {geoError && <p className="geo-error-text">{geoError}</p>}
            </div>

            <div className="form-field">
              <label className="label">Radius (km)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                required
                className="input"
                placeholder="e.g. 2"
              />
            </div>

            <div className="form-field">
              <label className="label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                <option value="all">All</option>
                <option value="hospital">Hospital</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="shopping">Shopping</option>
                <option value="hotel">Hotel</option>
                <option value="restaurant">Restaurant</option>
                <option value="education">Education</option>
                <option value="temple">Temple</option>
              </select>
            </div>
          </div>

          <div className="button-row">
            <button
              type="submit"
              className="button"
              disabled={isSearching || !canSearch}
            >
              {isSearching ? "Searching..." : "Search"}
            </button>

            <span className="status">{status}</span>
          </div>

          {searchError && <p className="status status-error">{searchError}</p>}

          {favError && (
            <p className="status" style={{ color: "red" }}>
              {favError}
            </p>
          )}

          {favSuccess && (
            <p className="status" style={{ color: "#047857" }}>
              {favSuccess}
            </p>
          )}
        </form>

        <div className="results-controls">
          <input
            className="input"
            style={{ maxWidth: "300px", marginBottom: "10px" }}
            placeholder="Filter results by name or description"
            value={searchTerm}
            disabled={isSearching}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ✅ Results */}
        <section className="results-section">
          <h3 className="results-heading">Results</h3>

          {/* ✅ Small UI polish */}
          <p className="results-info">
            Showing {filteredResults.length} places within {radius} km.
          </p>

          {isSearching ? (
            <p className="results-empty">Searching nearby POIs…</p>
          ) : !hasSearched ? (
            <p className="results-empty">No places yet. Try searching above.</p>
          ) : filteredResults.length === 0 ? (
            <div className="results-empty-block">
              <h4>No places found here</h4>
              <p>
                Try increasing the radius, changing the category, or moving the
                map center.
              </p>
            </div>
          ) : (
            <div className="results-wrapper">
              {filteredResults.map((poi) => {
                const poiId = poi._id || poi.id;
                const isFav = favourites.has(poiId);

                return (
                  <PoiCard
                    key={poiId}
                    poi={poi}
                    isFavourite={isFav}
                    onToggleFavourite={handleToggleFavourite}
                    onClick={() => handleResultClick(poi)} // ✅ opens drawer
                    showViewDetails={false} // ✅ important (no View details on Search page)
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* ✅ Map integration */}
        {filteredResults.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <div className="map-header">
              <h3>Map view</h3>

              <button
                type="button"
                className="reset-map-button"
                onClick={() => {
                  if (!homeCenter) return;
                  const [homeLat, homeLng] = homeCenter;

                  setLat(homeLat.toFixed(6));
                  setLng(homeLng.toFixed(6));
                  setMapCenter([homeLat, homeLng]);
                }}
              >
                Reset map
              </button>
            </div>

            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{
                height: "400px",
                width: "100%",
                borderRadius: "16px",
              }}
            >
              <ChangeMapCenter center={mapCenter} />

              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {filteredResults.map((poi) => {
                const poiId = poi._id || poi.id;

                return (
                  <Marker
                    key={poiId}
                    position={[poi.latitude, poi.longitude]}
                    eventHandlers={{
                      click: () => navigate(`/poi/${poiId}`),
                    }}
                  >
                    <Popup>
                      <b>{poi.name}</b>
                      <br />
                      {poi.category}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        )}

        <section className="about">
          <h3 className="about-title">About EPLQ</h3>
          <p className="about-text">
            EPLQ (Efficient Privacy-preserving Location-based Query) lets users
            search for nearby Points of Interest within a chosen radius, while
            write operations are restricted to authenticated admins to keep data
            secure.
          </p>
        </section>
      </div>

      {/* ✅ Bottom drawer */}
      {isDrawerOpen && selectedPoi && (
        <div
          className="poi-drawer-overlay"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div className="poi-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="poi-drawer-header">
              <span className="poi-drawer-handle" />
            </div>

            <div className="poi-drawer-body">
              <button
                type="button"
                className="poi-drawer-close"
                onClick={() => setIsDrawerOpen(false)}
              >
                ×
              </button>

              <h3 className="poi-drawer-title">{selectedPoi.name}</h3>

              <p className="poi-drawer-sub">
                {selectedPoi.category || "Other"} ·{" "}
                {selectedPoi.distanceKm?.toFixed(1)} km away
              </p>

              {selectedPoi.description && (
                <p className="poi-drawer-desc">{selectedPoi.description}</p>
              )}

              <div className="poi-drawer-buttons">
                <button
                  type="button"
                  className="poi-primary-btn"
                  onClick={() => {
                    setLat(Number(selectedPoi.latitude).toFixed(6));
                    setLng(Number(selectedPoi.longitude).toFixed(6));
                    setMapCenter([selectedPoi.latitude, selectedPoi.longitude]);
                  }}
                >
                  Focus on map
                </button>

                <button
                  type="button"
                  className="poi-secondary-btn"
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps?q=${selectedPoi.latitude},${selectedPoi.longitude}`,
                      "_blank"
                    );
                  }}
                >
                  Open in Google Maps
                </button>
              </div>

              <button
                type="button"
                className="poi-primary-btn"
                style={{ marginTop: "0.8rem" }}
                onClick={() => {
                  const poiId = selectedPoi._id || selectedPoi.id;
                  handleToggleFavourite(poiId);
                }}
              >
                {favourites.has(selectedPoi._id || selectedPoi.id)
                  ? "Remove from favourites"
                  : "Add to favourites"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
