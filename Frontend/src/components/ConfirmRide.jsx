import React from "react";

const ConfirmRide = (props) => {
  return (
    <div>
      <button
        type="button"
        onClick={() => props.setConfirmRidePanel(false)}
        className="absolute w-full text-center top-0 text-gray-300 font-semibold text-3xl cursor-pointer"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </button>

      <h3 className="text-2xl font-bold mb-1">Confirm Your Ride</h3>
      <p className="text-gray-500 text-sm mb-4">Review your trip details before booking.</p>

      <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-2xl p-3">
        <img className="h-16 object-contain" src={props.image[props.vehicleType]} alt={props.vehicleType} />
        <div className="text-right">
          <h4 className="text-lg font-bold capitalize">{props.vehicleType}</h4>
          <p className="text-2xl font-black text-green-600">₹{props.fare[props.vehicleType]}</p>
          <p className="text-xs text-gray-500">Cash payment</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-5">
        <div className="flex gap-3 p-3 rounded-xl bg-gray-50 items-center">
          <i className="ri-map-pin-2-fill text-green-600"></i>
          <span className="text-sm">{props.pickup}</span>
        </div>
        <div className="flex gap-3 p-3 rounded-xl bg-gray-50 items-center">
          <i className="ri-square-fill text-black"></i>
          <span className="text-sm">{props.destination}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => { props.setConfirmRidePanel(false); props.setVehiclePanel(true); }}
          className="flex-1 border-2 border-gray-200 p-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={async () => await props.createRide()}
          disabled={props.loading}
          className="flex-2 bg-black text-white p-3 rounded-xl font-semibold disabled:bg-gray-400 hover:bg-gray-800 transition-colors px-8"
        >
          {props.loading ? "Booking..." : "Confirm Ride"}
        </button>
      </div>
    </div>
  );
};

export default ConfirmRide;
