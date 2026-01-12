import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import "../styles/register.css";
import registerImg from "../assets/register.png";
import Modal from "./Modal"; // <-- NEW: Import Modal component

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // NEW: State for modal control
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  // Define your policy and terms content here
  const TERMS_CONTENT = `
    Welcome to Golden Leaf Travels! By registering, you agree to these Terms of Service. 
    You must be 18 years or older to create an account. You are responsible for maintaining the confidentiality of your password.
    We reserve the right to terminate accounts that violate our community guidelines. 
    All bookings are subject to our refund and cancellation policies detailed in the booking confirmation.
    Enjoy your journey with us!
  `;
  
  const POLICY_CONTENT = `
    Golden Leaf Travels is committed to protecting your privacy. We collect personal data (Name, Email) to process bookings and improve our services. 
    Your data is secured using encryption and is never shared with third parties without your explicit consent, except as required by law.
    We use cookies for site functionality and analytics. For more details, please contact our data privacy officer.
  `;

  const openModal = (type) => (e) => {
    e.preventDefault(); // Prevent navigation
    if (type === 'terms') {
      setModalTitle("Terms of Service");
      setModalContent(TERMS_CONTENT);
    } else if (type === 'policy') {
      setModalTitle("Privacy Policy");
      setModalContent(POLICY_CONTENT);
    }
    setModalOpen(true);
  };
  
  const closeModal = () => {
    setModalOpen(false);
    setModalTitle("");
    setModalContent("");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password) {
      toast.error("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!agree) {
      toast.error("Please agree to the terms first.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/accounts/register/", {
        username,
        email,
        password,
        password2: confirmPassword,
      });

      localStorage.setItem("registered_email", email);
      toast.success("Registration successful! Check your email for OTP.");
      navigate("/verify-otp?mode=register");
    } catch (error) {
      const msg =
        error.response?.data
          ? Object.values(error.response.data).flat().join(" ")
          : "Registration failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/accounts/google-login/", {
        token: credentialResponse.credential,
      });
      const { access, refresh } = res.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      axiosInstance.defaults.headers.Authorization = `Bearer ${access}`;

      toast.success("Signed up with Google!");
      navigate("/");
    } catch {
      toast.error("Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="reg-container">
        <div className="reg-wrapper">
          <div className="reg-image">
            <img src={registerImg} alt="Register" />
          </div>

          <div className="reg-form">
            <h2>Golden Leaf Travels</h2>
            <p className="reg-sub">Join us today</p>

            <div className="reg-google">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google signup failed")}
              />
            </div>

            <div className="reg-separator">or</div>

            <form onSubmit={handleSubmit}>
              <div className="reg-input-group">
                <FaUser className="reg-icon" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Username"
                />
              </div>

              <div className="reg-input-group">
                <FaEnvelope className="reg-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email Address"
                />
              </div>

              <div className="reg-input-group">
                <FaLock className="reg-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="reg-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="reg-input-group">
                <FaLock className="reg-icon" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  className="reg-eye"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Terms and Privacy - UPDATED onClick HANDLERS */}
              <div className="reg-terms">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={() => setAgree(!agree)}
                  id="agreeTerms"
                  className="reg-checkbox"
                />
                <label htmlFor="agreeTerms" className="reg-terms-text">
                  I agree to the{" "}
                  <a href="#" className="reg-link" onClick={openModal('terms')}>
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="reg-link" onClick={openModal('policy')}>
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              <button type="submit" disabled={loading || !agree} className="reg-btn">
                {loading ? "Registering..." : "Create Account"}
              </button>
            </form>

            <p className="reg-bottom">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* NEW: Modal Rendering */}
      <Modal 
        isOpen={modalOpen} 
        onClose={closeModal} 
        title={modalTitle}
      >
        {modalContent}
      </Modal>
    </>
  );
};

export default Register;