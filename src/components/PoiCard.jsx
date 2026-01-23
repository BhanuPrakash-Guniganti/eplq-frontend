// src/components/PoiCard.jsx
function PoiCard({
  poi,
  isFavourite,
  showViewDetails = false,
  onClick,
  onToggleFavourite,
  onViewDetails,
}) {
  const poiId = poi._id || poi.id;

  return (
    <div className="poi-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="result-title-row">
        <div>
          {/* ✅ NEW: Name + Heart in same row */}
          <div className="poi-title-row">
            <h3 className="poi-name">{poi.name}</h3>

            {onToggleFavourite && (
              <button
                type="button"
                className={`fav-toggle ${isFavourite ? "is-fav" : ""}`}
                onClick={(e) => {
                  e.stopPropagation(); // ✅ prevents drawer open
                  onToggleFavourite(poiId);
                }}
              >
                {isFavourite ? "♥" : "♡"}
              </button>
            )}
          </div>

          {/* ✅ meta row */}
          <div className="result-meta-row">
            {poi.category && (
              <span className="result-category-chip">{poi.category}</span>
            )}

            {typeof poi.distanceKm === "number" && (
              <span className="result-distance">
                {poi.distanceKm.toFixed(1)} km away
              </span>
            )}
          </div>
        </div>

        {/* ✅ Keep this area ONLY for favourites page buttons */}
        <div className="poi-actions">
          {showViewDetails && onViewDetails && (
            <button
              type="button"
              className="button secondary-button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(poiId);
              }}
            >
              View details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PoiCard;
