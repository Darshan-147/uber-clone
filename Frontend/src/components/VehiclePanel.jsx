import React from "react";

const VehiclePanel = (props) => {
  return (
    <div>
      <h5
        onClick={() => {
          props.setVehiclePanel(false);
        }}
        className="absolute w-full text-center top-0 text-gray-300 font-semibold text-3xl"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-2xl font-semibold mb-5">Choose a vehicle</h3>

      {/* Uber Taxi */}
      <div
        onClick={() => {
          props.setConfirmRidePanel(true);
          props.setVehicleType("auto");
        }}
        className="flex border-2 active:border-black rounded-xl w-full p-3 mb-4 items-center justify-between"
      >
        <img
          className="h-10 w-16"
          src={props.image.auto}
          alt="Taxi"
        />
        <div className="ml-2 w-1/2">
          <h4 className="font-medium text-base">
            UberGo{" "}
            <span>
              <i className="ri-user-3-fill"></i>4
            </span>
          </h4>
          <h5 className="font-medium text-sm">2 mins away</h5>
          <p className="font-normal text-xs text-gray-500">
            Affordable, compact rides
          </p>
        </div>
        <h2 className="font-semibold text-xl">₹{props.fare.auto}</h2>
      </div>

      {/* Mercedez Benz */}
      <div
        onClick={() => {
          props.setConfirmRidePanel(true);
          props.setVehicleType("car");
        }}
        className="flex border-2 active:border-black rounded-xl w-full p-3 mb-4 items-center justify-between"
      >
        <img
          className="h-10 w-16"
          src={props.image.car}
          alt="MBenz"
        />
        <div className="ml-2 w-1/2">
          <h4 className="font-medium text-base">
            Mercedes Benz{" "}
            <span>
              <i className="ri-user-3-fill"></i>5
            </span>
          </h4>
          <h5 className="font-medium text-sm">5 mins away</h5>
          <p className="font-normal text-xs text-gray-500">
            Luxurious ride for luxurious people
          </p>
        </div>
        <h2 className="font-semibold text-xl">₹{props.fare.car}</h2>
      </div>

      {/* Motorcycle */}
      <div
        onClick={() => {
          props.setConfirmRidePanel(true);
          props.setVehicleType("bike");
        }}
        className="flex border-2 active:border-black rounded-xl w-full p-3 mb-4 items-center justify-between"
      >
        <img
          className="h-10 w-14"
          src={props.image.bike}
          alt="Bike"
        />
        <div className="ml-2 w-1/2">
          <h4 className="font-medium text-base">
            Motorcycle{" "}
            <span>
              <i className="ri-user-3-fill"></i>1
            </span>
          </h4>
          <h5 className="font-medium text-sm">1 min away</h5>
          <p className="font-normal text-xs text-gray-500">For bike lovers</p>
        </div>
        <h2 className="font-semibold text-xl">₹{props.fare.bike}</h2>
      </div>
    </div>
  );
};

export default VehiclePanel;
