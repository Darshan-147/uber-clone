import React from "react";

const formatName = (fullname) =>
  [fullname?.firstname, fullname?.lastname].filter(Boolean).join(" ") || "Driver";

const WaitingForDriver = ({ ride, setWaitingForDriver }) => {
  const driver = ride?.driver;

  return (
    <div>
      <button
        type="button"
        onClick={() => setWaitingForDriver?.(false)}
        className="absolute w-full text-center top-0 text-gray-300 font-semibold text-3xl"
        aria-label="Close waiting panel"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </button>

      <h3 className="text-2xl font-semibold mb-1">Driver on the way!</h3>
      <p className="text-gray-500 text-sm mb-4">Share the OTP with your driver to start the ride.</p>

      {/* OTP — prominently shown */}
      {ride?.otp && (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-4 mb-4 text-center">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-widest mb-1">Your Ride OTP</p>
          <p className="text-5xl font-black tracking-[0.3em] text-green-800">{ride.otp}</p>
          <p className="text-xs text-green-600 mt-1">Show this to your driver</p>
        </div>
      )}

      {/* Driver card */}
      <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600">
            {driver?.fullname?.firstname?.[0]?.toUpperCase() || "D"}
          </div>
          <div>
            <h4 className="font-bold text-base">{formatName(driver?.fullname)}</h4>
            <p className="text-sm text-gray-500">
              {[driver?.vehicle?.color, driver?.vehicle?.vehicleType].filter(Boolean).join(" ")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tracking-widest bg-white border border-gray-200 rounded-lg px-3 py-1">
            {driver?.vehicle?.plate || "—"}
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2">
        <div className="flex gap-3 p-3 rounded-xl bg-gray-50 items-center">
          <i className="ri-map-pin-2-fill text-green-600"></i>
          <span className="text-sm">{ride?.pickup}</span>
        </div>
        <div className="flex gap-3 p-3 rounded-xl bg-gray-50 items-center">
          <i className="ri-square-fill text-black"></i>
          <span className="text-sm">{ride?.destination}</span>
        </div>
        <div className="flex gap-3 p-3 rounded-xl bg-gray-50 items-center">
          <i className="ri-bank-card-2-fill text-blue-600"></i>
          <span className="text-sm font-semibold">₹{ride?.fare} · Cash</span>
        </div>
      </div>
    </div>
  );
};

export default WaitingForDriver;
