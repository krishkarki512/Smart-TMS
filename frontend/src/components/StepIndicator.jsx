import React from "react";
import { FaCheck } from "react-icons/fa";
import "./StepIndicator.css";

export default function StepIndicator({ current = 0, steps }) {
  const labels = steps || ["Your details", "Trip extras", "Payment"];

  return (
    <div className="step-container">
      <div className="progress-line"></div>

      {labels.map((label, index) => {
        const status =
          index < current ? "done" : index === current ? "current" : "upcoming";

        return (
          <div className="step" key={index}>
            <div className={`circle ${status}`}>
              {status === "done" ? <FaCheck /> : index + 1}
            </div>
            <div className="label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
