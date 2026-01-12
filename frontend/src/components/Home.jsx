import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Search, Calendar, AlertCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Home.css";
import homevid1 from "../assets/homevid1.mp4";

export default function Home() {
  const { t } = useTranslation(); // <-- i18n hook
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endDateError, setEndDateError] = useState("");

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const navigate = useNavigate();

  const PopperContainer = ({ children, containerRef }) =>
    containerRef?.current ? ReactDOM.createPortal(children, containerRef.current) : null;

  const onStartDateChange = (date) => {
    setStartDate(date);
    setEndDateError("");
    if (endDate && date && endDate < date) setEndDate(null);
  };

  const onEndDateChange = (date) => {
    if (!startDate) {
      setEndDateError(t("select_start_date_first"));
      return;
    }
    if (date < startDate) {
      setEndDateError(t("end_date_before_start_date"));
      return;
    }
    setEndDate(date);
    setEndDateError("");
  };

  const onEndCalendarOpen = () => {
    if (!startDate) setEndDateError(t("select_start_date_first"));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    if (startDate) params.set("start_date", startDate.toISOString().split("T")[0]);
    if (endDate) params.set("end_date", endDate.toISOString().split("T")[0]);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="home">
      <video autoPlay muted loop className="home-video">
        <source src={homevid1} type="video/mp4" />
      </video>

      <div className="home-overlay">
        <div className="home-content">
          <h1 className="home-title">{t("find_your_perfect_journey")}</h1>
          <p className="home-subtitle">{t("home_subtitle_text")}</p>

          <div className="home-search-wrapper">
            <div className="home-search-bar">
              {/* Search Box */}
              <div className="home-search-input">
                <MapPin size={18} className="home-icon" />
                <input
                  type="text"
                  placeholder={t("search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="home-divider"></div>

              {/* Date Range */}
              <div className="home-date-box">
                <div className="home-date-field" ref={startDateRef}>
                  <Calendar size={16} className="home-calendar-icon" />
                  <DatePicker
                    selected={startDate}
                    onChange={onStartDateChange}
                    placeholderText={t("start_date")}
                    dateFormat="MM/dd/yyyy"
                    className="home-datepicker"
                    autoComplete="off"
                    onKeyDown={(e) => e.preventDefault()}
                    minDate={new Date()}
                    popperPlacement="bottom-start"
                    popperContainer={(props) => (
                      <PopperContainer {...props} containerRef={startDateRef} />
                    )}
                  />
                </div>

                <span className="home-date-separator">—</span>

                <div className="home-date-field" ref={endDateRef}>
                  <Calendar size={16} className="home-calendar-icon" />
                  <DatePicker
                    selected={endDate}
                    onChange={onEndDateChange}
                    onCalendarOpen={onEndCalendarOpen}
                    placeholderText={t("end_date")}
                    dateFormat="MM/dd/yyyy"
                    className="home-datepicker"
                    autoComplete="off"
                    onKeyDown={(e) => e.preventDefault()}
                    minDate={startDate || new Date()}
                    popperPlacement="bottom-start"
                    popperContainer={(props) => (
                      <PopperContainer {...props} containerRef={endDateRef} />
                    )}
                  />
                </div>
              </div>

              <button className="home-search-btn" onClick={handleSearch}>
                {t("search")} <Search size={16} />
              </button>
            </div>

            {endDateError && (
              <div className="home-error" role="alert">
                <AlertCircle size={16} />
                <span>{endDateError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
