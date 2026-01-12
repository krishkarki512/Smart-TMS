import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const WeatherForecastInline = ({ city }) => {
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getTempIcon = (tempC) => {
    if (tempC < 10) return "🥶";
    if (tempC < 25) return "🌤️";
    return "🔥";
  };

  const toCelsius = (kelvin) => (kelvin - 273.15).toFixed(1);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.post("utils/weather-forecast/", {
          city: city.trim(),
        });
        setForecast(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch weather.");
        setForecast(null);
      } finally {
        setLoading(false);
      }
    };

    if (city?.trim()) fetchForecast();
  }, [city]);

  if (!city) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h4>🌦️ Weather Forecast for {city}</h4>
      {loading ? (
        <p>Loading forecast...</p>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {forecast?.forecasts?.slice(0, 3).map((item, i) => {
            const tempC = parseFloat(toCelsius(item.temp));
            return (
              <div
                key={i}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: "1rem",
                  minWidth: 180,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <h6 style={{ marginBottom: 6 }}>{item.datetime}</h6>
                <p style={{ fontSize: "1.2rem", margin: "4px 0" }}>
                  {getTempIcon(tempC)} {tempC}°C
                </p>
                <p style={{ margin: 0 }}>{item.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeatherForecastInline;
