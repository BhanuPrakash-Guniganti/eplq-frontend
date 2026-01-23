import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PoiCard from "../components/PoiCard";
import { BASE_URL } from "../config";


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

// ✅ Helper component to recenter + zoom map whenever state changes
function RecenterMap({ center, zoom }) {
  const map = useMap();
  map.flyTo(center, zoom);
  return null;
}

function Favourites() {
  console.log("Favourites page mounted"); // ✅ debug

  const navigate = useNavigate();

  const defaultCenter = [17.385, 78.4867];

  const [results, setResults] = useState([]);

  // ✅ loading + error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ favourites search state
  const [favSearchTerm, setFavSearchTerm] = useState("");

  // ✅ selected favourite & map state
  const [selectedFav, setSelectedFav] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(13);

  // ✅ filtered list (search favourites)
  const filteredFavs = useMemo(() => {
    const term = favSearchTerm.trim().toLowerCase();
    if (!term) return results;

    return results.filter((poi) => {
      const name = poi.name?.toLowerCase() || "";
      const desc = poi.description?.toLowerCase() || "";
      return name.includes(term) || desc.includes(term);
    });
  }, [favSearchTerm, results]);

  // ✅ prevent Leaflet crash: only POIs with valid coordinates
  const safeFavs = useMemo(() => {
    return filteredFavs.filter((p) => {
      const lat = Number(p.latitude);
      const lng = Number(p.longitude);
      return Number.isFinite(lat) && Number.isFinite(lng);
    });
  }, [filteredFavs]);

  // ✅ function to fetch favourites
  const fetchFavourites = async () => {
    try {
      setIsLoading(true);
      setError("");

      const token = localStorage.getItem("eplq_token");
      if (!token) {
        setResults([]);
        setSelectedFav(null);
        setMapCenter(defaultCenter);
        setMapZoom(13);
        setError("Please log in to see your favourites.");
        return;
      }

      const res = await fetch(`${BASE_URL}/api/user/favourites`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setResults([]);
        setError(data.message || "Failed to load favourites.");
        return;
      }

      const favs = data.results || [];
      setResults(favs);
      setFavSearchTerm("");

      // ✅ choose first valid favourite for map focus
      const firstValid = favs.find((p) => {
        const lat = Number(p.latitude);
        const lng = Number(p.longitude);
        return Number.isFinite(lat) && Number.isFinite(lng);
      });

      if (firstValid) {
        setSelectedFav(firstValid);
        setMapCenter([Number(firstValid.latitude), Number(firstValid.longitude)]);
        setMapZoom(13);
      } else {
        setSelectedFav(null);
        setMapCenter(defaultCenter);
        setMapZoom(13);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ If filter hides selected, focus first visible
  useEffect(() => {
    if (!favSearchTerm) return;
    if (filteredFavs.length === 0) return;

    if (!selectedFav) {
      const first = filteredFavs[0];
      if (first?.latitude == null || first?.longitude == null) return;

      setSelectedFav(first);
      setMapCenter([Number(first.latitude), Number(first.longitude)]);
      setMapZoom(15);
      return;
    }

    const selectedId = selectedFav._id || selectedFav.id;
    const stillVisible = filteredFavs.some(
      (p) => (p._id || p.id) === selectedId
    );

    if (!stillVisible) {
      const first = filteredFavs[0];
      if (first?.latitude == null || first?.longitude == null) return;

      setSelectedFav(first);
      setMapCenter([Number(first.latitude), Number(first.longitude)]);
      setMapZoom(15);
    }
  }, [favSearchTerm, filteredFavs, selectedFav]);

  // ✅ Remove from favourites (Optimistic)
  const handleToggleFavourite = async (poiId) => {
    const token = localStorage.getItem("eplq_token");
    if (!token) {
      setError("Please log in to manage favourites.");
      return;
    }

    setResults((prev) => {
      const updated = prev.filter((p) => (p._id || p.id) !== poiId);

      setSelectedFav((prevSelected) => {
        if (!prevSelected) return prevSelected;

        const selectedId = prevSelected._id || prevSelected.id;

        if (selectedId !== poiId) return prevSelected;

        const nextValid = updated.find((p) => {
          const lat = Number(p.latitude);
          const lng = Number(p.longitude);
          return Number.isFinite(lat) && Number.isFinite(lng);
        });

        if (nextValid) {
          setMapCenter([Number(nextValid.latitude), Number(nextValid.longitude)]);
          setMapZoom(15);
          return nextValid;
        }

        setMapCenter(defaultCenter);
        setMapZoom(13);
        return null;
      });

      return updated;
    });

    try {
      const res = await fetch(`${BASE_URL}/api/user/favourites/${poiId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        await fetchFavourites();
      }
    } catch (err) {
      console.error(err);
      await fetchFavourites();
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">
          My Favourite POIs
          {results.length > 0 && (
            <span className="fav-count"> ({results.length} saved)</span>
          )}
        </h2>

        {/* ✅ Loading */}
        {isLoading && <p className="status">Loading favourites…</p>}

        {/* ✅ Error */}
        {!isLoading && error && (
          <p className="status" style={{ color: "red" }}>
            {error}
          </p>
        )}

        {/* ✅ Empty state */}
        {!isLoading && !error && results.length === 0 && (
          <div className="no-results" style={{ padding: "1.5rem 0" }}>
            <h3 style={{ marginBottom: "0.4rem" }}>
              You have no favourites yet.
            </h3>
            <p style={{ marginBottom: "1rem", color: "#6b7280" }}>
              Start searching and then tap the heart to add favourites — places
              you want to revisit.
            </p>

            <button
              type="button"
              className="button secondary-button"
              style={{ width: "auto", padding: "10px 22px" }}
              onClick={() => navigate("/search")}
            >
              Go to search
            </button>
          </div>
        )}

        {/* ✅ Search bar */}
        {!isLoading && !error && results.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "0.6rem",
              alignItems: "center",
              marginTop: "1rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            <input
              className="input"
              placeholder="Search your favourites by name or description"
              value={favSearchTerm}
              onChange={(e) => setFavSearchTerm(e.target.value)}
              style={{ maxWidth: "360px" }}
            />

            {favSearchTerm && (
              <button
                type="button"
                className="button secondary-button"
                style={{ width: "auto", padding: "9px 18px" }}
                onClick={() => setFavSearchTerm("")}
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* ✅ Filter result empty */}
        {!isLoading &&
          !error &&
          results.length > 0 &&
          filteredFavs.length === 0 && (
            <p className="results-empty">
              No favourites match your search. Try a different name or clear the
              filter.
            </p>
          )}

        {/* ✅ Main content */}
        {!isLoading && !error && filteredFavs.length > 0 && (
          <>
            <div className="results-wrapper">
              {filteredFavs.map((poi) => {
                const poiId = poi._id || poi.id;
                const selectedId = selectedFav
                  ? selectedFav._id || selectedFav.id
                  : null;

                return (
                  <PoiCard
                    key={poiId}
                    poi={poi}
                    isFavourite={true}
                    variant="favourites"
                    showViewDetails={true}
                    isActive={selectedId === poiId}
                    onClick={() => {
                      // ✅ guard against missing coords
                      if (poi.latitude == null || poi.longitude == null) return;

                      setSelectedFav(poi);
                      setMapCenter([Number(poi.latitude), Number(poi.longitude)]);
                      setMapZoom(15);
                    }}
                    onViewDetails={(id) => navigate(`/poi/${id}`)}
                    onToggleFavourite={handleToggleFavourite}
                  />
                );
              })}
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <div className="map-header">
                <h3>Map view</h3>

                <button
                  type="button"
                  className="reset-map-button"
                  onClick={() => {
                    if (!selectedFav) return;
                    if (
                      selectedFav.latitude == null ||
                      selectedFav.longitude == null
                    )
                      return;

                    setMapCenter([
                      Number(selectedFav.latitude),
                      Number(selectedFav.longitude),
                    ]);
                    setMapZoom(15);
                  }}
                >
                  Reset map
                </button>
              </div>

              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{
                  height: "400px",
                  width: "100%",
                  borderRadius: "16px",
                }}
              >
                <RecenterMap center={mapCenter} zoom={mapZoom} />

                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />

                {/* ✅ Use safeFavs so Leaflet never crashes */}
                {safeFavs.map((poi) => {
                  const poiId = poi._id || poi.id;

                  return (
                    <Marker
                      key={poiId}
                      position={[Number(poi.latitude), Number(poi.longitude)]}
                      eventHandlers={{
                        click: () => {
                          setSelectedFav(poi);
                          setMapCenter([
                            Number(poi.latitude),
                            Number(poi.longitude),
                          ]);
                          setMapZoom(15);
                        },
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
          </>
        )}
      </div>
    </div>
  );
}

export default Favourites;
