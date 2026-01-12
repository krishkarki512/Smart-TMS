import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";
import "../styles/reviewModal.css";

export default function ReviewModal({ countrySlug, dealSlug, onClose, onReviewAdded }) {
  const [form, setForm] = useState({
    name: "",
    title: "",
    rating: 5,
    content: "",
    travel_date: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    axiosInstance
      .post(`destinations/countries/${countrySlug}/travel-deals/${dealSlug}/reviews/`, form)
      .then((res) => {
        toast.success("Review submitted!");
        onReviewAdded(res.data); // notify parent
        onClose(); // close modal
      })
      .catch((err) => {
        toast.error("Failed to submit review.");
        console.error(err);
      });
  };

  return (
    <div className="review-modal">
      <div className="modal-content">
        <h3>Write a Review</h3>
        <form onSubmit={handleSubmit}>
          <input
            required
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            type="text"
            placeholder="Review title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <select
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} Star{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <input
            required
            type="text"
            placeholder="Travel date (e.g. July 2025)"
            value={form.travel_date}
            onChange={(e) => setForm({ ...form, travel_date: e.target.value })}
          />
          <textarea
            required
            placeholder="Write your review here"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <div className="modal-buttons">
            <button type="submit">Submit</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
