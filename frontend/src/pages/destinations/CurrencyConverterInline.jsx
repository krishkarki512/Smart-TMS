import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function CurrencyConverterInline({ fromCurrency, toCurrency }) {
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [direction, setDirection] = useState({ from: fromCurrency.toUpperCase(), to: toCurrency.toUpperCase() });

  const isSameCurrency = direction.from === direction.to;

  const handleConvert = async () => {
    setError(null);
    setResult(null);
    setRate(null);

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (isSameCurrency) {
      setResult(amount);
      setRate(1);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("utils/exchange-rate/", {
        amount: Number(amount),
        from_currency: direction.from,
        to_currency: direction.to,
      });
      setResult(response.data.result);
      setRate(response.data.rate);
    } catch (err) {
      setError(err.response?.data?.error || "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  const flipCurrencies = () => {
    setDirection({ from: direction.to, to: direction.from });
    setResult(null);
    setRate(null);
    setError(null);
    setAmount("");
  };

  return (
    <div
      style={{
        maxWidth: 350,
        margin: "2rem auto",
        padding: 20,
        borderRadius: 12,
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
      }}
    >
      <h3 style={{ marginBottom: 16, fontWeight: "600", fontSize: "1.5rem", textAlign: "center" }}>
        Currency Converter
      </h3>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          fontSize: "1.1rem",
          fontWeight: "500",
          userSelect: "none",
        }}
      >
        <span>
          From: <strong>{direction.from}</strong>
        </span>
        <button
          onClick={flipCurrencies}
          style={{
            cursor: "pointer",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: "50%",
            width: 32,
            height: 32,
            fontSize: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 2px 6px rgba(0,123,255,0.5)",
            transition: "background-color 0.3s ease",
          }}
          aria-label="Flip currencies"
          title="Flip currencies"
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0056b3")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#007bff")}
        >
          🔄
        </button>
        <span>
          To: <strong>{direction.to}</strong>
        </span>
      </div>

      <input
        type="number"
        min="0"
        step="any"
        placeholder={`Amount in ${direction.from}`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          width: "100%",
          padding: "0.6rem 1rem",
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: "1rem",
          outlineColor: "#007bff",
          boxSizing: "border-box",
          marginBottom: 16,
        }}
      />

      <button
        onClick={handleConvert}
        disabled={loading || !amount}
        style={{
          width: "100%",
          padding: "0.7rem 0",
          borderRadius: 8,
          border: "none",
          backgroundColor: loading || !amount ? "#a0c8ff" : "#007bff",
          color: "white",
          fontWeight: "600",
          fontSize: "1rem",
          cursor: loading || !amount ? "not-allowed" : "pointer",
          boxShadow: loading || !amount ? "none" : "0 3px 8px rgba(0,123,255,0.6)",
          transition: "background-color 0.3s ease",
        }}
      >
        {loading ? "Converting..." : "Convert"}
      </button>

      {error && (
        <p
          style={{
            marginTop: 16,
            color: "#d93025",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}

      {result !== null && (
        <div
          style={{
            marginTop: 20,
            backgroundColor: "#f1f5f9",
            padding: 16,
            borderRadius: 8,
            textAlign: "center",
            boxShadow: "inset 0 0 5px rgba(0,0,0,0.05)",
          }}
        >
          <p style={{ fontSize: "1.3rem", fontWeight: "700", margin: 0 }}>
            Result: <span style={{ color: "#007bff" }}>{result}</span> {direction.to}
          </p>
          <small style={{ color: "#555" }}>
            Exchange Rate: 1 {direction.from} = {rate} {direction.to}
          </small>
        </div>
      )}

      {isSameCurrency && !error && !loading && (
        <p style={{ marginTop: 20, color: "#555", textAlign: "center" }}>
          Both currencies are the same. Conversion rate is 1.
        </p>
      )}
    </div>
  );
}
