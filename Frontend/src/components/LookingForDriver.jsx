import React from "react";

const LookingForDriver = (props) => {
  return (
    <div>
      <h5
        onClick={() => {
          props.setVehicleFound(false);
        }}
        className="absolute w-full text-center top-0 text-gray-300 font-semibold text-3xl"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-2xl font-semibold mb-5">Looking for a Driver</h3>

      <div className="flex flex-col justify-between items-center gap-5">
        <img
          className="h-24"
          src={props.image[props.vehicleType]}
          alt="UberGo"
        />
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
      </div>
    </div>
  );
};

export default LookingForDriver;
