import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { BiErrorCircle } from "react-icons/bi";
import "../styles/footer.css";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email.");
      setIsError(true);
      return;
    }

    try {
      const response = await axiosInstance.post("accounts/newsletter/subscribe/", { email });
      setMessage(response.data.message || "Thank you for subscribing!");
      setIsError(false);
      setEmail("");
    } catch (error) {
      setMessage(
        error.response?.data?.email?.[0] || "Subscription failed. Try again."
      );
      setIsError(true);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand/Intro */}
        <div className="footer-section">
          <h4 className="footer-title">Smart TMS</h4>
          <p className="footer-desc">
            Curated journeys to extraordinary destinations. Experience the world
            beyond the ordinary.
          </p>
          <div className="social-icons">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaYoutube /></a>
          </div>
        </div>

        {/* Destinations */}
        <div className="footer-section">
          <h4 className="footer-title">Popular Destinations</h4>
          <ul>
            <li>Japan</li>
            <li>Morocco</li>
            <li>Peru</li>
            <li>Italy</li>
            <li>Tanzania</li>
            <li>Iceland</li>
          </ul>
        </div>

        {/* Trip Styles */}
        <div className="footer-section">
          <h4 className="footer-title">Trip Styles</h4>
          <ul>
            <li>Cultural Tours</li>
            <li>Wildlife Expeditions</li>
            <li>Culinary Journeys</li>
            <li>Trekking Adventures</li>
            <li>Photography Tours</li>
            <li>Wellness Retreats</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-section newsletter">
          <h4 className="footer-title">Newsletter</h4>
          <p>
            Subscribe to receive travel inspiration, exclusive offers, and
            insider tips.
          </p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <div className="newsletter-input">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit">📩</button>
            </div>
            {message && (
              <p className={`subscription-message ${isError ? "error" : "success"}`}>
                {isError && <BiErrorCircle className="error-icon" />}
                {message}
              </p>
            )}
            <p className="policy-note">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Smart TMS. All rights reserved.</p>
        <div className="footer-links-inline">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
