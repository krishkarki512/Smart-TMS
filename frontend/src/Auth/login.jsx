import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import loginImg from "../assets/login.png";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/token/", formData);
      const { access, refresh } = res.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      axiosInstance.defaults.headers.Authorization = `Bearer ${access}`;
      toast.success("Login successful!");
      navigate("/");
    } catch {
      toast.error("Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (res) => {
    try {
      const response = await axiosInstance.post("/accounts/google-login/", {
        token: res.credential,
      });
      const { access, refresh } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      axiosInstance.defaults.headers.Authorization = `Bearer ${access}`;
      toast.success("Google Login Successful!");
      navigate("/");
    } catch {
      toast.error("Google login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-image">
          <img src={loginImg} alt="Login" />
        </div>

        <div className="auth-form">
          <h2 className="auth-title">Golden Leaf Travels</h2>
          <p className="auth-subtitle">Log in to continue</p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className={`auth-group ${formData.email ? "filled" : ""}`}>
              <span className="auth-icon">
                <FaEnvelope />
              </span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
                placeholder=" "
              />
              <label>Email</label>
            </div>

            {/* Password */}
            <div className={`auth-group ${formData.password ? "filled" : ""}`}>
              <span className="auth-icon">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                autoComplete="off"
                placeholder=" "
              />
              <label>Password</label>
              <span
                className="auth-eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="auth-forgot">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-google">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google login failed")}
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="auth-footer">
            Don’t have an account? <Link to="/register">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
