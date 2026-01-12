import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import ReviewModal from "../../components/ReviewModal";
import { toast } from "react-toastify";
import "../../pagescss/review.css";

export default function Reviewplaces({ data, reviews, setReviews }) {
  const [selectedRating, setSelectedRating] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const countrySlug = data?.country?.slug;
  const dealSlug = data?.slug;

  const totalReviews = reviews.length;

  // Parse average rating to number safely
  const averageRatingNum = totalReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;
  const averageRating = totalReviews ? averageRatingNum.toFixed(1) : "N/A";

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

  // Format date to more readable form e.g. "Jul 15, 2025"
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleReviewAdded = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
    setSelectedRating(null); // reset filter when a new review added
  };

  return (
    <section id="review-section" className="review-container">
      <div className="review-title-wrap">
        <h2 className="review-title">Tour Reviews</h2>
        <div className="review-underline" />
      </div>

      <div className="review-top-summary">
        <div className="stars" aria-label={`Average rating ${averageRating} out of 5`}>
          {[...Array(Math.round(averageRatingNum))].map((_, i) => (
            <FaStar key={i} color="#ddb148" />
          ))}
        </div>
        <span className="average-rating">{averageRating}</span>
        <span className="total-reviews">
          {totalReviews} review{totalReviews !== 1 ? "s" : ""}
        </span>
        <button
          className="add-review-btn"
          onClick={() => setShowModal(true)}
          aria-label="Add a new review"
        >
          Add Review
        </button>
      </div>

      <div className="review-content-wrapper">
        <aside className="review-filters" aria-label="Filter reviews by rating">
          <h4>Filter by rating</h4>
          {ratingCounts.map(({ star, count }) => (
            <label key={star} className="rating-filter-option">
              <input
                type="checkbox"
                checked={selectedRating === star}
                onChange={() => handleCheckboxChange(star)}
                aria-checked={selectedRating === star}
                aria-label={`Filter reviews with ${star} stars`}
              />
              <span className="stars-column" aria-hidden="true">
                {[...Array(star)].map((_, i) => (
                  <FaStar key={i} color="#f4b400" size={14} />
                ))}
              </span>
              <span className="count-column">({count})</span>
            </label>
          ))}
        </aside>

        <div className="review-list" role="list" aria-live="polite">
          {filteredReviews.length === 0 ? (
            <p>No reviews found for this rating.</p>
          ) : (
            filteredReviews.map((r) => (
              <article
                className="review-card"
                key={r.id}
                role="listitem"
                tabIndex={0}
                aria-label={`Review titled ${r.title} by ${r.name} with rating ${r.rating} stars`}
              >
                <div className="stars" aria-hidden="true">
                  {[...Array(r.rating)].map((_, i) => (
                    <FaStar key={i} color="#f4b400" size={14} />
                  ))}
                </div>
                <h3>{r.title}</h3>
                <p className="review-meta">
                  <strong>{r.name}</strong> · Traveled {r.travel_date}
                </p>
                <p>{r.content}</p>
                <p className="review-date">Submitted on {formatDate(r.submitted_on)}</p>
              </article>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <ReviewModal
          countrySlug={countrySlug}
          dealSlug={dealSlug}
          onClose={() => setShowModal(false)}
          onReviewAdded={handleReviewAdded}
        />
      )}
    </section>
  );
}
