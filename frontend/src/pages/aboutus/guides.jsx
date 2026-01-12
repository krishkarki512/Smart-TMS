import React from "react";
import img2 from "../../assets/img2.jpg"; // Replace path as per your project
import "../../pagescss/guides.css";

const GuideCard = () => (
  <div className="guide-card">
    <img src={img2} alt="Pasang From Nepal" className="guide-img" />
    <div className="guide-content">
      <h3>Pasang From Nepal</h3>
      <p>
        "What I love most about Intrepid is the family-like environment. I love
        to teach travellers simple Vietnamese phrases with a smile to help them
        connect with locals, we stick together as a group—like a 'sticky rice
        family.'"
      </p>
    </div>
  </div>
);

export default function Guides() {
  return (
    <section className="guides-section">
      <h2 className="guides-title">Meet our Guides</h2>
      <p className="guides-description">
        Our seasoned guides are storytellers, culture‑sharers and safety gurus.
        They bring destinations to life while ensuring you travel responsibly.
      </p>

      <div className="guide-grid">
        <GuideCard />
        <GuideCard />
        <GuideCard />
      </div>
    </section>
  );
}
