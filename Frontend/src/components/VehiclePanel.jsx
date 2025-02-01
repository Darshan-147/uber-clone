import React from "react";

const VehiclePanel = (props) => {
  return (
    <div>
      <h5
        onClick={() => {
          props.setVehiclePanelOpen(false);
        }}
        className="absolute w-full text-center top-0 text-gray-400 font-semibold text-3xl"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-2xl font-semibold mb-5">Choose a vehicle</h3>
      <div className="flex border-2 active:border-black rounded-xl w-full p-3 mb-4 items-center justify-between">
        <img
          className="h-10 w-16"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4AGLOTGHSbWFi3XP-8x2dDD63dBBl3se-tQ&s"
          alt="UberGo"
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
        <h2 className="font-semibold text-xl">₹120.21</h2>
      </div>
      <div className="flex border-2 active:border-black rounded-xl w-full p-3 mb-4 items-center justify-between">
        <img
          className="h-10 w-16"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS50dWc9jVI7sEuKrjwkvIKFFShG0hab9uA4A&s"
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
        <h2 className="font-semibold text-xl">₹520.67</h2>
      </div>
      <div className="flex border-2 active:border-black rounded-xl w-full p-3 mb-4 items-center justify-between">
        <img
          className="h-10 w-14"
          src="https://w1.pngwing.com/pngs/381/835/png-transparent-yamaha-logo-car-decal-motorcycle-sticker-sport-bike-yamaha-yzfr1-bicycle.png"
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
        <h2 className="font-semibold text-xl">₹70.32</h2>
      </div>
    </div>
  );
};

export default VehiclePanel;
