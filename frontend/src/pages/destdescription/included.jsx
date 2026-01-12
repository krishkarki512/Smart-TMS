import React, { useState, useEffect } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import axiosInstance from "../../utils/axiosInstance";
import "../../pagescss/included.css";

export default function WhatsIncluded({ country, dealId }) {
  const [included, setIncluded] = useState([]);
  const [notIncluded, setNotIncluded] = useState([]);

  const [expandedIncluded, setExpandedIncluded] = useState(null);
  const [showAllIncluded, setShowAllIncluded] = useState(false);

  const [expandedNotIncluded, setExpandedNotIncluded] = useState(null);
  const [showAllNotIncluded, setShowAllNotIncluded] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!country || !dealId) return;

    const fetchIncludedData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(
          `/destinations/countries/${country}/travel-deals/${dealId}/included/`
        );
        // Assuming your API returns { included: [...], not_included: [...] }
        setIncluded(response.data.included || []);
        setNotIncluded(response.data.not_included || []);
      } catch (err) {
        console.error("Error fetching included data:", err);
        setError("Failed to load included/not included info.");
      } finally {
        setLoading(false);
      }
    };

    fetchIncludedData();
  }, [country, dealId]);

  const toggleIncluded = (index) => {
    setExpandedIncluded(expandedIncluded === index ? null : index);
  };

  const toggleNotIncluded = (index) => {
    setExpandedNotIncluded(expandedNotIncluded === index ? null : index);
  };

  if (loading) return <div>Loading included information...</div>;
  if (error) return <div>{error}</div>;

  return (
    <section className="included-section">
      {/* What's Included Section */}
      <div className="included-header">
        <h2>What's Included</h2>
        <span className="show-all" onClick={() => setShowAllIncluded(!showAllIncluded)}>
          {showAllIncluded ? "Collapse all" : "Show all"} <RiArrowDropDownLine />
        </span>
      </div>

      {included.map((item, index) => {
        const isOpen = showAllIncluded || expandedIncluded === index;
        return (
          <div key={index} className="included-item">
            <div className="included-title" onClick={() => toggleIncluded(index)}>
              <div className="icon-label">
                <span className="icon">{item.icon}</span>
                <span className="label">{item.title}</span>
              </div>
              <RiArrowDropDownLine
                className={`dropdown-icon ${isOpen ? "rotate" : ""}`}
              />
            </div>
            {isOpen && (
              <ul className="included-details">
                {item.details.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {/* What's Not Included Section */}
      <div className="included-header not-included-header">
        <h2>What's Not Included</h2>
        <span className="show-all" onClick={() => setShowAllNotIncluded(!showAllNotIncluded)}>
          {showAllNotIncluded ? "Collapse all" : "Show all"} <RiArrowDropDownLine />
        </span>
      </div>

      {notIncluded.map((item, index) => {
        const isOpen = showAllNotIncluded || expandedNotIncluded === index;
        return (
          <div key={index} className="included-item">
            <div className="included-title" onClick={() => toggleNotIncluded(index)}>
              <div className="icon-label">
                <span className="icon">{item.icon}</span>
                <span className="label">{item.title}</span>
              </div>
              <RiArrowDropDownLine
                className={`dropdown-icon ${isOpen ? "rotate" : ""}`}
              />
            </div>
            {isOpen && (
              <ul className="included-details">
                {item.details.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}
