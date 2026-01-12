import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const VisaCheckerInline = ({ nationality, destination }) => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      !nationality ||
      !destination ||
      nationality.length !== 2 ||
      destination.length !== 2
    ) {
      setResult(null);
      setError("");
      return;
    }

    const fetchVisaInfo = async () => {
      setLoading(true);
      setError("");
      setResult(null);
      try {
        const res = await axiosInstance.post("utils/visa-checker/", {
          nationality: nationality.toUpperCase().trim(),
          destination: destination.toUpperCase().trim(),
        });
        setResult(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch visa info.");
      } finally {
        setLoading(false);
      }
    };

    fetchVisaInfo();
  }, [nationality, destination]);

  if (!nationality || !destination) return null;

  return (
    <div className="visa-checker-widget my-5" style={{ flex: 1 }}>
      <h4 style={{ marginBottom: "1rem" }}>🛂 Visa Checker</h4>
      {loading ? (
        <p>Checking visa info...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : result ? (
        <div className="card p-3" style={{ background: "#fff", borderRadius: "8px" }}>
          <h6 style={{ marginBottom: "0.5rem" }}>
            {result.passport.name} ({result.passport.code}) →{" "}
            {result.destination.name} ({result.destination.code})
          </h6>
          <p>
            <strong>Visa Type:</strong> {result.category.name} ({result.category.code})
          </p>
          {result.category.code === "VF" && (
            <p>
              <strong>Allowed Duration:</strong> {result.dur} days
            </p>
          )}
          <small className="text-muted">
            Last Updated: {new Date(result.last_updated).toLocaleDateString()}
          </small>
        </div>
      ) : (
        <p>No visa information available.</p>
      )}
    </div>
  );
};

export default VisaCheckerInline;
