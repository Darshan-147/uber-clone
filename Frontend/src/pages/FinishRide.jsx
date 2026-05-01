import React, { useState } from "react";
import axios from "axios";

const formatName = (fullname) =>
  [fullname?.firstname, fullname?.lastname].filter(Boolean).join(" ") ||
  "Rider";

const FinishRide = ({ ride, onClose, onFinished }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finishRide = async (event) => {
    event.preventDefault();
    setError("");

    if (!ride?._id) {
      setError("Ride details are missing.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/finish-ride`,
        { rideId: ride._id },
        {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("driverToken") || localStorage.getItem("token")
            }`,
            "Content-Type": "application/json",
          },
        },
      );

      onFinished(response.data.ride);
    } catch (err) {
      setError(err.response?.data?.message || "Could not finish ride.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={onClose}
        className="absolute w-full text-center top-0 text-gray-300 font-semibold text-3xl"
        aria-label="Close finish ride panel"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </button>

      <h3 className="text-2xl font-semibold mb-5">Finish Ride?</h3>
      <div className="flex justify-between items-center bg-yellow-100 p-3 rounded-lg">
        <div>
          <h4 className="text-lg font-semibold">
            {formatName(ride?.user?.fullname)}
          </h4>
          <p className="text-sm text-gray-600">{ride?.vehicleType}</p>
        </div>
        <div className="text-right">
          <h5 className="text-lg font-semibold">Rs. {ride?.fare || 0}</h5>
          <p className="text-xs text-gray-600">In progress</p>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 mt-5">
        <div className="flex gap-4 border-b border-gray-200 p-3 rounded-md">
          <i className="ri-map-pin-2-fill"></i>
          <span>{ride?.pickup}</span>
        </div>
        <div className="flex gap-4 border-b border-gray-200 p-3 rounded-md">
          <i className="ri-square-fill"></i>
          <span>{ride?.destination}</span>
        </div>
        <div className="flex gap-4 border-b border-gray-200 p-3 rounded-md">
          <i className="ri-bank-card-2-fill"></i>
          <span>Collect Rs. {ride?.fare || 0}</span>
        </div>
      </div>

      <form onSubmit={finishRide} className="w-full mt-7">
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 disabled:bg-gray-400 p-3 rounded-lg w-full font-semibold text-white text-xl justify-center flex"
        >
          {loading ? "Finishing..." : "Finish Ride"}
        </button>
        <p className="text-xs text-red-500 mt-5">
          Finish only after the rider has completed payment.
        </p>
      </form>
    </div>
  );
};

export default FinishRide;
