import React, { useState } from "react";
import axios from "axios";

const formatName = (fullname) =>
  [fullname?.firstname, fullname?.lastname].filter(Boolean).join(" ") ||
  "Rider";

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
            Authorization: `Bearer ${
              localStorage.getItem("driverToken") || localStorage.getItem("token")
            }`,
            "Content-Type": "application/json",
          },
        },
      );

      navigate("/driver-riding", { state: { ride: response.data.ride } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  if (!ride) {
    return (
      <div>
        <h3 className="text-2xl font-semibold mb-5">No Active Ride</h3>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 p-3 rounded-lg w-full font-semibold"
        >
          Back
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

      <h3 className="text-2xl font-semibold mb-5">Start Ride</h3>
      <div className="flex justify-between items-center bg-yellow-100 p-3 rounded-lg">
        <div>
          <h4 className="text-lg font-semibold">
            {formatName(ride.user?.fullname)}
          </h4>
          <p className="text-sm text-gray-600">{ride.vehicleType}</p>
        </div>
        <div className="text-right">
          <h5 className="text-lg font-semibold">₹{ride.fare}</h5>
          <p className="text-xs text-gray-600">Accepted</p>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 mt-5">
        <div className="flex gap-4 border-b border-gray-200 p-3 rounded-md">
          <i className="ri-map-pin-2-fill"></i>
          <span>{ride.pickup}</span>
        </div>
        <div className="flex gap-4 border-b border-gray-200 p-3 rounded-md">
          <i className="ri-square-fill"></i>
          <span>{ride.destination}</span>
        </div>
      </div>

      <form onSubmit={verifyOtp} className="w-full flex flex-col gap-4 mt-7">
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter rider OTP"
          className="bg-gray-100 rounded-lg px-4 py-3 border font-mono text-lg placeholder:text-base w-full"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="bg-green-500 disabled:bg-gray-400 p-3 rounded-lg w-full font-semibold text-white"
        >
          {loading ? "Verifying..." : "Verify OTP and Start"}
        </button>
      </form>
    </div>
  );
};

export default ConfirmRidePopUp;
