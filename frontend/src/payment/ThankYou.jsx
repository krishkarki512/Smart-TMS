import React from "react";
import { useNavigate } from "react-router-dom";

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: "40px 20px",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#fff",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow-light)",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          color: "var(--primary-color)",
          fontFamily: "var(--title-font)",
          marginBottom: "20px",
        }}
      >
        Thank You!
      </h1>

      <p style={{ color: "var(--text-color)", marginBottom: "20px" }}>
        Your booking is confirmed. We will email you the details shortly.
      </p>

      {/* Invoice Section */}
      <div
        style={{
          border: "1px solid var(--highlight-color)",
          borderRadius: "var(--radius)",
          padding: "20px",
          marginBottom: "30px",
          textAlign: "left",
        }}
      >
        <h2 style={{ color: "var(--primary-dark)", marginBottom: "10px" }}>
          Booking Invoice
        </h2>
        <p><strong>Booking ID:</strong> #TRVL-20250717</p>
        <p><strong>Name:</strong> John Doe</p>
        <p><strong>Destination:</strong> Everest Base Camp</p>
        <p><strong>Total Paid:</strong> $1,250</p>
        <p><strong>Date:</strong> July 17, 2025</p>
      </div>

      {/* Go to Home Button */}
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "12px 24px",
          backgroundColor: "var(--primary-color)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius)",
          cursor: "pointer",
          transition: "var(--transition)",
        }}
      >
        Go to Home
      </button>
    </div>
  );
}
