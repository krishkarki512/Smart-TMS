import React from "react";
import trips from "../data/trip";
import "../styles/trip.css";

export default function TripStyles() {
  return (
    <section className="tripstyles-section">
      <h2 className="tripstyles-title">Trip Styles</h2>
      <div className="underline" />
      <p className="tripstyles-description">
        Whatever your passion, we have a journey tailored to your interests. Each trip style offers a unique way to experience the world.
      </p>

      <div className="tripstyles-grid">
        {trips.map((trip) => (
          <div key={trip.id} className="tripstyles-card">
            <img src={trip.image} alt={trip.title} className="tripstyles-img" />
            <div className="tripstyles-fade" />
            <h3 className="tripstyles-card-title">{trip.title}</h3>
            <p className="tripstyles-card-description">{trip.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
