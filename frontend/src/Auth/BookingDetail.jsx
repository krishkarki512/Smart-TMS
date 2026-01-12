import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { Download } from "lucide-react";
import "../styles/bookingDetail.css";

const BookingDetail = () => {
  const { id } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [locationCoords, setLocationCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [tracking, setTracking] = useState(false);

  const sendingRef = useRef(false);
  const watchIdRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const paymentSuccess = queryParams.get("success") === "true";

  useEffect(() => {
    const savedLocation = localStorage.getItem("lastLocation");
    if (savedLocation) {
      setLocationCoords(JSON.parse(savedLocation));
    }

    const fetchBooking = async () => {
      try {
        const res = await axiosInstance.get(`/payments/bookings/${id}/`);
        setBooking(res.data);
      } catch {
        setError("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();

    return () => {
      stopLiveTracking();
    };
  }, [id]);

  const sendLocationToServer = (latitude, longitude) => {
    if (sendingRef.current) return;
    sendingRef.current = true;

    axiosInstance
      .post(`/payments/bookings/${id}/send-location/`, { latitude, longitude })
      .then(() =>
        setLocationStatus(`✅ Location sent at ${new Date().toLocaleTimeString()}`)
      )
      .catch(() => setLocationStatus("❌ Failed to send location."))
      .finally(() => {
        sendingRef.current = false;
      });
  };

  const startLiveTracking = () => {
    if (!navigator.geolocation) {
      setLocationStatus("❌ Geolocation is not supported.");
      return;
    }

    setTracking(true);
    setLocationStatus("📡 Tracking started. Waiting for location updates...");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { latitude, longitude };
        setLocationCoords(coords);
        localStorage.setItem("lastLocation", JSON.stringify(coords));
        sendLocationToServer(latitude, longitude);
      },
      (err) => {
        let message = "❌ Unable to retrieve location.";
        if (err.code === 1) message = "❌ Permission denied for location.";
        else if (err.code === 2) message = "❌ Position unavailable.";
        else if (err.code === 3) message = "❌ Timeout obtaining location.";
        setLocationStatus(message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    );
  };

  const stopLiveTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    setLocationStatus("⏹️ Tracking stopped.");
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await axiosInstance.get(
        `/payments/bookings/${id}/download-invoice/`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Failed to download invoice.");
    }
  };

  if (loading) return <div className="bd-loading">Loading booking details...</div>;
  if (error) return <div className="bd-alert bd-alert-error">{error}</div>;
  if (!booking) return <div className="bd-alert bd-alert-warning">Booking not found.</div>;

  const countrySlug = booking.travel_deal?.country?.slug?.toLowerCase() || "unknown";
  const dealSlug = booking.travel_deal?.slug || "unknown";

  return (
    <div className="bd-container">
      {paymentSuccess && (
        <div className="bd-alert bd-alert-success">
          <h4>Payment Successful!</h4>
          <p>Thank you for your booking. Here are your booking details.</p>
        </div>
      )}

      <div className="bd-grid-2col">
        {/* Left: Booking Info */}
        <div className="bd-card">
          <div className="bd-header">
            <h3 className="bd-title">{booking.travel_deal?.title || "Booking Details"}</h3>
            <Link
              to={`/destinations/${countrySlug}/deal/${dealSlug}`}
              target="_blank"
              className="bd-btn bd-btn-outline-info bd-btn-inline"
              rel="noopener noreferrer"
            >
              View Travel Deal
            </Link>
          </div>

          <section>
            <h5>Order Details</h5>
            <ul className="bd-list">
              <li><strong>Order ID:</strong> {booking.id}</li>
              <li><strong>Purchased:</strong> {new Date(booking.created_at).toLocaleDateString()}</li>
              <li><strong>Price Paid:</strong> ${booking.payment_amount}</li>
              <li>
                <strong>Status:</strong>{" "}
                <span className={`bd-badge ${booking.status === "confirmed" ? "bd-badge-success" : "bd-badge-warning"}`}>
                  {booking.status}
                </span>
              </li>
              <li><strong>Payment Status:</strong> {booking.payment_status}</li>
              <li><strong>Transaction ID:</strong> {booking.transaction_id || "N/A"}</li>
              <li><strong>Payment Date:</strong> {booking.payment_date ? new Date(booking.payment_date).toLocaleString() : "N/A"}</li>
            </ul>
          </section>

          <section>
            <h5>Traveller Info</h5>
            <ul className="bd-list">
              <li><strong>Name:</strong> {booking.full_name}</li>
              <li><strong>Email:</strong> {booking.email}</li>
              <li><strong>Phone:</strong> {booking.phone}</li>
              <li><strong>Address:</strong> {booking.address_line1} {booking.address_line2 || ""}</li>
              <li><strong>Town:</strong> {booking.town}</li>
              <li><strong>State:</strong> {booking.state}</li>
              <li><strong>Postcode:</strong> {booking.postcode}</li>
              <li><strong>Country:</strong> {booking.country}</li>
            </ul>
          </section>

          <section>
            <h5>Booking Details</h5>
            <ul className="bd-list">
              <li><strong>Travellers:</strong> {booking.travellers}</li>
              <li><strong>Room Option:</strong> {booking.room_option}</li>
              <li><strong>Transfer:</strong> {booking.add_transfer ? "Yes" : "No"}</li>
              <li><strong>Add Nights:</strong> {booking.add_nights ? "Yes" : "No"}</li>
              <li><strong>Flight Help:</strong> {booking.flight_help ? "Yes" : "No"}</li>
              <li><strong>Donation:</strong> {booking.donation ? "Yes" : "No"}</li>
              <li>
                <strong>Travel Dates:</strong>{" "}
                {booking.date_option
                  ? `${new Date(booking.date_option.start_date).toLocaleDateString()} - ${new Date(booking.date_option.end_date).toLocaleDateString()}`
                  : "N/A"}
              </li>
            </ul>
          </section>

          <button className="bd-btn-primary" onClick={handleDownloadInvoice}>
            <Download size={16} className="bd-icon" />
            Download Invoice
          </button>
        </div>

        {/* Right: Live Location Tracking */}
        {!paymentSuccess && (
          <div className="bd-card bd-location-card">
            <section>
              <h5>Live GPS Tracking</h5>
              <p style={{ fontStyle: "italic", color: "#555", marginBottom: "10px" }}>
                ⚠️ Live location tracking works only while this page is open and active in your browser.
              </p>

              {!tracking ? (
                <button className="bd-btn-outline-info" onClick={startLiveTracking}>
                  ▶️ Start Live Tracking
                </button>
              ) : (
                <button className="bd-btn-outline-danger" onClick={stopLiveTracking}>
                  🛑 Stop Live Tracking
                </button>
              )}

              {locationStatus && <p className="bd-location-status">{locationStatus}</p>}

              {locationCoords && (
                <>
                  <p className="bd-coordinates">
                    Latitude: {locationCoords.latitude}, Longitude: {locationCoords.longitude}
                  </p>
                  <iframe
                    title="Map Preview"
                    width="100%"
                    height="300"
                    loading="lazy"
                    style={{ borderRadius: "8px", marginTop: "10px" }}
                    src={`https://maps.google.com/maps?q=${locationCoords.latitude},${locationCoords.longitude}&z=15&output=embed`}
                  ></iframe>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetail;
