import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";
import beach from "../assets/confirm.png";
import "../styles/rest.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem("reset_email");

    if (emailFromState) {
      setEmail(emailFromState);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      toast.error("Email not found. Please restart the reset process.");
      navigate("/forgot-password");
    }
  }, [location.state, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value.trim(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { newPassword, confirmPassword } = formData;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!email) {
      toast.error("No email found. Please restart the password reset process.");
      navigate("/forgot-password");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/accounts/password-reset/confirm/", {
        email,
        new_password: newPassword,
      });

      toast.success(response.data.message || "Password reset successful!");
      localStorage.removeItem("reset_email");

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const data = error.response?.data;
      const errorMessage =
        data && typeof data === "object"
          ? Object.values(data).flat().join(" ")
          : "Failed to reset password.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resetpass-wrapper">
      <div className="resetpass-container">
        <div className="resetpass-left">
          <img src={beach} alt="beach" className="resetpass-img" />
        </div>
        <div className="resetpass-right">
          <div className="resetpass-card">
            <div className="resetpass-top">
              <ArrowLeft className="resetpass-back" onClick={() => navigate("/verify-otp")} />
              <h2>Reset Password</h2>
            </div>

            <div className="resetpass-steps">
              <div className="resetpass-step done">1</div>
              <div className="resetpass-line done"></div>
              <div className="resetpass-step done">2</div>
              <div className="resetpass-line done"></div>
              <div className="resetpass-step done">3</div>
            </div>

            <div className="resetpass-labels">
              <span>Email</span>
              <span>Verify</span>
              <span>Reset</span>
            </div>

            <p className="resetpass-instruction">Create a new password for your account.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="resetpass-inputgroup">
                <label>New Password</label>
                <div className="resetpass-inputbox">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                  />
                  {showPassword ? (
                    <Eye onClick={() => setShowPassword(false)} />
                  ) : (
                    <EyeOff onClick={() => setShowPassword(true)} />
                  )}
                </div>
              </div>

              <div className="resetpass-inputgroup">
                <label>Confirm New Password</label>
                <div className="resetpass-inputbox">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    required
                  />
                  {showConfirm ? (
                    <Eye onClick={() => setShowConfirm(false)} />
                  ) : (
                    <EyeOff onClick={() => setShowConfirm(true)} />
                  )}
                </div>
              </div>

              <button className="resetpass-btn" type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <p className="resetpass-signin">
              Remember your password?{" "}
              <span onClick={() => navigate("/login")}>Sign in</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
