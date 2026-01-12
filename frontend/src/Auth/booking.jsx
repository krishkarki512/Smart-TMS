import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import "../styles/booking.css";
import { Download, XCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get("/payments/bookings/");
        setBookings(response.data.results || []);
      } catch (err) {
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleDownloadInvoice = async (id) => {
    try {
      const response = await axiosInstance.get(`/payments/bookings/${id}/download-invoice/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Failed to download invoice.");
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await axiosInstance.post(`/payments/bookings/${id}/cancel/`);
      toast.success("Booking canceled successfully.");
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "canceled" } : b))
      );
    } catch (err) {
      toast.error("Failed to cancel booking.");
    }
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>
      {bookings.length === 0 && <p>No bookings found.</p>}
      {bookings.map((booking) => {
        const deal = booking.travel_deal || {};
        return (
          <div className="booking-card" key={booking.id}>
            <div className="booking-img">
              <img
                src={deal.image || "/default-image.jpg"}
                alt={deal.title || "Booking"}
                style={{ width: 150, height: 100, objectFit: "cover" }}
              />
            </div>
            <div className="booking-info">
              <h3>
                <Link
                  to={`/destinations/${booking.travel_deal?.country?.slug}/deal/${booking.travel_deal?.slug}`}
                  className="deal-link"
                >
                  {booking.travel_deal?.title || "Untitled Deal"}
                </Link>
              </h3>
              <p className="order-id">
                Order ID: <span>{booking.id}</span>
              </p>
              <p className="purchase-date">
                🗓️ Purchased:{" "}
                <span>{new Date(booking.created_at).toLocaleDateString()}</span>
              </p>
              <p className="booking-price">
                {booking.payment_amount
                  ? `$${booking.payment_amount}`
                  : "Price not available"}
              </p>
              <div className="booking-actions">
                {booking.status !== "canceled" && (
                  <button
                    className="download-btn"
                    onClick={() => handleDownloadInvoice(booking.id)}
                  >
                    <Download size={16} /> Download Invoice
                  </button>
                )}
                {booking.status !== "canceled" && booking.status !== "completed" && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelBooking(booking.id)}
                    style={{
                      marginLeft: "10px",
                      backgroundColor: "#f44336",
                      color: "white",
                    }}
                  >
                    <XCircle size={16} /> Cancel Booking
                  </button>
                )}
                {booking.status === "pending" && (
                  <Link
                    to={`/payment/payment2/${booking.id}`}
                    className="complete-booking-btn"
                    style={{
                      marginLeft: "10px",
                      backgroundColor: "#4caf50",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    Complete Booking →
                  </Link>
                )}
                {booking.status === "canceled" && (
                  <span
                    style={{ color: "red", fontWeight: "bold", marginLeft: "10px" }}
                  >
                    Booking Canceled
                  </span>
                )}
              </div>
            </div>
            <div className="booking-status">
              <span
                className={`status ${
                  booking.status === "confirmed" ? "confirmed" : "pending"
                }`}
              >
                {booking.status}
              </span>
              <button
                className="see-details-btn"
                onClick={() => navigate(`/bookings/${booking.id}`)}
              >
                See Details <span>→</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyBookings;
