// src/components/destinations/VideoSection.jsx
import React from "react";
import homevid1 from "../../assets/homevid1.mp4";
import "../../pagescss/video.css";

export default function VideoSection({ videoUrl, country }) {
  const videoSrc = videoUrl || homevid1;

  return (
    <div id="video" className="section-block video-section">
      <h2 className="video-title">Watch Travel Video</h2>
      <div className="underline gold" />
      <p className="video-description">
        Experience the beauty and culture of <strong>{country}</strong> in motion! Our travel video gives you a glimpse into what makes this destination unforgettable.
      </p>
      <div className="video-wrapper">
        <video src={videoSrc} controls className="responsive-video" />
      </div>
    </div>
  );
}
