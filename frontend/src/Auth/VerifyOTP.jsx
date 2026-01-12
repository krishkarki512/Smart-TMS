import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import otpImage from "../assets/otp.png";
import "../styles/otp1.css";

const VerifyOTP = () => {
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(window.location.search);
  const mode = searchParams.get("mode") || "register"; // 'register' or 'reset'

  // Fix: get email from correct localStorage key based on mode
  const email = mode === "reset"
    ? localStorage.getItem("reset_email")
    : localStorage.getItem("registered_email");

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error("Email not found. Please restart the process.");
      navigate(mode === "reset" ? "/forgot-password" : "/register");
    }
  }, [email, navigate, mode]);

  const handleChange = (element, index) => {
    const value = element.value.replace(/\D/, "");
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (index < 5 && value) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      return toast.error("Please enter a valid 6-digit code.");
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/accounts/verify-otp/", {
        email,
        otp: otpCode,
        mode, // 'register' or 'reset'
      });

      toast.success(response.data.message || "OTP verified.");

      if (mode === "reset") {
        navigate("/reset-password", { state: { email } });
      } else {
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const endpoint =
        mode === "reset"
          ? "/accounts/password-reset/request/"
          : "/accounts/register/";
      await axiosInstance.post(endpoint, { email });
      toast.success("A new OTP has been sent to your email.");
    } catch {
      toast.error("Failed to resend OTP. Try again later.");
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-wrapper">
        <div className="otp-image">
          <img src={otpImage} alt="OTP Visual" />
        </div>

        <div className="otp-form-card">
          <h2>{mode === "reset" ? "Reset Password" : "Verify Account"}</h2>

          <div className="otp-steps">
            <div className={`otp-step ${mode === "reset" ? "done" : "active"}`}>
              <div className="circle">1</div>
              <span>Email</span>
            </div>
            <div className="otp-line highlight" />
            <div className="otp-step active">
              <div className="circle">2</div>
              <span>Verify</span>
            </div>
            <div className="otp-line" />
            <div className="otp-step">
              <div className="circle">3</div>
              <span>{mode === "reset" ? "Reset" : "Done"}</span>
            </div>
          </div> 

          <p className="otp-desc">
            We’ve sent a 6-digit code to <b>{email}</b>
          </p>

          <form onSubmit={handleSubmit} className="otp-input-form">
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleBackspace(e, index)}
                  ref={(el) => (inputsRef.current[index] = el)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          <div className="otp-resend">
            Didn’t receive a code?
            <span
              onClick={handleResend}
              role="button"
              tabIndex={0}
              style={{
                cursor: "pointer",
                color: "#007bff",
                marginLeft: "5px",
              }}
            >
              Resend
            </span>
          </div>

          <div className="otp-bottom">
            Remember your password? <a href="/login">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
