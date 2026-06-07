import React from "react";

const LookingForDriver = ({ ride, setVehicleFound, pickup, destination, fare, vehicleType, image, onCancel }) => {
  const type = ride?.vehicleType || vehicleType;

  return (
    <div>
      <button
        type="button"
        onClick={() => setVehicleFound?.(false)}
        className="absolute w-full text-center top-0 text-gray-300 font-semibold text-3xl"
        aria-label="Close"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </button>

      <h3 className="text-2xl font-semibold mb-2">Looking for a Driver</h3>
      <p className="text-gray-500 text-sm mb-4">We're finding the best driver near you...</p>

      <div className="flex justify-center mb-4">
        <div className="relative">
          <img className="h-20 object-contain" src={image?.[type]} alt={type} />
          <div className="absolute -right-2 -top-2 w-5 h-5 bg-green-500 rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 mb-5">
        <div className="flex gap-3 p-3 rounded-xl bg-gray-50 items-center">
          <i className="ri-map-pin-2-fill text-green-600"></i>
          <span className="text-sm">{ride?.pickup || pickup}</span>
        </div>
        <div className="flex gap-3 p-3 rounded-xl bg-gray-50 items-center">
          <i className="ri-square-fill text-black"></i>
          <span className="text-sm">{ride?.destination || destination}</span>
        </div>
        <div className="flex gap-3 p-3 rounded-xl bg-gray-50 items-center">
          <i className="ri-bank-card-2-fill text-blue-600"></i>
          <span className="text-sm font-semibold">₹{ride?.fare || fare?.[type]} · Cash</span>
        </div>
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors"
        >
          Cancel Ride
        </button>
      )}
    </div>
  );
};

export default LookingForDriver;
