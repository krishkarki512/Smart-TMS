import React from "react";
import "../styles/roof.css";
import img2 from "../assets/img2.jpg";
import { useTranslation } from "react-i18next";

export default function Roof() {
  const { t } = useTranslation();

  return (
    <section className="roof-section">
      <div className="roof-overlay" />

      <div className="roof-content">
        <div className="roof-text">
          <h2>{t("roof_heading")}</h2>
          <p>{t("roof_paragraph")}</p>
          <button className="roof-btn">{t("roof_btn")}</button>
        </div>

        <div className="roof-img-wrapper">
          <img src={img2} alt="Traveler" className="roof-img" />
        </div>
      </div>
    </section>
  );
}
