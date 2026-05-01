import React from "react";

const ConfirmRide = (props) => {
  return (
    <div>
      <h5
        onClick={() => {
          props.setConfirmRidePanel(false);
        }}
        className="absolute w-full text-center top-0 text-gray-300 font-semibold text-3xl"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-2xl font-semibold mb-5">Confirm Your Ride</h3>

      <div className="flex justify-between">
        <img
          className="h-24"
          src={props.image[props.vehicleType]}
          alt="UberGo"
        />
        <div className="text-right flex justify-center items-center">
          <h4 className="text-xl font-semibold">Travelling by {props.vehicleType}</h4>
        </div>
      </div>

      <div className="flex flex-col justify-between items-center gap-5">
        <div className="w-full flex flex-col gap-2">
          <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
            <i className="ri-map-pin-2-fill"></i>
            {props.pickup}
          </div>
          <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
            <i className="ri-square-fill"></i>
            {props.destination}
          </div>
          <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
            <i className="ri-bank-card-2-fill"></i>₹{" "}
            {props.fare[props.vehicleType]} only
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await props.createRide();
          }}
          disabled={props.loading}
          className="bg-green-400 p-3 rounded-lg w-full font-semibold text-white"
        >
          {props.loading ? "Confirming..." : "Confirm"}
        </button>
      </div>
    </div>
  );
};

export default ConfirmRide;
