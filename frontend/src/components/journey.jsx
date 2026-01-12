import React, { useState, useEffect } from "react";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import "../styles/journey.css";

const tabs = ["all", "popular", "new"];

export default function ExclusiveTrips() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("all");
  const [tripsData, setTripsData] = useState({});
  const [liked, setLiked] = useState({});
  const [loadingWishIds, setLoadingWishIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const truncate = (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError(null);
      try {
        const filterParam = activeTab === "all" ? "" : `?filter=${activeTab}`;
        const url = `/destinations/travel-deals/${filterParam}`;
        const res = await axiosInstance.get(url);
        setTripsData((prev) => ({ ...prev, [activeTab]: res.data }));
      } catch (error) {
        console.error("Failed to load trips", error);
        setError(t("failed_load_trips"));
      } finally {
        setLoading(false);
      }
    };

    if (!tripsData[activeTab]) fetchTrips();
  }, [activeTab, tripsData, t]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await axiosInstance.get("/destinations/wishlist/");
        const tripMap = {};
        res.data.results.forEach((item) => {
          tripMap[item.deal] = item.id;
        });
        setLiked(tripMap);
      } catch (err) {
        console.error("Failed to fetch wishlist", err);
        toast.error(t("failed_load_wishlist"));
      }
    };
    fetchWishlist();
  }, [t]);

  const toggleFavorite = async (tripId) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.info(t("login_required"));
      navigate("/login");
      return;
    }

    if (loadingWishIds.has(tripId)) return;

    setLoadingWishIds((prev) => new Set(prev).add(tripId));

    const wishlistId = liked[tripId];
    try {
      if (wishlistId) {
        await axiosInstance.delete(`/destinations/wishlist/${wishlistId}/`);
        setLiked((prev) => {
          const next = { ...prev };
          delete next[tripId];
          return next;
        });
        toast.success(t("removed_wishlist"));
      } else {
        const res = await axiosInstance.post("/destinations/wishlist/", {
          deal: tripId,
        });
        setLiked((prev) => ({
          ...prev,
          [tripId]: res.data.id,
        }));
        toast.success(t("added_wishlist"));
      }
    } catch (err) {
      console.error("Wishlist error", err);
      toast.error(
        wishlistId ? t("failed_remove_wishlist") : t("failed_add_wishlist")
      );
    } finally {
      setLoadingWishIds((prev) => {
        const next = new Set(prev);
        next.delete(tripId);
        return next;
      });
    }
  };

  const trips = tripsData[activeTab]?.results || [];

  return (
    <section className="exclusive-section">
      <div className="exclusive-header">
        <h2 className="exclusive-title">{t("exclusive_journeys")}</h2>
        <div className="exclusive-subheader">
          <div className="exclusive-tabs">
            {tabs.map((tab) => (
              <span
                key={tab}
                className={`exclusive-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {t(`tab_${tab}`)}
              </span>
            ))}
          </div>
          <span
            className="exclusive-explore-link"
            onClick={() => navigate("/alldestinations")}
            style={{ cursor: "pointer" }}
          >
            {t("explore_all_trips")} →
          </span>
        </div>
      </div>

      <div className="exclusive-card-container">
        {loading && <p>{t("loading_trips")}...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && trips.length === 0 && (
          <p>{t("no_trips_available")}</p>
        )}

        {!loading &&
          trips.map((trip) => (
            <div
              key={trip.id}
              className="exclusive-card"
              style={{ backgroundImage: `url(${trip.image})` }}
            >
              <div className="exclusive-top">
                {trip.tag && (
                  <div className="exclusive-badge-wrapper">
                    <div className="exclusive-badge">{trip.tag}</div>
                  </div>
                )}

                <div
                  className="exclusive-heart"
                  onClick={() => toggleFavorite(trip.id)}
                  style={{ cursor: loadingWishIds.has(trip.id) ? "not-allowed" : "pointer" }}
                >
                  {liked[trip.id] ? (
                    <FaHeart className="heart-icon filled" size={18} />
                  ) : (
                    <CiHeart className="heart-icon outline" size={20} />
                  )}
                </div>
              </div>

              <div className="exclusive-content">
                <h3 className="exclusive-trip-title">{trip.title}</h3>
                <p className="exclusive-trip-desc">{truncate(trip.description, 100)}</p>
                <div className="exclusive-trip-days">{trip.days} {t("days")}</div>
                <div className="exclusive-action-row">
                  <button
                    className="exclusive-details-btn"
                    onClick={() =>
                      navigate(
                        `/destinations/${trip.country?.slug || "country"}/deal/${trip.slug || trip.id}`
                      )
                    }
                  >
                    {t("see_details")}
                  </button>
                  <div className="exclusive-price">
                    <span className="exclusive-original">
                      {trip.originalPrice ? `$${trip.originalPrice}` : ""}
                    </span>
                    <span className="exclusive-discounted">${trip.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
