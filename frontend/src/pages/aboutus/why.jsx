import React from "react";
import img from "../../assets/bali.jpg"; // Replace with your actual image path
import "../../pagescss/why.css";

const Card = () => (
  <div className="why-card">
    <img src={img} alt="Vietnam Street" className="why-img" />
    <div className="why-content">
      <h3>Immersive experiences</h3>
      <p>
        We’re for hard-to-forget experiences in hard-to-find places. We love the
        highlights, but the real magic for us happens well away from the beaten
        path. It’s the little noodle bars, hidden galleries and backstreet
        bodegas; the real life experiences you won’t find in a search engine.
      </p>
    </div>
  </div>
);

export default function WhyGoldenLeaf() {
  return (
    <section className="why-section">
      <h2 className="why-title">Why Golden Leaf?</h2>
      <div className="why-grid">
        <Card />
        <Card />
        <Card />
        <Card />
      </div>
    </section>
  );
}
