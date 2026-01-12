import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

const stripePromise = loadStripe("pk_test_51RhozD04WnqvgZDXXbFeCGU9sY4wPefwFc5jR4IFfOosH4BPJzxjiDhQWsfbUtpNTPN37VJLfLBJnh49XnbIh7OF00mpk0vAwJ");

const CheckoutForm = ({ amount, onSuccess, onError, disabled }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) {
      toast.warn("Please agree to the required terms before payment.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!stripe || !elements) return;

    try {
      const { data } = await axiosInstance.post(
        "/payments/stripe/create-intent/",
        { amount }
      );

      const clientSecret = data.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
        onError?.(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        const charges = result.paymentIntent.charges?.data || [];
        const chargeId = charges.length > 0 ? charges[0].id : result.paymentIntent.id;

        setSuccess("Payment successful!");
        onSuccess?.(chargeId);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      onError?.(msg);
    }

    setLoading(false);
  };

  return (
    <form className="stripe-form" onSubmit={handleSubmit} style={{ opacity: disabled ? 0.6 : 1 }}>
      <label htmlFor="card-element">Card details</label>
      <div style={{ background: '#fafbfc', borderRadius: '7px', padding: '12px', border: '1.5px solid #e0e0e0', marginBottom: '1rem' }}>
        <CardElement id="card-element" options={{ hidePostalCode: true, disabled }} />
      </div>
      <button type="submit" className="stripe-pay-btn" disabled={!stripe || loading || disabled}>
        <span className="stripe-icon" role="img" aria-label="Stripe">💳</span> {loading ? "Processing..." : `Pay $${amount}`}
      </button>
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: "10px" }}>{success}</div>}
    </form>
  );
};

const StripePayment = ({ amount, onSuccess, onError, disabled }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} disabled={disabled} />
  </Elements>
);

export default StripePayment;
