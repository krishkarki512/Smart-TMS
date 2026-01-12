import React from "react";
import "../styles/Whygolden.css";
import img2 from "../assets/217870.jpg";
import { useNavigate } from "react-router-dom";

import { GoPeople } from "react-icons/go";
import { CiMap, CiStar } from "react-icons/ci";
import { LuLeaf } from "react-icons/lu";
import { useTranslation } from "react-i18next";

export default function WhyGolden() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="why-golden-section">
      {/* ─── Heading ─── */}
      <h2 className="why-golden-title">{t("why_smart_tms")}</h2>
      <div className="why-golden-underline" />

      {/* ─── Text & Image Row ─── */}
      <div className="why-golden-container">
        <div className="why-golden-text">
          <h3 className="why-golden-subtitle">{t("crafting_journeys_since")}</h3>

          <p className="why-golden-description">{t("description_1")}</p>
          <p className="why-golden-description">{t("description_2")}</p>

          <button
            className="read-more-btn"
            onClick={() => navigate("/about")}
          >
            {t("read_more_about_story")}
          </button>
        </div>

        <div className="why-golden-image">
          <img src={img2} alt={t("why_smart_tms")} />
        </div>
      </div>

      {/* ─── Feature Cards with Decorative Lines ─── */}
      <div className="feature-wrapper">
        <div className="why-golden-features">
          <div className="feature-box">
            <div className="feature-header">
              <span className="icon-box">
                <GoPeople className="feature-icon" />
              </span>
              <h4 className="feature-title">{t("small_group_travel")}</h4>
            </div>
            <p className="feature-desc">{t("small_group_desc")}</p>
          </div>

          <div className="feature-box">
            <div className="feature-header">
              <span className="icon-box">
                <CiMap className="feature-icon" />
              </span>
              <h4 className="feature-title">{t("expert_local_guides")}</h4>
            </div>
            <p className="feature-desc">{t("expert_guides_desc")}</p>
          </div>

          <div className="feature-box">
            <div className="feature-header">
              <span className="icon-box">
                <CiStar className="feature-icon" />
              </span>
              <h4 className="feature-title">{t("unique_experiences")}</h4>
            </div>
            <p className="feature-desc">{t("unique_experiences_desc")}</p>
          </div>

          <div className="feature-box">
            <div className="feature-header">
              <span className="icon-box">
                <LuLeaf className="feature-icon" />
              </span>
              <h4 className="feature-title">{t("sustainable_tourism")}</h4>
            </div>
            <p className="feature-desc">{t("sustainable_tourism_desc")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
