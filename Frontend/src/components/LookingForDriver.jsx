import React from "react";

const LookingForDriver = (props) => {
  const vehicleType = props.ride?.vehicleType || props.vehicleType;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          props.setVehicleFound(false);
        }}
        className="absolute w-full text-center top-0 text-gray-300 font-semibold text-3xl"
        aria-label="Close ride status"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </button>
      <h3 className="text-2xl font-semibold mb-5">
        {props.ride?.status === "accepted" ? "Driver Accepted" : "Looking for a Driver"}
      </h3>

      {props.ride?.status === "accepted" && props.ride?.otp && (
        <div className="mb-5 rounded-lg bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-sm font-medium text-green-800">
            Share OTP with driver
          </p>
          <p className="text-3xl font-bold tracking-widest text-green-900">
            {props.ride.otp}
          </p>
        </div>
      )}

      <div className="flex flex-col justify-between items-center gap-5">
        <img
          className="h-24"
          src={props.image[vehicleType]}
          alt={vehicleType}
        />
        <div className="w-full flex flex-col gap-2">
          <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
            <i className="ri-map-pin-2-fill"></i>
            {props.ride?.pickup || props.pickup}
          </div>
          <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
            <i className="ri-square-fill"></i>
            {props.ride?.destination || props.destination}
          </div>
          <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
            <i className="ri-bank-card-2-fill"></i>
            Rs. {props.ride?.fare || props.fare[vehicleType]} only
          </div>
        </div>
      </div>
    </div>
  );
};

export default LookingForDriver;
