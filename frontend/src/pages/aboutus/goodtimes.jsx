import React from "react";
import img1 from "../../assets/bali.jpg";
import img2 from "../../assets/bali.jpg";
import img3 from "../../assets/img2.jpg";
import "../../pagescss/goodtimes.css";

const Card = ({ image, title, country }) => (
  <div className="good-card">
    <div className="good-img-wrapper">
      <img src={image} alt={title} className="good-img" />
      <div className="good-overlay">
        <h4>{title}</h4>
        <p>{country}</p>
        <a href="#">Explore &gt;</a>
      </div>
    </div>
    <div className="good-body">
      <p className="good-label">Good Trips</p>
      <h3 className="good-text">
        Where to go in 2025 for sund lovers – a month-by-month guide
      </h3>
    </div>
  </div>
);

export default function GoodTimes() {
  return (
    <section className="good-section">
      <h2 className="good-title">Get inspired on the Good Times</h2>
      <div className="good-grid">
        <Card image={img1} title="Kyoto" country="Japan" />
        <Card image={img2} title="Kyoto" country="Japan" />
        <Card image={img3} title="Kyoto" country="Japan" />
      </div>
    </section>
  );
}
