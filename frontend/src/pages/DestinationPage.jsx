import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import "../pagescss/destination.css";

// Section components (import your own implementations)
import OverviewSection from "./destinations/OverviewSection";
import DealsSection from "./destinations/DealsSection";
import TripReviewsSection from "./destinations/TripReviewsSection";
import ArticlesSection from "./destinations/ArticlesSection";
import FaqsSection from "./destinations/FaqsSection";
import VideoSection from "./destinations/VideoSection";
import Foot from "../pages/foot";

import CurrencyConverterInline from "./destinations/CurrencyConverterInline";

export default function DestinationPage() {
  const { country } = useParams(); // slug from URL
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Fetch country data (including currency_code)
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/destinations/countries/${country}/`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
      });
  }, [country]);

  // Fetch user profile (for nationality)
  useEffect(() => {
    axiosInstance
      .get("/accounts/profile/")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  if (loading) {
    return <div className="destination-wrapper">Loading...</div>;
  }

  if (!data) {
    return (
      <div className="destination-wrapper">
        <div className="destination-content">
          <h2>Destination Not Found</h2>
          <p>Sorry, this destination is not in our records.</p>
          <Link to="/" className="back-home">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ISO Codes & Currency
  const nationalityCode = user?.nationality || "NP"; // fallback nationality code
  const destinationCode = data.code || country.toUpperCase().slice(0, 2);
  const destinationCurrency = data.currency_code || "USD";

  // Article categorization
  const inspirationalArticles = data.articles?.filter((a) => a.is_inspirational) || [];
  const suggestedArticles = data.articles?.filter((a) => a.is_suggested) || [];
  const regularArticles = data.articles?.filter((a) => !a.is_inspirational && !a.is_suggested) || [];

  return (
    <div className="destination-wrapper">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link> &gt;{" "}
        <Link to="/alldestinations">Destinations</Link> &gt;{" "}
        <span>{data.name}</span>
      </nav>

      {/* Hero */}
      <div className="hero-section" style={{ backgroundImage: `url(${data.image})` }}>
        <div className="hero-text">
          <h1>{data.name}</h1>
          <h3>{data.subtitle}</h3>
        </div>
      </div>

      {/* Currency Converter */}
      <div
        className="tools-wrapper"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          justifyContent: "center",
          backgroundColor: "#f5f7fa",
          padding: "2rem",
          borderBottom: "1px solid #ddd",
        }}
      >
        {/* Show conversion only if destination currency is known */}
        {destinationCurrency && destinationCurrency !== "USD" ? (
          <CurrencyConverterInline fromCurrency={destinationCurrency} toCurrency="USD" />
        ) : (
          <p style={{ color: "#555" }}>
            Currency is USD or unknown, conversion tools not shown.
          </p>
        )}
      </div>

      {/* Top Tabs */}
      <nav className="top-tabs">
        <ul>
          <li>
            <a href="#overview">Overview</a>
          </li>
          <li>
            <a href="#travel-deals">Travel Deals</a>
          </li>
          <li>
            <a href="#trip-reviews">Trip Reviews</a>
          </li>
          <li>
            <a href="#articles">Articles</a>
          </li>
          <li>
            <a href="#faqs">FAQs</a>
          </li>
          <li>
            <a href="#video">Video</a>
          </li>
        </ul>
      </nav>

      {/* Sections */}
      <div id="overview">
        <OverviewSection data={data} />
      </div>

      <div id="travel-deals">
        <DealsSection data={{ deals: data.deals, title: data.name }} />
      </div>

      <div id="trip-reviews">
        <TripReviewsSection reviews={data.reviews} />
      </div>

      <div id="articles">
        <ArticlesSection
          inspirations={inspirationalArticles}
          suggestedArticles={suggestedArticles}
          regularArticles={regularArticles}
          country={data.name}
          learnMoreTopics={data.learn_more_topics || []}
          // Pass slug here for related countries fetch
          glanceData={{ 
            countryName: data.name, 
            slug: data.slug,        // <<--- ADD THIS
            ...data.overview 
          }}
        />
      </div>

      <div id="faqs">
        <FaqsSection faqs={data.faqs} />
      </div>

      <div id="video">
        <VideoSection videoUrl={data.video} country={data.name} />
      </div>

      <div id="foot">
        <Foot country={data.name} />
      </div>
    </div>
  );
}
