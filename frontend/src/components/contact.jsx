import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance"; // Adjust path as needed
import "../styles/contactus.css";

const SUBJECTS = [
  "General Inquiry",
  "Support",
  "Feedback",
  "Partnership",
  "Other"
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: SUBJECTS[0],
    message: "",
    consent: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.message.trim() || !form.consent) {
      setError("Please fill all required fields and accept the privacy policy.");
      return;
    }

    // Prepare payload matching backend model fields
    const payload = {
      full_name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message
    };

    try {
      const response = await axiosInstance.post("contacts/messages/", payload);
      if (response.status === 201) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } catch (err) {
      // If backend returns validation errors, display them
      if (err.response?.data) {
        const errors = err.response.data;
        // Extract first error message
        const firstError = Object.values(errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError("Network error. Please try again later.");
      }
    }
  };

  if (submitted) {
    return (
      <div className="contact-container">
        <div className="contact-card contact-success">
          <h2 className="contact-title">Thank You!</h2>
          <p>Your message has been sent. We'll get back to you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-container">
      <div className="contact-card">
        <h2 className="contact-title">Contact Us</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-row">
            <div className="contact-field">
              <label htmlFor="name">Name<span>*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
            <div className="contact-field">
              <label htmlFor="email">Email<span>*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>
          <div className="contact-row">
            <div className="contact-field">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                placeholder="Optional"
              />
            </div>
            <div className="contact-field">
              <label htmlFor="subject">Subject</label>
              <select
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
              >
                {SUBJECTS.map((subj) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="contact-field">
            <label htmlFor="message">Message<span>*</span></label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>
          <div className="contact-field contact-checkbox">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              checked={form.consent}
              onChange={handleChange}
              required
            />
            <label htmlFor="consent">
              I agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a> <span>*</span>
            </label>
          </div>
          {error && <div className="contact-error">{error}</div>}
          <button className="contact-submit" type="submit">Send Message</button>
        </form>
      </div>
    </div>
  );
}
