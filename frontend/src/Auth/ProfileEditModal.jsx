import React from "react";
import { MdPhotoCamera } from "react-icons/md";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import bali from "../assets/bali.jpg";

export default function ProfileEditModal({
  profile,
  editData,
  setEditData,
  onClose,
  setProfile,
  setNewImage,
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_image", file);
    formData.append("username", editData.username || "");
    formData.append("email", editData.email || "");
    formData.append("phone", editData.phone || "");
    formData.append("nationality", editData.nationality || "");

    try {
      const res = await axiosInstance.put("/accounts/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data);
      setEditData(res.data);
      setNewImage(URL.createObjectURL(file));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Image upload failed.");
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await axiosInstance.put("/accounts/profile/", {
        username: editData.username,
        email: editData.email,
        phone: editData.phone,
        nationality: editData.nationality,
      });
      setProfile(res.data);
      setEditData(res.data);
      onClose();
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-img-wrapper">
          <img
            src={profile.profile_image || bali}
            alt="Profile"
            className="modal-avatar"
          />
          <label htmlFor="upload-modal-photo" className="camera-icon-modal">
            <MdPhotoCamera />
          </label>
          <input
            type="file"
            id="upload-modal-photo"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
        </div>

        <div className="modal-body">
          <input
            name="username"
            value={editData.username || ""}
            onChange={handleInputChange}
            placeholder="Username"
          />
          <input
            name="email"
            type="email"
            value={editData.email || ""}
            onChange={handleInputChange}
            placeholder="Email"
          />
          <input
            name="phone"
            value={editData.phone || ""}
            onChange={handleInputChange}
            placeholder="Phone"
          />
          <input
            name="nationality"
            value={editData.nationality || ""}
            onChange={handleInputChange}
            placeholder="Nationality (e.g., US)"
          />
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSaveProfile}>
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
