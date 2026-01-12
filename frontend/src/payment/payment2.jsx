import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import StepIndicator from "../components/StepIndicator";
import "../payment/payment2.css";

export default function Payment2() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [roomOption, setRoomOption] = useState("");
  const [addTransfer, setAddTransfer] = useState(false);
  const [addNights, setAddNights] = useState(false);
  const [flightHelp, setFlightHelp] = useState(false);
  const [donation, setDonation] = useState(false);

  const [showLateModal, setShowLateModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        setLoading(true);
        setError(null);
        const resp = await axiosInstance.get(`/payments/bookings/${id}/`);
        setBooking(resp.data);

        setRoomOption(resp.data.room_option || "shared");
        setAddTransfer(resp.data.add_transfer || false);
        setAddNights(resp.data.add_nights || false);
        setFlightHelp(resp.data.flight_help || false);
        setDonation(resp.data.donation || false);
      } catch (err) {
        setError("Failed to load booking data.");
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [id]);

  const handleContinue = async () => {
    try {
      const updateData = {
        room_option: roomOption,
        add_transfer: addTransfer,
        add_nights: addNights,
        flight_help: flightHelp,
        donation: donation,
      };

      await axiosInstance.patch(`/payments/bookings/${id}/update/`, updateData);

      const extrasForState = {
        roomOption,
        addTransfer,
        addNights,
        flightHelp,
        donation,
        numTravellers,
      };

      navigate(`/payment/payment3/${id}`, {
        state: { extras: extrasForState },
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(
        `Failed to save your extras: ${
          err.response?.data?.error || JSON.stringify(err.response?.data) || "Please try again."
        }`
      );
    }
  };

  if (loading) return <div>Loading booking details...</div>;
  if (error)
    return (
      <div style={{ color: "red" }} role="alert">
        {error}
      </div>
    );
  if (!booking) return <div>No booking found.</div>;

  const travelDeal = booking?.travel_deal || {};
  const dateOption = booking?.date_option || {};
  const numTravellers = booking?.travellers || 1;

  const tripCost = parseFloat(dateOption.discounted_price) || 0;
  const roomPricePerTraveller = 345;
  const roomCost = roomOption === "private" ? roomPricePerTraveller * numTravellers : 0;
  const donationCost = donation ? 23 : 0;
  const totalCost = (tripCost + roomCost + donationCost).toFixed(2);

  return (
    <div className="payment-container">
      <StepIndicator current={1} steps={["Your details", "Trip extras", "Payment"]} />
      <h2 className="trip-title">Trip Extras</h2>

      <div className="payment-grid">
        {/* LEFT SIDE */}
        <div className="left-column">
          <div
            className="notice-box late-request"
            role="button"
            tabIndex={0}
            onClick={() => setShowLateModal(true)}
          >
            <div className="icon">i</div>
            <div className="notice-content">
              <strong>Late request</strong>
              <p>
                For bookings close to departure date, full payment is required
                to request your place with our local operators. This usually
                takes 2 - 4 business days, but may take longer due to high
                demand.
              </p>
              <p>
                Please wait for confirmation before booking flights or
                non-refundable travel arrangements.
              </p>
            </div>
          </div>

          <div className="room-options">
            <h3>Room options</h3>
            <form className="option-group">
              <label className="option-label">
                <input
                  type="radio"
                  name="room"
                  value="private"
                  checked={roomOption === "private"}
                  onChange={(e) => setRoomOption(e.target.value)}
                />
                <span className="option-text">
                  Private room ({numTravellers} traveller{numTravellers > 1 ? "s" : ""}) (+$
                  {(roomPricePerTraveller * numTravellers).toFixed(2)})
                </span>
              </label>

              <label className="option-label">
                <input
                  type="radio"
                  name="room"
                  value="shared"
                  checked={roomOption === "shared"}
                  onChange={(e) => setRoomOption(e.target.value)}
                />
                <span className="option-text">Shared (no extra cost)</span>
              </label>
            </form>
          </div>

          <div className="prepost-section">
            <h3>Pre & post-trip extras</h3>
            <button
              className="extras-btn"
              type="button"
              onClick={() => setAddTransfer((prev) => !prev)}
            >
              🚌 {addTransfer ? "✔" : ""} Add transfers
            </button>
            <button
              className="extras-btn"
              type="button"
              onClick={() => setAddNights((prev) => !prev)}
            >
              🏨 {addNights ? "✔" : ""} Add extra nights
            </button>
          </div>

          <div className="additional-services">
            <label className="option-label">
              <input
                type="checkbox"
                checked={flightHelp}
                onChange={(e) => setFlightHelp(e.target.checked)}
              />
              <span className="option-text">Contact me about flights</span>
            </label>
          </div>

          <div className="donation-box">
            <label className="option-label">
              <input
                type="checkbox"
                checked={donation}
                onChange={(e) => setDonation(e.target.checked)}
              />
              <span className="option-text">Yes, add $23 donation</span>
            </label>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="right-column">
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="trip-name">{travelDeal.title || "Trip name"}</div>
            <div className="duration">
              {travelDeal.days ? `${travelDeal.days} days` : ""}
            </div>
            <div className="details">
              <p>
                <strong>Start</strong>
                <br />
                {dateOption.start_date
                  ? new Date(dateOption.start_date).toLocaleDateString()
                  : "N/A"}
              </p>
              <p>
                <strong>Finish</strong>
                <br />
                {dateOption.end_date
                  ? new Date(dateOption.end_date).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="total">
              <span>Trip cost</span>
              <span>
                <strong>${tripCost.toFixed(2)}</strong>
              </span>
            </div>
            {roomOption === "private" && (
              <div className="total">
                <span>
                  Private room ({numTravellers} traveller{numTravellers > 1 ? "s" : ""})
                </span>
                <span>+ ${(roomPricePerTraveller * numTravellers).toFixed(2)}</span>
              </div>
            )}
            {donation && (
              <div className="total">
                <span>Donation</span>
                <span>+ $23</span>
              </div>
            )}
            <hr />
            <div className="total">
              <span>
                <strong>Total Payment</strong>
              </span>
              <span>
                <strong>${totalCost}</strong>
              </span>
            </div>
            <div
              className="how-to-credit"
              onClick={() => setShowCreditModal(true)}
            >
              ⓘ How to redeem credit
            </div>
          </div>
        </div>
      </div>

      <div className="nav-buttons">
        <button className="back-btn" type="button" onClick={() => navigate(-1)}>
          Back
        </button>
        <button
          className="continue-btn"
          type="button"
          disabled={loading}
          onClick={handleContinue}
        >
          Continue →
        </button>
      </div>

      <footer className="footer-links">
        <span>Privacy</span>
        <span>Booking conditions</span>
        <span>Data collection notice</span>
      </footer>

      {/* LATE MODAL */}
      {showLateModal && (
        <div className="modal" onClick={() => setShowLateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Late request</h4>
            <p>
              For bookings close to departure date, full payment is required to
              request your place with our local operators. This usually takes 2
              - 4 business days, but may take longer due to high demand.
            </p>
            <p>
              Please wait for confirmation before booking flights or
              non-refundable travel arrangements.
            </p>
            <button type="button" onClick={() => setShowLateModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* CREDIT MODAL */}
      {showCreditModal && (
        <div className="modal" onClick={() => setShowCreditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>How to redeem credit</h4>
            <p>Select “Use Credit” on payment page before finalizing payment.</p>
            <button type="button" onClick={() => setShowCreditModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
