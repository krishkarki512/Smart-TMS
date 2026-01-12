import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../pagescss/places.css";

// Fix Leaflet marker icons (important!)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Places({ data }) {
  const places = data?.places || []; // <-- get places from data prop safely

  // Map coordinates setup (optional, your existing code)
  const locationName = data?.city
    ? `${data.city}, ${data.country.name}`
    : data?.country?.name;

  const [coordinates, setCoordinates] = useState([0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = data?.city
      ? `${data.city}, ${data.country.name}`
      : data?.country?.name;

    if (!query) {
      setLoading(false);
      return;
    }

    const fetchCoordinates = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=1`;

        const response = await fetch(url);
        const jsonData = await response.json();

        if (jsonData && jsonData.length > 0) {
          setCoordinates([parseFloat(jsonData[0].lat), parseFloat(jsonData[0].lon)]);
        } else {
          setCoordinates([0, 0]);
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
        setCoordinates([0, 0]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [data?.city, data?.country]);

  const zoom = data?.map_zoom || 5;

  return (
    <>
      <section className="places-section">
        <h2 className="places-title">Places You’ll See</h2>
        <div className="places-cards">
          {places.length === 0 && <p>No places available.</p>}
          {places.map((place) => (
            <div className="place-card" key={place.id}>
              <img src={place.image} alt={place.name} />
              <div className="place-info">
                <h4>{place.name}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="map-section">
          {loading ? (
            <p>Loading map...</p>
          ) : (
            <MapContainer
              center={coordinates}
              zoom={zoom}
              style={{ height: "450px", borderRadius: "16px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker position={coordinates}>
                <Popup>{locationName}</Popup>
              </Marker>
            </MapContainer>
          )}
          <button className="view-destinations-btn">📍 View Destinations</button>
        </div>
      </section>

    <div className="overview-full-width">
      <div className="overview-section">
        <h2 className="overview-title">Overview</h2>
        <h3 className="overview-subtitle">
          {data.subtitle || `Discover the unique charm and beauty of ${data.title}`}
        </h3>
        <p className="overview-description">
          {data.description || "No description available for this travel deal."}
        </p>
      </div>
    </div>
    </>
  );
}
