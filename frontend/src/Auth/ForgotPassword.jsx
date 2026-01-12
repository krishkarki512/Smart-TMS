import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import "../styles/forgetpassword.css";
import beachImage from "../assets/forgetpassword.jpg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/accounts/password-reset/request/",
        { email }
      );
      toast.success(response.data.message || "OTP sent to your email!");
      localStorage.setItem("reset_email", email);
      // Navigate to verify-otp page WITH ?mode=reset query param
      setTimeout(() => navigate("/verify-otp?mode=reset"), 1000);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-wrapper">
        <div className="fp-image">
          <img src={beachImage} alt="Forgot Password Visual" />
        </div>

        <div className="fp-card">
          <h2 className="fp-title">Reset Password</h2>

          {/* Progress Steps */}
          <div className="fp-steps">
            <div className="fp-step active">
              <div className="circle">1</div>
              <span>Email</span>
            </div>
            <div className="fp-line" />
            <div className="fp-step">
              <div className="circle">2</div>
              <span>Verify</span>
            </div>
            <div className="fp-line" />
            <div className="fp-step">
              <div className="circle">3</div>
              <span>Reset</span>
            </div>
          </div>

          <p className="fp-subtitle">
            Enter your email address and we'll send you a verification code to
            reset your password.
          </p>

          <form onSubmit={handleSubmit} className="fp-form">
            <div className="fp-floating-input">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className={email ? "active" : ""}>Email Address</label>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>

          <div className="fp-bottom">
            <span>Remember your password?</span>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
