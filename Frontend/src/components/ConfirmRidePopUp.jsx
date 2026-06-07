import React, { useState } from "react";
import axios from "axios";

const formatName = (fullname) =>
  [fullname?.firstname, fullname?.lastname].filter(Boolean).join(" ") || "Rider";

const ConfirmRidePopUp = ({ ride, onClose, navigate }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyOtp = async (event) => {
    event.preventDefault();
    setError("");

    if (!ride?._id || !/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP from the rider.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/verify-otp`,
        { rideId: ride._id, otp },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("driverToken") || localStorage.getItem("token")}`,
          },
        },
      );
      navigate("/driver-riding", { state: { ride: response.data.ride } });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!ride) {
    return (
      <div className="text-center py-10">
        <i className="ri-taxi-line text-5xl text-gray-300 mb-3 block"></i>
        <h3 className="text-xl font-semibold mb-4 text-gray-600">No Active Ride</h3>
        <button type="button" onClick={onClose} className="bg-gray-100 px-6 py-3 rounded-xl font-semibold">
          Close
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClose}
        className="absolute w-full text-center top-0 text-gray-300 font-semibold text-3xl"
        aria-label="Close OTP panel"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </button>

      <h3 className="text-2xl font-bold mb-1">Start Ride</h3>
      <p className="text-gray-500 text-sm mb-4">Collect the 6-digit OTP from the rider to begin.</p>

      {/* Rider Info */}
      <div className="flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded-2xl mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-800">
            {ride.user?.fullname?.firstname?.[0]?.toUpperCase() || "R"}
          </div>
          <div>
            <h4 className="font-semibold">{formatName(ride.user?.fullname)}</h4>
            <p className="text-xs text-gray-500 capitalize">{ride.vehicleType}</p>
          </div>
        </div>
        <div className="text-right">
          <h5 className="text-lg font-bold text-green-700">₹{ride.fare}</h5>
          <p className="text-xs text-gray-500">Cash</p>
        </div>
      </div>

      {/* Route */}
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex gap-3 p-3 rounded-xl bg-gray-50 items-center">
          <i className="ri-map-pin-2-fill text-green-600"></i>
          <span className="text-sm">{ride.pickup}</span>
        </div>
        <div className="flex gap-3 p-3 rounded-xl bg-gray-50 items-center">
          <i className="ri-square-fill text-black"></i>
          <span className="text-sm">{ride.destination}</span>
        </div>
      </div>

      {/* OTP Form */}
      <form onSubmit={verifyOtp} className="flex flex-col gap-3">
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter 6-digit OTP"
          className="bg-gray-100 rounded-xl px-4 py-4 border border-gray-200 font-mono text-2xl tracking-[0.3em] text-center placeholder:text-base placeholder:tracking-normal placeholder:font-sans w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="bg-green-600 disabled:bg-gray-300 p-3 rounded-xl w-full font-semibold text-white text-base hover:bg-green-700 transition-colors"
        >
          {loading ? "Verifying..." : "Verify OTP & Start Ride"}
        </button>
      </form>
    </div>
  );
};

export default ConfirmRidePopUp;
