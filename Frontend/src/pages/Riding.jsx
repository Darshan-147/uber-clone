import React from "react";
import { Link, useLocation } from "react-router-dom";

const formatName = (fullname) =>
  [fullname?.firstname, fullname?.lastname].filter(Boolean).join(" ") || "Driver";

const Riding = () => {
  const location = useLocation();
  const storedRide = sessionStorage.getItem("activeRide");
  const ride = location.state?.ride || (storedRide ? JSON.parse(storedRide) : null);
  const driver = ride?.driver;

  return (
    <div className="h-screen overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-black text-white rounded-lg px-3 py-1 font-bold text-sm">BMR</div>
        <span className="font-bold text-white text-base drop-shadow-lg">BookMyRide</span>
      </div>

      <Link
        to="/home"
        className="fixed top-3 right-3 rounded-full bg-white py-2 px-3 z-20 shadow text-sm font-semibold hover:bg-gray-100"
      >
        <i className="ri-home-3-line mr-1"></i>Home
      </Link>

      {/* Map */}
      <div className="h-1/2">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Map"
        />
      </div>

      {/* Ride Info */}
      <div className="h-1/2 p-4 flex flex-col justify-between bg-white">
        {/* Driver Info */}
        <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-600">
              {driver?.fullname?.firstname?.[0]?.toUpperCase() || "D"}
            </div>
            <div>
              <h4 className="font-bold">{formatName(driver?.fullname)}</h4>
              <p className="text-sm text-gray-500">
                {[driver?.vehicle?.color, driver?.vehicle?.vehicleType].filter(Boolean).join(" ")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tracking-widest bg-white border border-gray-200 rounded-lg px-3 py-1">
              {driver?.vehicle?.plate || "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">₹{ride?.fare || 0}</p>
          </div>
        </div>

        {/* Ride Details */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-3 p-3 rounded-xl bg-gray-50 items-center">
            <i className="ri-square-fill text-black"></i>
            <span className="text-sm">{ride?.destination || "Destination"}</span>
          </div>
          <div className="flex gap-3 p-3 rounded-xl bg-gray-50 items-center">
            <i className="ri-bank-card-2-fill text-blue-600"></i>
            <span className="text-sm">Cash · ₹{ride?.fare || 0}</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
          <p className="text-sm text-green-700 font-medium">
            <i className="ri-shield-check-fill mr-1"></i>
            Ride in progress — enjoy your journey!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Riding;
