import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";
import { FaHeart } from "react-icons/fa";
import "../styles/fav.css";

export default function FavouritePackages() {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();
  const didRedirectRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      if (!didRedirectRef.current) {
        toast.info("Please log in to view your wishlist");
        didRedirectRef.current = true;
        navigate("/login");
      }
      return;
    }

    loadWishlist();
  }, [navigate]);

  const loadWishlist = () => {
    axiosInstance
      .get("/destinations/wishlist/")
      .then((res) => setWishlist(res.data.results || []))
      .catch(() => toast.error("Failed to load wishlist"));
  };

  const removeFromWishlist = (id) => {
    axiosInstance
      .delete(`/destinations/wishlist/${id}/`)
      .then(() => {
        toast.success("Removed from wishlist");
        setWishlist((prev) => prev.filter((item) => item.id !== id));
      })
      .catch(() => toast.error("Failed to remove from wishlist"));
  };

  const slugify = (str) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="fav-container">
      <h3 className="fav-heading">Favourite Packages</h3>
      <div className="fav-cards">
        {wishlist.length === 0 ? (
          <p>No favourite packages found.</p>
        ) : (
          wishlist.map((deal) => (
            <div className="fav-card" key={deal.id}>
              <div className="fav-image-container">
                <img
                  src={deal.deal_image || "https://via.placeholder.com/300"}
                  alt={deal.deal_title}
                  className="fav-image"
                />
                <FaHeart
                  className="fav-heart"
                  color="red"
                  onClick={() => removeFromWishlist(deal.id)}
                  style={{ cursor: "pointer" }}
                />
              </div>
              <div className="fav-content">
                <h4 className="fav-title">{deal.deal_title}</h4>
                <p className="fav-price">
                  {deal.deal_price ? `$${deal.deal_price}` : "Price on request"}
                </p>
                <button
                  className="fav-book-btn"
                  onClick={() =>
                    navigate(
                      `/destinations/${deal.deal_country_slug}/deal/${slugify(deal.deal_title)}`
                    )
                  }
                >
                  See Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
