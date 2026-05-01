import React, { useState } from "react";
import axios from "axios";

const OTPVerification = ({ ride, navigate }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyOTP = async () => {
    try {
      if (!otp || otp.length !== 6) {
        setError("Please enter a valid 6-digit OTP");
        return;
      }

      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/verify-otp`,
        {
          rideId: ride._id,
          otp,
        },
        {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("driverToken") || localStorage.getItem("token")
            }`,
            "Content-Type": "application/json",
          },
        },
      );

      alert("OTP verified! Ride started.");
      navigate("/riding", { state: { ride: response.data.ride } });
    } catch (error) {
      console.error("OTP verification error:", error);
      setError(error.response?.data?.message || "Failed to verify OTP");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5">
      <h3 className="text-2xl font-semibold mb-5">Verify OTP</h3>
      <p className="text-gray-600 mb-4">
        Enter the 6-digit OTP provided by the driver
      </p>

      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Driver: {ride.driver?.fullname}
        </p>
        <p className="text-sm text-gray-600">Fare: ₹{ride.fare}</p>
      </div>

      <input
        type="text"
        maxLength="6"
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChange={(e) => {
          setOtp(e.target.value.replace(/\D/g, ""));
          setError("");
        }}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-3 text-center text-2xl tracking-widest font-semibold"
      />

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <button
        onClick={verifyOTP}
        disabled={loading || otp.length !== 6}
        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white w-full py-3 rounded-lg font-semibold transition-colors"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );
};

export default OTPVerification;
