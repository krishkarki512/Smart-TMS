import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import "../styles/aboutUs.css";
import OurPurpose from "./aboutus/ourpurpose";
import OurStory from "./aboutus/ourstory";
import Why from "./aboutus/why";
import Guides from "./aboutus/guides";
import GoodTimes from "./aboutus/goodtimes"; 
import Foot from "../pages/foot";

import heroImg from "../assets/bali.jpg";

export default function AboutUs() {
  const handleClick = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // optional scroll tracking logic here if needed in future
    const handleScroll = () => {};
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="about-container">
      {/* ── breadcrumb ───────────────────── */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link> <span className="arrow">›</span> <span>About us</span>
      </nav>

      {/* ── hero section ─────────────────── */}
      <div className="about-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="hero-text">
          <h1 className="hero-heading">About Golden Leaf Travels</h1>
          <p className="hero-subtitle">Small group tours</p>
        </div>
      </div>

      {/* ── top-tabs navigation ──────────── */}
      <nav className="top-tabs">
        <ul>
          {[
            ["purpose", "Our purpose"],
            ["story", "Our Story"],
            ["why", "Why Golden Leaf"],
            ["guides", "Our Team"],
          ].map(([id, label]) => (
            <li key={id}>
              <button className="tab-button" onClick={() => handleClick(id)}>
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Description paragraph ─────────── */}
      <div className="tabs-description">
        <p>
          Wild Frontiers is an award-winning adventure travel company, founded in 1998 by travel writer Jonny Bealby.
          We specialise in stylish and original small group tours and tailor-made holidays worldwide.
          <br /><br />
          We are firm believers that travelling is all about the experience and it’s in the details – the places you stay,
          the transport and route that gets you there, and the people you meet along the way – that make the trip;
          we therefore specialise in drawing on our own extensive local knowledge and array of contacts
          to give our clients the very best experience possible.
        </p>
      </div>

      {/* ── Connected sections ────────────── */}
      <section id="purpose"><OurPurpose /></section>
      <section id="story"><OurStory /></section>
      <section id="why"><Why /></section>
      <section id="guides"><Guides /></section>
      <section id="good-times"><GoodTimes /></section>
      <section id="foot"><Foot /></section>
    </div>
  );
}
