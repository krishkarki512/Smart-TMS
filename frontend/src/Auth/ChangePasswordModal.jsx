import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

export default function ChangePasswordModal({ onClose }) {
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async () => {
    const { old_password, new_password, confirm_password } = passwordData;

    if (new_password !== confirm_password) {
      return toast.error("Passwords do not match.");
    }

    try {
      await axiosInstance.post("/accounts/change-password/", {
        old_password,
        new_password,
      });
      toast.success("Password changed successfully.");
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3>Change Password</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="password-field">
            <input
              name="old_password"
              type={passwordVisibility.old ? "text" : "password"}
              value={passwordData.old_password}
              onChange={handlePasswordChange}
              placeholder="Old Password"
            />
            <span onClick={() => togglePasswordVisibility("old")}>
              {passwordVisibility.old ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
          <div className="password-field">
            <input
              name="new_password"
              type={passwordVisibility.new ? "text" : "password"}
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              placeholder="New Password"
            />
            <span onClick={() => togglePasswordVisibility("new")}>
              {passwordVisibility.new ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
          <div className="password-field">
            <input
              name="confirm_password"
              type={passwordVisibility.confirm ? "text" : "password"}
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              placeholder="Confirm New Password"
            />
            <span onClick={() => togglePasswordVisibility("confirm")}>
              {passwordVisibility.confirm ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSubmit}>
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
