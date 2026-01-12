import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axiosInstance from "../utils/axiosInstance";

const PayPalPayment = ({ amount, onSuccess, onError, disabled }) => {
  const handleApprove = async (data, actions) => {
    try {
      const order = await actions.order.capture();
      const orderID = order.id;

      const res = await axiosInstance.post(
        "/payments/paypal/verify/",
        { orderID }
      );

      if (res.data.status === "success") {
        onSuccess(orderID);
      } else {
        onError("Payment verification failed");
      }
    } catch (err) {
      onError("Something went wrong during PayPal payment");
    }
  };

  if (disabled) {
    return (
      <div style={{ opacity: 0.6, pointerEvents: "none", marginTop: "1rem" }}>
        <p>Please agree to the required terms before payment.</p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        "client-id":
          "AZInNdZpQckkKZwFdW_i5x9tB1TGwJdASOt6sdOk3aDdIkWUWHIL_iuygTsVbK56OQ6vpAwsoCES9c-s",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: amount.toString() } }],
          })
        }
        onApprove={handleApprove}
        onError={(err) => onError("PayPal payment error: " + err)}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalPayment;
