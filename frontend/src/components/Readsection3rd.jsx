import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/read.css";

export default function Readsection3rd() {
  const { t } = useTranslation();

  return (
    <section className="read-more-section">
      <h2 className="read-more-title">
        <br />
        {t("small_group_trips")}
      </h2>

      <div className="read-boxes-columns">
        <div className="read-box">
          <p>
            {t("experiences_1000s")}<br />
            {t("over_100_countries")}
          </p>
        </div>

        <div className="read-box middle-box">
          <p>
            {t("shared_adventures")}<br />{t("with")}<br />{t("like_minded_people")}
          </p>
        </div>

        <div className="read-box">
          <p>
            {t("creating_positive")}<br />{t("change")}<br />{t("since_1989")}
          </p>
        </div>
      </div>
    </section>
  );
}
