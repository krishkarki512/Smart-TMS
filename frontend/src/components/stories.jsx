import React, { useState, useEffect } from "react";
import "../styles/stories.css";
import axiosInstance from "../utils/axiosInstance";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function Stories() {
  const { t } = useTranslation();
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    axiosInstance.get("/blogs/stories/")
      .then((res) => {
        setStories(res.data.results); // <-- extract results array here
      })
      .catch((err) => console.error("Failed to fetch stories", err));
  }, []);

  if (stories.length === 0) {
    return (
      <section className="story-section">
        <h2 className="story-title">{t("real_stories")}</h2>
        <div className="underline" />
        <p className="story-subtitle">{t("hear_from_travelers")}</p>
        <p>{t("no_stories")}</p>
      </section>
    );
  }

  const nextStory = () => {
    setCurrentIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1));
  };

  const prevStory = () => {
    setCurrentIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
  };

  const currentStory = stories[currentIndex] || {};
  const { name, location, message, photo } = currentStory;

  return (
    <section className="story-section">
      <h2 className="story-title">{t("real_stories")}</h2>
      <div className="underline gold" />
      <p className="story-subtitle">{t("hear_from_travelers")}</p>

      <div className="story-slider">
        <button onClick={prevStory} className="arrow-btn circle">
          <FaChevronLeft />
        </button>

        <div className="story-card">
          <div className="stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <FaStar key={i} color="#ddb148" />
            ))}
          </div>
          <p className="story-message">“{message}”</p>
          <div className="story-user">
            <img
              src={
                photo && photo.startsWith("http")
                  ? photo
                  : `${import.meta.env.VITE_API_BASE_URL}${photo}`
              }
              alt={name}
              className="story-photo"
            />
            <div>
              <h4 className="story-name">{name}</h4>
              <span className="story-location">{location}</span>
            </div>
          </div>
        </div>

        <button onClick={nextStory} className="arrow-btn circle">
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
}
