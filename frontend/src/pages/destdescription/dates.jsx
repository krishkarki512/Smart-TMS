import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../pagescss/dates.css";
import { FaCheckCircle, FaGlobe, FaBed } from "react-icons/fa";
import { toast } from "react-toastify";

export default function Dates({ data }) {
  const { country: countrySlug, dealId: dealSlug } = useParams();
  const initialVisibleCount = 3;
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [filterMonth, setFilterMonth] = useState("All Months");
  const [sortBy, setSortBy] = useState("Start date (earliest)");
  const navigate = useNavigate();

  // Check login status by looking for access_token in localStorage
  const isAuthenticated = !!localStorage.getItem("access_token");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const filteredDates = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter((item) => {
      if (filterMonth === "All Months") return true;
      const monthName = monthNames[new Date(item.start_date).getMonth()];
      return monthName === filterMonth;
    });
  }, [data, filterMonth]);

  const sortedDates = useMemo(() => {
    const copy = [...filteredDates];
    switch (sortBy) {
      case "Start date (earliest)":
        return copy.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      case "Start date (latest)":
        return copy.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
      case "Price (lowest)":
        return copy.sort((a, b) => parseFloat(a.discounted_price) - parseFloat(b.discounted_price));
      case "Price (highest)":
        return copy.sort((a, b) => parseFloat(b.discounted_price) - parseFloat(a.discounted_price));
      default:
        return copy;
    }
  }, [filteredDates, sortBy]);

  const handleToggle = () => {
    setVisibleCount(prev => prev === initialVisibleCount ? sortedDates.length : initialVisibleCount);
  };

  const handleConfirmClick = (itemId) => {
    if (!isAuthenticated) {
      toast.info("Please login to proceed with booking.");
      navigate("/login");
      return;
    }
    navigate(`/payment/payment1?country=${countrySlug}&deal=${dealSlug}&date=${itemId}`);
  };

  return (
    <div className="dates-container">
      <h2 className="dates-title">Dates and Availability</h2>

      <div className="dates-filters">
        <select className="filter-dropdown" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <option>All Months</option>
          {monthNames.map((month) => (
            <option key={month}>{month}</option>
          ))}
        </select>

        <select className="sort-dropdown" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option>Start date (earliest)</option>
          <option>Start date (latest)</option>
          <option>Price (lowest)</option>
          <option>Price (highest)</option>
        </select>
      </div>

      {sortedDates.slice(0, visibleCount).map((item) => (
        <div className="date-card fade-in" key={item.id}>
          <div className="date-left">
            <div className="date-range">
              <div>
                <span>From</span>
                <strong>{item.start_date}</strong>
              </div>
              <span className="arrow">→</span>
              <div>
                <span>To</span>
                <strong>{item.end_date}</strong>
              </div>
            </div>

            <div className="date-info">
              <p><FaGlobe /> {item.language}</p>
              <p><FaCheckCircle /> {item.guaranteed ? "Guaranteed departure" : "Subject to availability"}</p>
              <p><FaBed /> {item.rooms}</p>
            </div>
          </div>

          <div className="date-right">
            <div className="discount-badge-wrapper">
              {item.discount_percent && (
                <span className="discount-badge">-{item.discount_percent}</span>
              )}
            </div>

            <div className="price-line">
              <span>From:</span>
              {item.original_price && item.original_price !== item.discounted_price && (
                <span className="original-price">${item.original_price}</span>
              )}
              <span className="discounted-price">${item.discounted_price}</span>
            </div>

            <select className="payment-select">
              <option>Payment Plan</option>
              <option>Full Payment</option>
            </select>

            {item.capacity === 0 ? (
              <div className="sold-out-text">Sold Out</div>
            ) : (
              <>
                {item.capacity < 10 && (
                  <div className="notice-box selling-fast">
                    <div className="icon">i</div>
                    <div className="notice-content">
                      Only <strong>{item.capacity} places</strong> remaining
                    </div>
                  </div>
                )}

                <button
                  className="confirm-btn"
                  onClick={() => handleConfirmClick(item.id)}
                >
                  Confirm Dates
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {sortedDates.length > initialVisibleCount && (
        <div className="view-more-wrapper">
          <button className="view-more-btn" onClick={handleToggle}>
            {visibleCount === sortedDates.length ? "View Less Dates →" : "View More Dates →"}
          </button>
        </div>
      )}
    </div>
  );
}
