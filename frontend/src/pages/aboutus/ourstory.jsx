import React from "react";
import "../../pagescss/ourstory.css";
import monkImage from "../../assets/img2.jpg"; 

export default function OurStory() {
  return (
    <section className="our-story-section">
      <div className="our-story-title">
        <h2>Our Story</h2>
        <div className="underline" />
      </div>

      <div className="our-story-content">
        <div className="image-side">
          <img src={monkImage} alt="Young monk" />
        </div>
        <div className="text-side"> 
          <p>
            In 2014, a curious traveler set off across the Himalayan borderlands of Nepal and
            Northern India — not seeking luxury, but meaning. With little more than a backpack and a
            desire to understand the world more deeply, they wandered beyond the tourist trails,
            into mountain villages, busy bazaars, and quiet homes where stories lived in every smile
            and shared meal.
          </p>
          <p>
            What began as a personal adventure quickly transformed into something more. The
            hospitality, resilience, and warmth found in these remote corners revealed a deeper
            truth: that the most impactful journeys aren’t about seeing more, but about connecting
            more.
          </p>
          <p>
            One evening, in a small village near the Annapurna range, while sharing dal bhat and
            laughter with a host family, the idea for Goldenleaf Travel quietly took root. Why
            weren’t more people experiencing this side of travel? And how could tourism be reshaped
            to benefit not just the traveler, but also the communities who make each journey
            unforgettable?
          </p>

          <button className="read-more-btn">Read More About Our Journey</button>
        </div>
      </div>
    </section>
  );
}
