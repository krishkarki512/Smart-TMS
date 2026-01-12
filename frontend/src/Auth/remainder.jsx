import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance"; // your axios instance with auth token etc.
import "../styles/reamainder.css";
import { CalendarDays, Clock } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
    const navigate = useNavigate();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await axiosInstance.get("/payments/reminders/"); // adjust URL to match backend
        setReminders(res.data);
      } catch (err) {
        console.error("Failed to fetch reminders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();

    // Optionally: load email notification preference from localStorage
    const savedNotif = localStorage.getItem("emailNotif");
    if (savedNotif) setEmailNotif(savedNotif === "true");
  }, []);

  const toggleEmailNotif = () => {
    const newVal = !emailNotif;
    setEmailNotif(newVal);
    localStorage.setItem("emailNotif", newVal);
    // Optionally: send this preference to backend here
  };

  if (loading) return <p>Loading reminders...</p>;
  if (!reminders.length) return <p>No upcoming trips found.</p>;

  return (
    <div className="reminder-wrapper">
      <h2>Reminders & Upcoming Trips</h2>
      <p className="subtext">Your Next Adventure</p>

      {reminders.map((booking) => {
        const { id, travel_deal, date_option } = booking;
        const startDate = new Date(date_option.start_date);
        const endDate = new Date(date_option.end_date);

        // Calculate days left
        const today = new Date();
        const diffTime = startDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return (
          <div className="reminder-card" key={id}>
            <div className="reminder-img">
              <img
                src={travel_deal.image || "/default-image.jpg"}
                alt={travel_deal.title}
              />
            </div>
            <div className="reminder-info">
              <h3>{travel_deal.title}</h3>
              <p className="reminder-dates">
                <CalendarDays size={16} />{" "}
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </p>
              <div className="reminder-countdown">
                <Clock size={16} />
                <span>
                  {diffDays > 0
                    ? `${diffDays} days left until your trip!`
                    : "Your trip is starting soon!"}
                </span>
              </div>
            </div>
            <div className="reminder-actions">
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

      <div className="email-reminder">
        <h4>Travel Reminder</h4>
        <div className="email-toggle">
          <div>
            <strong>Email Notifications</strong>
            <p>Receive trip reminders via email</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={toggleEmailNotif}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </div>
  );
}
