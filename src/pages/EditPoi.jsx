import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Search.css"; // reuse styles

function EditPoi() {
  const { id } = useParams();
  const navigate = useNavigate();

  console.log("EditPoi mounted, id =", id);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("hospital");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("eplq_token");

    fetch(`http://localhost:5100/api/admin/pois/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          setStatus(data.message || "Failed to load POI.");
          setLoading(false);
          return null;
        }

        return data;
      })
      .then((data) => {
        if (!data) return;

        console.log("Fetched data for edit:", data);
        const poi = data.poi;

        if (!poi) {
          setStatus("POI not found.");
          setLoading(false);
          return;
        }

        setName(poi.name || "");
        setCategory(poi.category || "hospital");
        setLat(poi.latitude ?? "");
        setLng(poi.longitude ?? "");
        setDescription(poi.description || "");
        setStatus("");
        setLoading(false);
      })
      .catch(() => {
        setStatus("Failed to load POI.");
        setLoading(false);
      });
  }, [id]);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required.";
    }

    const latNum = parseFloat(lat);
    if (Number.isNaN(latNum)) {
      newErrors.lat = "Latitude must be a number.";
    } else if (latNum < -90 || latNum > 90) {
      newErrors.lat = "Latitude must be between -90 and 90.";
    }

    const lngNum = parseFloat(lng);
    if (Number.isNaN(lngNum)) {
      newErrors.lng = "Longitude must be a number.";
    } else if (lngNum < -180 || lngNum > 180) {
      newErrors.lng = "Longitude must be between -180 and 180.";
    }

    if (description.length > 500) {
      newErrors.description = "Description must be at most 500 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      setStatus("Please fix the errors above.");
      return;
    }

    setStatus("Saving...");

    try {
      const token = localStorage.getItem("eplq_token");
      if (!token) {
        setStatus("No admin token. Please log in again.");
        return;
      }

      const res = await fetch(`http://localhost:5100/api/admin/pois/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
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
        setStatus(data.message || "Update failed.");
        return;
      }

      setStatus("POI updated successfully.");
      setTimeout(() => navigate("/admin/upload"), 800);
    } catch (err) {
      console.error(err);
      setStatus("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p>{status}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">Edit POI</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label className="label">Name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            <div className="form-field">
              <label className="label">Category</label>
              <select
                className="input"
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

            <div className="form-field">
              <label className="label">Latitude</label>
              <input
                type="number"
                step="0.0001"
                className="input"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
              />
              {errors.lat && <p className="error-text">{errors.lat}</p>}
            </div>

            <div className="form-field">
              <label className="label">Longitude</label>
              <input
                type="number"
                step="0.0001"
                className="input"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                required
              />
              {errors.lng && <p className="error-text">{errors.lng}</p>}
            </div>

            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label className="label">Description</label>
              <textarea
                className="input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && (
                <p className="error-text">{errors.description}</p>
              )}
            </div>
          </div>

         <div className="button-row">
  <button type="submit" className="button">
    Save changes
  </button>

  <button
    type="button"
    className="button secondary-button"
    onClick={() => navigate("/admin/upload")}
  >
    Cancel
  </button>

  <span className="status">{status}</span>
</div>


        </form>
      </div>
    </div>
  );
}

export default EditPoi;
