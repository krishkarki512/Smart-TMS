import React, { useState, useEffect } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import axiosInstance from "../../utils/axiosInstance";
import "../../pagescss/feat.css";

export default function Feat({ country, dealId }) {
  const [itineraryData, setItineraryData] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!country || !dealId) return; // wait for valid params

    const fetchItinerary = async () => {
      try {
        const response = await axiosInstance.get(
          `/destinations/countries/${country}/travel-deals/${dealId}/itinerary-days/`
        );
        // API returns paginated data: use results array
        setItineraryData(response.data.results || []);
      } catch (error) {
        console.error("Error fetching itinerary:", error);
        setItineraryData([]);
      }
    };
    fetchItinerary();
  }, [country, dealId]);

  const toggle = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <section className="itinerary-section">
      <div className="itinerary-header">
        <h2>Itinerary</h2>
        <span className="show-all" onClick={handleShowAll}>
          {showAll ? "Collapse all" : "Show all"} <RiArrowDropDownLine />
        </span>
      </div>

      {Array.isArray(itineraryData) &&
        itineraryData.map((item, index) => {
          const isOpen = showAll || expanded === index;
          return (
            <div key={item.id || index} className="itinerary-item">
              <div className="itinerary-day" onClick={() => toggle(index)}>
                <span>
                  Day {item.day_number} : <strong>{item.location}</strong>
                </span>
                <RiArrowDropDownLine
                  className={`dropdown-icon ${isOpen ? "rotate" : ""}`}
                />
              </div>

              {isOpen && (
                <div className="itinerary-details">
                  <p>{item.description}</p>

                  <div className="features">
                    <div>
                      <h4>🛋 Accommodation</h4>
                      <ul><li>{item.accommodation}</li></ul>
                    </div>
                    <div>
                      <h4>⭕ Included Activities</h4>
                      <ul>
                        {item.activities?.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="meals">
                    <h4>🍽 Meals</h4>
                    <ul>
                      {item.meals?.map((meal, i) => (
                        <li key={i}>{meal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </section>
  );
}
