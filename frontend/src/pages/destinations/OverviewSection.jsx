import React from "react";
import "../../pagescss/overview.css";

export default function OverviewSection({ data }) {
  const title = data?.section_title || "Overview";
  const description = data?.description || "No overview available for this destination yet.";

  return (
    <div id="overview" className="overview-section">
      <h2>{title}</h2>
      <div className="underline gold" />
      <p>{description}</p>
    </div>
  );
}
