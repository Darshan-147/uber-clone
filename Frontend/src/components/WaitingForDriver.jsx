import React from "react";

const WaitingForDriver = (props) => {
  return (
    <div>
      <h5
        onClick={() => {
          props.setWaitingForDriver(true);
        }}
        className="absolute w-full text-center top-0 text-gray-300 font-semibold text-3xl"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </h5>

      <div>
        <img
          className="h-24"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4AGLOTGHSbWFi3XP-8x2dDD63dBBl3se-tQ&s"
          alt="UberGo"
        />
        <div>
          <h2>Ramu</h2>
          <h4>GJ 01 NY 2258</h4>
          <p>Jaguar</p>
        </div>
      </div>

      <div className="flex flex-col justify-between items-center gap-5">
        <div className="w-full flex flex-col gap-2">
          <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
            <i className="ri-map-pin-2-fill"></i>Current Location
          </div>
          <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
            <i className="ri-square-fill"></i>Destination
          </div>
          <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
            <i className="ri-bank-card-2-fill"></i>Rokda
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForDriver;
