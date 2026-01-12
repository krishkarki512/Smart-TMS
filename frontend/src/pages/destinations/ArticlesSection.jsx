import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import img2 from "../../assets/img2.jpg";
import bali from "../../assets/bali.jpg";
import "../../pagescss/article.css";
import axiosInstance from "../../utils/axiosInstance";

export default function ArticlesSection({
  glanceData = {},
  learnMoreTopics = [],
}) {
  const [countryBlogs, setCountryBlogs] = useState([]);
  const [suggestedCountries, setSuggestedCountries] = useState([]);

  // Fetch country-specific blogs using axiosInstance (not fetch)
  useEffect(() => {
    if (glanceData.countryName) {
      axiosInstance
        .get(`blogs?country=${encodeURIComponent(glanceData.countryName)}`)
        .then((response) => {
          setCountryBlogs(response.data.results || []);
        })
        .catch((error) => {
          console.error("Error fetching country blogs:", error);
        });
    }
  }, [glanceData.countryName]);

  // Fetch related countries
  useEffect(() => {
    if (glanceData?.slug) {
      console.log("Fetching related countries for slug:", glanceData.slug);
      axiosInstance
        .get(`destinations/countries/related/?slug=${encodeURIComponent(glanceData.slug)}`)
        .then((res) => {
          setSuggestedCountries(res.data);
        })
        .catch((err) => {
          console.error("Error fetching related countries:", err);
        });
    }
  }, [glanceData.slug]);

  const defaultTopics = [
    { topic: "Best time to visit", description: "Plan your travel timing.", image: bali },
    { topic: "History and Culture", description: "Explore the cultural depth.", image: img2 },
    { topic: "Eating and Drinking", description: "Local cuisine insights.", image: bali },
    { topic: "Geography and Environment", description: "Understand the terrain.", image: img2 },
    { topic: "Money Matters", description: "Currency, cost, and more.", image: bali },
  ];

  const topics = learnMoreTopics.length ? learnMoreTopics : defaultTopics;

  return (
    <>
      {/* ------------ Get Inspired on the Good Times (Blogs) ------------ */}
      {countryBlogs.length > 0 && (
        <section className="inspired-section">
          <h2 className="section-title">Get inspired on the Good Times</h2>
          <div className="inspired-cards">
            {countryBlogs.map((blog) => (
              <article className="inspired-card" key={blog.id}>
                <div className="inspired-img-wrapper">
                  <img
                    src={blog.thumbnail || img2}
                    alt={blog.title || "Inspirational blog"}
                  />
                  <div className="inspired-overlay">
                    <p className="location">{blog.title || "Untitled"}</p>
                    <p className="country">{blog.country?.name || glanceData.countryName || ""}</p>
                    <Link
                      to={`/blogs/${blog.slug || "#"}`}
                      className="explore-link"
                      aria-label={`Explore blog: ${blog.title || "Untitled"}`}
                    >
                      Explore &gt;
                    </Link>
                  </div>
                </div>
                <div className="inspired-footer">
                  <p className="tag">Good Trips</p>
                  <h3 className="inspired-title">{blog.subtitle || blog.title || "Untitled"}</h3>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ------------ You Might Also Like (Related Countries) ------------ */}
      {suggestedCountries.length > 0 && (
        <section className="article-section">
          <div className="article-title-wrapper">
            <h2 className="section-title">You might also like</h2>
            <div className="section-underline1"></div>
          </div>
          <div className="article-card-grid">
            {suggestedCountries.map((country) => (
              <article className="article-card" key={country.id}>
                <img
                  src={country.image || img2}
                  alt={country.name || "Country preview"}
                />
                <div className="card-overlay">
                  <div className="location-block">
                    <h3>{country.name}</h3>
                    <p>{country.region?.name || ""}</p>
                  </div>
                  <Link
                    to={`/destinations/${country.slug}`}
                    className="explore-inside-btn"
                    aria-label={`Explore suggested country: ${country.name}`}
                  >
                    Explore All →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ------------ Country at a Glance ------------ */}
      <section className="glance-section">
        <h2>{glanceData.countryName || "Country at a glance"}</h2>
        <div className="glance-grid">
          <div><h4>CAPITAL CITY</h4><p>{glanceData.capital || "-"}</p></div>
          <div><h4>POPULATION</h4><p>{typeof glanceData.population === 'object' ? JSON.stringify(glanceData.population) : glanceData.population || "-"}</p></div>
          <div><h4>CURRENCY</h4><p>{glanceData.currency || "-"}</p></div>
          <div><h4>LANGUAGE</h4><p>{glanceData.language || "-"}</p></div>
          <div><h4>TIMEZONE</h4><p>{glanceData.timezone || "-"}</p></div>
          <div><h4>CALLING CODE</h4><p>{glanceData.calling_code || glanceData.callingCode || "-"}</p></div>
          <div className="full-width"><h4>ELECTRICITY</h4><p>{glanceData.electricity || "-"}</p></div>
        </div>
      </section>

      {/* ------------ Learn More ------------ */}
      <section className="learn-section">
        <h2 className="learn-title">Learn more about {glanceData.countryName || "this country"}</h2>
        {topics.map(({ title, topic, description, image_url, image }, i) => {
          const heading = title || topic || "Untitled";
          const imgSrc = image_url || image || (i % 2 ? img2 : bali);
          const isLeft = i % 2 === 1;

          return (
            <div key={`${heading}-${i}`} className={`learn-block ${isLeft ? "img-left" : "img-right"}`}>
              {isLeft ? (
                <>
                  <div className="learn-img"><img src={imgSrc} alt={heading} /></div>
                  <div className="learn-text"><h3>{heading}</h3><p>{description}</p></div>
                </>
              ) : (
                <>
                  <div className="learn-text"><h3>{heading}</h3><p>{description}</p></div>
                  <div className="learn-img"><img src={imgSrc} alt={heading} /></div>
                </>
              )}
            </div>
          );
        })}
      </section>
    </>
  );
}
