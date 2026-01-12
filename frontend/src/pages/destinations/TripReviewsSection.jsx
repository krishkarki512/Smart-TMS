import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import "../../pagescss/review.css";

export default function TripReviewsSection({ reviews = [] }) {
  const [selectedRating, setSelectedRating] = useState(null);
  const [expandedReviewIds, setExpandedReviewIds] = useState([]);

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const filteredReviews = selectedRating
    ? reviews.filter((r) => r.rating === selectedRating)
    : reviews;

  const handleCheckboxChange = (star) => {
    setSelectedRating(selectedRating === star ? null : star);
  };

  const toggleReadMore = (id) => {
    setExpandedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  return (
    <section className="review-container">
      {/* Title + Underline */}
      <div className="review-title-wrap">
        <h2 className="review-title">Tour reviews</h2>
        <div className="review-underline" />
      </div>

      {/* Average summary */}
      <div className="review-top-summary">
        <div className="stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <FaStar key={i} color="#ddb148" />
          ))}
        </div>
        <span className="average-rating">{averageRating.toFixed(1)}</span>
        <span className="total-reviews">{totalReviews} reviews</span>
      </div>

      <div className="review-content-wrapper">
        {/* Sidebar Filters */}
        <aside className="review-filters">
          <h4>Filter by rating</h4>
          {ratingCounts.map(({ star, count }) => (
            <label key={star} className="rating-filter-option">
              <span className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectedRating === star}
                  onChange={() => handleCheckboxChange(star)}
                />
              </span>
              <span className="stars-column">
                {Array.from({ length: star }).map((_, i) => (
                  <FaStar key={i} color="#f4b400" size={14} />
                ))}
              </span>
              <span className="count-column">{count}</span>
            </label>
          ))}
        </aside>

        {/* Review Cards */}
        <div className="review-list">
          {filteredReviews.map((r) => {
            const isExpanded = expandedReviewIds.includes(r.id);
            const content = isExpanded
              ? r.content
              : r.content.length > 150
              ? r.content.slice(0, 150) + "..."
              : r.content;

            return (
              <div className="review-card" key={r.id}>
                <div className="stars">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <FaStar key={i} color="#f4b400" size={14} />
                  ))}
                </div>
                <h3>{r.title}</h3>
                <p className="review-meta">
                  <strong>{r.name}</strong> . Traveled {r.travel_date}
                </p>
                <p>{content}</p>
                {r.content.length > 150 && (
                  <a
                    href="#"
                    className="read-more"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleReadMore(r.id);
                    }}
                  >
                    {isExpanded ? "Show less" : "Read more"}
                  </a>
                )}
                <p className="review-date">
                  Review submitted on {r.submitted_on}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
