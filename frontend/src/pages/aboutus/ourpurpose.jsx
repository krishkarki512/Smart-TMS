import React from "react";
import "../../pagescss/ourpurpose.css";
import bali from "../../assets/bali.jpg";
import img2 from "../../assets/img2.jpg";

export default function OurPurpose() {
  return (
    <div className="op-section" id="purpose">
      <div className="op-header">
        <h2 className="op-title">Our purpose</h2>
        <div className="op-underline" />
      </div>

      {/* First Row: Text Left, Image Right */}
      <div className="op-row op-reverse">
        <div className="op-text-block">
          <h3 className="op-subheading">
            Challenging Perceptions, Creating Meaningful Connections
          </h3>
          <p>
            Goldenleaf Travel Agency is built on the belief that travel, when done thoughtfully and sustainably,
            has the power to bridge cultures, challenge misconceptions, and create meaningful human connections.
          </p>
          <p>
            We specialize in immersive experiences designed not only to inspire our travelers,
            but also to benefit the communities and landscapes we explore. Our team’s first-hand knowledge,
            local partnerships, and deep respect for the places we visit allow us to craft journeys that go far beyond the ordinary.
          </p>
          <p>
            Whether it’s a remote mountain village or a bustling, misunderstood capital,
            Goldenleaf takes you to the heart of a place — often beyond the tourist trail — to uncover its true spirit.
            We’ve proudly brought responsible tourism to areas that are often overlooked or misrepresented,
            helping to rewrite narratives with every itinerary we design.
          </p>
        </div>
        <div className="op-img-block">
          <img src={bali} alt="Terraced Fields" />
        </div>
      </div>

      {/* Second Row: Image Left, Text Right */}
      <div className="op-row">
        <div className="op-img-block">
          <img src={img2} alt="Cultural Dance" />
        </div>
        <div className="op-text-block">
          <p>
            In fact, we often hear travelers say, “I was surprised” — by the landscapes,
            the richness of culture, the quality of accommodations and cuisine, and most of all,
            by the warmth and generosity of the people. Much of what they expected from news or stereotypes fades away
            as they experience these places for themselves.
          </p>
          <p>
            As our Senior Travel Consultant Maya says:
            <br />
            <em>
              “Some of the countries we offer may raise an eyebrow at first, but our guests always return amazed —
              not just by what they saw, but by how welcomed they felt. It’s in these moments that travel becomes truly transformative.”
            </em>
          </p>
          <p>
            At Goldenleaf, we don’t just plan trips — we create journeys that change perspectives and forge lasting memories.
          </p>
        </div>
      </div>
    </div>
  );
}
