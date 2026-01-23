import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "./config";


//const BASE_URL = "https://eplq-backend.onrender.com";

function PoiDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poi, setPoi] = useState(null);
  const [status, setStatus] = useState("Loading...");

  // ✅ favourites UI state
  const [isFav, setIsFav] = useState(false);
  const [favError, setFavError] = useState("");

  // ✅ 1) Fetch POI details
  useEffect(() => {
    const fetchPoi = async () => {
      const token = localStorage.getItem("eplq_token");
      if (!token) {
        setStatus("You must be logged in to view POI details.");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/admin/pois/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.poi) {
          setStatus(data.message || "POI not found.");
          return;
        }

        setPoi(data.poi);
        setStatus("");
      } catch (err) {
        console.error(err);
        setStatus("Failed to load POI.");
      }
    };

    fetchPoi();
  }, [id]);

  // ✅ 2) After POI loads -> fetch favourites list and sync initial star state
  useEffect(() => {
    const syncFavouriteState = async () => {
      const token = localStorage.getItem("eplq_token");
      if (!token || !poi?._id) return;

      try {
        const res = await fetch(`${BASE_URL}/api/user/favourites`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;

        // ✅ FIX: use _id OR id
        const favIds = (data.results || []).map((p) => p._id || p.id);

        setIsFav(favIds.includes(poi._id));
      } catch (err) {
        console.error("Sync favourites error:", err);
      }
    };

    syncFavouriteState();
  }, [poi]);

  // ✅ open in maps handler
  const handleOpenInMaps = () => {
    if (!poi?.latitude || !poi?.longitude) return;

    window.open(
      `https://www.google.com/maps?q=${poi.latitude},${poi.longitude}`,
      "_blank"
    );
  };

  // ✅ 3) Optimistic favourite toggle (same backend as Search page)
  const handleToggleFavourite = async () => {
    const token = localStorage.getItem("eplq_token");
    if (!token) {
      setFavError("Please log in to use favourites.");
      return;
    }

    if (!poi?._id) return;

    // optimistic update
    setIsFav((prev) => !prev);
    setFavError("");

    try {
      const res = await fetch(`${BASE_URL}/api/user/favourites/${poi._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        // rollback
        setIsFav((prev) => !prev);

        const data = await res.json().catch(() => ({}));
        setFavError(data.message || "Could not update favourites.");
      }
    } catch (err) {
      // rollback
      setIsFav((prev) => !prev);
      setFavError("Network error while updating favourites.");
    }
  };

  // ✅ Loading / error screen
  if (status && !poi) {
    return (
      <div className="page">
        <div className="card">
          <p>{status}</p>
          <button
            className="button secondary-button"
            type="button"
            onClick={() => navigate(-1)}
          >
            ← Back to search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        {/* ✅ Buttons row */}
        <div className="poi-details-actions">
          <button
            type="button"
            className="button secondary-button back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back to search
          </button>

          <button
            type="button"
            className="button secondary-button maps-btn"
            onClick={handleOpenInMaps}
          >
            Open in Google Maps
          </button>

          <button
            type="button"
            className="button secondary-button fav-btn"
            onClick={handleToggleFavourite}
          >
            {isFav ? "★ Favourited" : "☆ Add to favourites"}
          </button>
        </div>

        {/* ✅ error line */}
        {favError && (
          <p className="status" style={{ color: "red" }}>
            {favError}
          </p>
        )}

        <h2 className="card-title">{poi.name}</h2>

        <p>
          <b>Category:</b> {poi.category}
        </p>

        <p>{poi.description || "No description provided."}</p>

        <p>
          <b>Location:</b> {poi.latitude}, {poi.longitude}
        </p>
      </div>
    </div>
  );
}

export default PoiDetails;
