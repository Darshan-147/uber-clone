import React from "react";

const formatName = (fullname) =>
  [fullname?.firstname, fullname?.lastname].filter(Boolean).join(" ") ||
  "Driver";

const WaitingForDriver = ({ ride, setWaitingForDriver }) => {
  const driver = ride?.driver;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setWaitingForDriver?.(false);
        }}
        className="absolute w-full text-center top-0 text-gray-300 font-semibold text-3xl"
        aria-label="Close waiting panel"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </button>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold">{formatName(driver?.fullname)}</h2>
          <h4 className="text-xl font-semibold">
            {driver?.vehicle?.plate || "Assigned vehicle"}
          </h4>
          <p className="text-sm text-gray-600">
            {[driver?.vehicle?.color, driver?.vehicle?.vehicleType]
              .filter(Boolean)
              .join(" ")}
          </p>
        </div>
        {ride?.otp && (
          <div className="text-right">
            <p className="text-xs text-gray-600">OTP</p>
            <p className="text-2xl font-bold tracking-widest">{ride.otp}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between items-center gap-5">
        <div className="w-full flex flex-col gap-2">
          <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
            <i className="ri-map-pin-2-fill"></i>
            {ride?.pickup || "Pickup"}
          </div>
          <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
            <i className="ri-square-fill"></i>
            {ride?.destination || "Destination"}
          </div>
          <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
            <i className="ri-bank-card-2-fill"></i>
            Rs. {ride?.fare || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForDriver;
