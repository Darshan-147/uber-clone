import React from "react";

const VehiclePanel = (props) => {
  return (
    <div>
      <h5
        onClick={() => props.setVehiclePanel(false)}
        className="absolute w-full text-center top-0 text-gray-300 font-semibold text-3xl cursor-pointer"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-2xl font-semibold mb-5">Choose a vehicle</h3>

      {/* Auto */}
      <div
        onClick={() => { props.setConfirmRidePanel(true); props.setVehicleType("auto"); }}
        className="flex border-2 active:border-black hover:border-gray-400 rounded-2xl w-full p-3 mb-3 items-center justify-between cursor-pointer transition-colors"
      >
        <img className="h-10 w-16 object-contain" src={props.image.auto} alt="Auto" />
        <div className="ml-2 w-1/2">
          <h4 className="font-semibold text-base flex items-center gap-1">
            BMR Auto <i className="ri-user-3-fill text-sm"></i><span className="text-sm">3</span>
          </h4>
          <h5 className="font-medium text-sm text-gray-500">2 mins away</h5>
          <p className="font-normal text-xs text-gray-400">Affordable, compact rides</p>
        </div>
        <h2 className="font-bold text-xl">₹{props.fare.auto}</h2>
      </div>

      {/* Car */}
      <div
        onClick={() => { props.setConfirmRidePanel(true); props.setVehicleType("car"); }}
        className="flex border-2 active:border-black hover:border-gray-400 rounded-2xl w-full p-3 mb-3 items-center justify-between cursor-pointer transition-colors"
      >
        <img className="h-10 w-16 object-contain" src={props.image.car} alt="Car" />
        <div className="ml-2 w-1/2">
          <h4 className="font-semibold text-base flex items-center gap-1">
            BMR Cab <i className="ri-user-3-fill text-sm"></i><span className="text-sm">4</span>
          </h4>
          <h5 className="font-medium text-sm text-gray-500">4 mins away</h5>
          <p className="font-normal text-xs text-gray-400">Comfortable sedan rides</p>
        </div>
        <h2 className="font-bold text-xl">₹{props.fare.car}</h2>
      </div>

      {/* Bike */}
      <div
        onClick={() => { props.setConfirmRidePanel(true); props.setVehicleType("bike"); }}
        className="flex border-2 active:border-black hover:border-gray-400 rounded-2xl w-full p-3 mb-3 items-center justify-between cursor-pointer transition-colors"
      >
        <img className="h-10 w-14 object-contain" src={props.image.bike} alt="Bike" />
        <div className="ml-2 w-1/2">
          <h4 className="font-semibold text-base flex items-center gap-1">
            BMR Moto <i className="ri-user-3-fill text-sm"></i><span className="text-sm">1</span>
          </h4>
          <h5 className="font-medium text-sm text-gray-500">1 min away</h5>
          <p className="font-normal text-xs text-gray-400">Fast, budget-friendly rides</p>
        </div>
        <h2 className="font-bold text-xl">₹{props.fare.bike}</h2>
      </div>
    </div>
  );
};

export default VehiclePanel;
