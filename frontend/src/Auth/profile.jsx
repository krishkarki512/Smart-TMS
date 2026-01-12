import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FaStar } from "react-icons/fa";
import "../styles/profile.css";
import bali from "../assets/bali.jpg";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";

// Tab Components
import MyBookings from "../Auth/booking";
import Reminders from "../Auth/remainder";
import FavouritePackages from "../Auth/fav";

// Import modals
import ProfileEditModal from "../Auth/ProfileEditModal";
import ChangePasswordModal from "../Auth/ChangePasswordModal";

export default function Profile() {
  const location = useLocation();

  // Use the tab from location.state if provided, otherwise default to "bookings"
  const initialTab = location.state?.tab || "bookings";

  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Modal visibility state
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/accounts/profile/");
        setProfile(res.data);
        setEditData(res.data);
      } catch (err) {
        setError("Failed to load profile. Please login again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <p className="profile-loading">Loading profile...</p>;
  if (error) return <p className="profile-error">{error}</p>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="profile-card">
        <div className="profile-left">
          <div className="profile-img-wrapper">
            <img
              src={newImage || profile.profile_image || bali}
              alt="Profile"
              className="profile-avatar"
            />
          </div>
          <button className="edit-button" onClick={() => setShowProfileModal(true)}>
            <FaStar className="edit-icon" /> Edit Profile
          </button>
          <button
            className="edit-button"
            style={{ marginTop: "10px", backgroundColor: "#f66" }}
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </button>
        </div>

        <div className="profile-right">
          <div className="profile-field">
            <input type="text" value={profile.username} readOnly />
          </div>
          <div className="profile-field">
            <input type="email" value={profile.email} readOnly />
          </div>
          <div className="profile-field">
            <input type="text" value={profile.phone || ""} readOnly placeholder="Phone" />
          </div>
          <div className="profile-field">
            <input
              type="text"
              value={profile.nationality || ""}
              readOnly
              placeholder="Nationality"
            />
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <div
          className={`tab-item ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          My Bookings
        </div>
        <div
          className={`tab-item ${activeTab === "reminders" ? "active" : ""}`}
          onClick={() => setActiveTab("reminders")}
        >
          Reminders & Upcoming
        </div>
        <div
          className={`tab-item ${activeTab === "favourites" ? "active" : ""}`}
          onClick={() => setActiveTab("favourites")}
        >
          Favourite Packages
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "bookings" && <MyBookings />}
        {activeTab === "reminders" && <Reminders />}
        {activeTab === "favourites" && <FavouritePackages />}
      </div>

      {/* Modals */}
      {showProfileModal && (
        <ProfileEditModal
          profile={profile}
          editData={editData}
          setEditData={setEditData}
          onClose={() => setShowProfileModal(false)}
          setProfile={setProfile}
          setNewImage={setNewImage}
        />
      )}

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </>
  );
}
