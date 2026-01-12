import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { FaChevronDown, FaInfo } from "react-icons/fa";
import { BsFillPersonFill } from "react-icons/bs";
import StepIndicator from "../components/StepIndicator";
import Select from "react-select";
import countryList from "react-select-country-list";
import "../payment/payment1.css";

export default function Payment1() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const countrySlug = queryParams.get("country");
  const dealSlug = queryParams.get("deal");
  const dateId = queryParams.get("date");

  const [travellers, setTravellers] = useState(1);
  const [roomOption, setRoomOption] = useState("shared");
  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [town, setTown] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState(null); // react-select object

  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showPrimaryModal, setShowPrimaryModal] = useState(false);
  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);

  const [dealData, setDealData] = useState(null);
  const [dateOptionData, setDateOptionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get country options once
  const options = useMemo(() => countryList().getData(), []);

  useEffect(() => {
    async function fetchData() {
      if (!countrySlug || !dealSlug || !dateId) {
        setError("Missing deal or date selection.");
        return;
      }
      try {
        setLoading(true);
        const dealResp = await axiosInstance.get(
          `/destinations/countries/${countrySlug}/travel-deals/${dealSlug}/`
        );
        setDealData(dealResp.data);

        const dateResp = await axiosInstance.get(
          `/destinations/countries/${countrySlug}/travel-deals/${dealSlug}/dates/${dateId}/`
        );
        setDateOptionData(dateResp.data);
      } catch (err) {
        setError("Failed to load deal data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [countrySlug, dealSlug, dateId]);

  const capacity = dateOptionData?.capacity ?? 0;
  const canBook = capacity > 0 && travellers <= capacity;

  const handleCountryChange = (selectedOption) => {
    setCountry(selectedOption);
  };

  const handleContinue = async (e) => {
    e.preventDefault();

    if (!dealData || !dateOptionData) {
      setError("Deal or date option not loaded.");
      return;
    }

    if (
      !title ||
      !firstName ||
      !lastName ||
      !dob ||
      !email ||
      !phone ||
      !address1 ||
      !town ||
      !state ||
      !postcode ||
      !country?.label
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!canBook) {
      setError(
        `Cannot book ${travellers} traveller${
          travellers > 1 ? "s" : ""
        }. Only ${capacity} place${capacity !== 1 ? "s" : ""} remaining.`
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        travel_deal_id: dealData.id,
        date_option_id: dateOptionData.id,
        full_name: `${title} ${firstName} ${
          middleName ? middleName + " " : ""
        }${lastName}`,
        dob,
        email,
        phone,
        address_line1: address1,
        address_line2: address2,
        town,
        state,
        postcode,
        country: country.label, // send country full name
        travellers,
        room_option: roomOption,
      };

      const response = await axiosInstance.post(
        "/payments/bookings/create/",
        payload
      );
      const booking = response.data;
      navigate(`/payment/payment2/${booking.id}`, { state: { booking } });
    } catch (err) {
      setError("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error)
    return <div style={{ color: "red", marginBottom: 10 }}>{error}</div>;

  return (
    <div className="traveller-container">
      <StepIndicator
        current={0}
        steps={["Your details", "Trip extras", "Payment"]}
      />
      <div className="main-content">
        <div className="left-section">
          <h2>Traveller details</h2>

          <div className="late-request-box">
            <div className="late-request-icon">i</div>
            <div className="late-request-content">
              <h6>Late request</h6>
              <p>
                For bookings close to departure date, full payment is required.
                This usually takes 2 to 4 business days.
              </p>
              <p>
                Please wait for confirmation before booking flights or
                non-refundable travel arrangements.
              </p>
            </div>
          </div>

          {capacity !== undefined ? (
            capacity > 0 && capacity < 10 ? (
              <div className="notice-box selling-fast">
                <div className="icon">i</div>
                <div className="notice-content">
                  This departure is selling fast, only{" "}
                  <strong>{capacity}</strong> place
                  {capacity > 1 ? "s" : ""} remaining.
                </div>
              </div>
            ) : capacity === 0 ? (
              <div className="notice-box sold-out">
                <div className="icon">!</div>
                <div className="notice-content">
                  Sorry, this departure is fully booked.
                </div>
              </div>
            ) : null
          ) : null}

          <div className="traveller-counter">
            <label>How many travellers?</label>
            <div className="counter-buttons">
              <button
                onClick={() => setTravellers(Math.max(1, travellers - 1))}
              >
                -
              </button>
              <span>{travellers}</span>
              <button onClick={() => setTravellers(travellers + 1)}>+</button>
            </div>
          </div>

          <h3 className="traveller-heading">
            <BsFillPersonFill /> 1. Primary traveller details
            <span
              className="info-icon"
              onClick={() => setShowPrimaryModal(true)}
            >
              ⓘ
            </span>
          </h3>

          <form className="form-box traveller-form" onSubmit={handleContinue}>
            <h4>Personal details</h4>

            <div className="title-group-modern">
              <div className="title-select-container">
                <label>Title *</label>
                <select
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Mr</option>
                  <option>Ms</option>
                  <option>Mrs</option>
                </select>
              </div>
              <div className="title-info" onClick={() => setShowWhyModal(true)}>
                <FaInfo size={14} />
                <span>Why do we need this?</span>
              </div>
            </div>

            <input
              type="text"
              placeholder="First name*"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Middle name"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last name*"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <label>Date of birth *</label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />

            <h4>Contact details</h4>
            <input
              type="email"
              placeholder="Email *"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Contact number *"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="text"
              placeholder="Address line 1 *"
              required
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
            />
            <input
              type="text"
              placeholder="Address line 2"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
            />
            <input
              type="text"
              placeholder="Suburb / Town *"
              required
              value={town}
              onChange={(e) => setTown(e.target.value)}
            />
            <input
              type="text"
              placeholder="State / Province *"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <input
              type="text"
              placeholder="Postcode / Zip *"
              required
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />

            {/* Country dropdown */}
            <label>Country *</label>
            <Select
              options={options}
              value={country}
              onChange={handleCountryChange}
              placeholder="Select a country"
              isClearable
              classNamePrefix="react-select"
            />

            <h4>Room Option</h4>
            <select
              value={roomOption}
              onChange={(e) => setRoomOption(e.target.value)}
            >
              <option value="shared">Shared</option>
              <option value="private">Private</option>
            </select>

            <div className="deposit-section">
              <h4>
                <span className="deposit-icon">💳</span> Deposit
              </h4>
              <p>
                Lock in your trip with a deposit if it departs 30+ days from
                now. Read <a href="#">booking conditions</a>.
              </p>
              <p className="privacy-text">
                Please see our <a href="#">Privacy and Collection notice</a>.
              </p>
              <button
                className="continue-button"
                type="submit"
                disabled={loading || !canBook}
              >
                {loading ? "Submitting..." : "Continue →"}
              </button>
              {travellers > capacity && (
                <p style={{ color: "red", marginTop: "8px" }}>
                  Only {capacity} place{capacity !== 1 ? "s" : ""} remaining,
                  please adjust the number of travellers.
                </p>
              )}
            </div>
          </form>

          <div className="footer-links">
            <span>Privacy</span>
            <span>Booking conditions</span>
            <span>Data collection notice</span>
          </div>
        </div>

        <div className="right-section">
          {dealData && dateOptionData ? (
            <div className="booking-summary">
              <h4>Booking summary</h4>
              <h3>{dealData.title}</h3>
              <p>{dealData.days} days</p>

              <div className="trip-dates">
                <p>
                  <strong>Start</strong>
                  <br />
                  {new Date(dateOptionData.start_date).toLocaleDateString()}
                  <br />
                  {dealData.country.name.toUpperCase()}
                </p>
                <p>
                  <strong>Finish</strong>
                  <br />
                  {new Date(dateOptionData.end_date).toLocaleDateString()}
                  <br />
                  {dealData.country.name.toUpperCase()}
                </p>
              </div>

              <div
                className="price-header"
                onClick={() => setShowTravellerDropdown(!showTravellerDropdown)}
              >
                <p>Trip</p>
                <p>
                  <FaChevronDown />
                </p>
              </div>

              {showTravellerDropdown && (
                <div className="dropdown-content">
                  <p>
                    Total for {travellers} traveller{travellers > 1 ? "s" : ""}:
                    USD $
                    {(
                      parseFloat(
                        dateOptionData.discounted_price.replace("€", "").trim()
                      ) * travellers
                    ).toFixed(2)}
                  </p>
                </div>
              )}

              <hr />
              <h4>
                Total USD $
                {(
                  parseFloat(
                    dateOptionData.discounted_price.replace("€", "").trim()
                  ) * travellers
                ).toFixed(2)}
              </h4>
              <p
                className="credit-info"
                onClick={() => setShowCreditModal(true)}
              >
                ⓘ How to redeem credit
              </p>
            </div>
          ) : (
            <div>Loading booking summary...</div>
          )}
        </div>
      </div>

      {showWhyModal && (
        <div className="modal">
          <div className="modal-content">
            <h4>Why do we need this?</h4>
            <p>
              This helps us ensure names match official travel documents for
              booking accuracy.
            </p>
            <button onClick={() => setShowWhyModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showCreditModal && (
        <div className="modal">
          <div className="modal-content">
            <h4>How to redeem credit</h4>
            <p>
              You can redeem travel credit on the payment page by selecting “Use
              Credit”.
            </p>
            <button onClick={() => setShowCreditModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showPrimaryModal && (
        <div className="modal">
          <div className="modal-content">
            <h4>Primary Traveller Info</h4>
            <p>This information is required for booking and documentation.</p>
            <button onClick={() => setShowPrimaryModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
