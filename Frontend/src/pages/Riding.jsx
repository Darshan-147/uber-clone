import React from "react";
import { Link, useLocation } from "react-router-dom";

const formatName = (fullname) =>
  [fullname?.firstname, fullname?.lastname].filter(Boolean).join(" ") ||
  "Driver";

const Riding = () => {
  const location = useLocation();
  const storedRide = sessionStorage.getItem("activeRide");
  const ride = location.state?.ride || (storedRide ? JSON.parse(storedRide) : null);
  const driver = ride?.driver;

  return (
    <div className="h-screen">
      <Link
        to="/home"
        className="fixed top-2 right-2 rounded-full bg-white py-1 px-2 z-20"
      >
        <i className="ri-home-3-fill"></i>
      </Link>
      <div className="h-1/2">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Map"
        />
      </div>
      <div className="h-1/2 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{formatName(driver?.fullname)}</h2>
            <h4 className="text-xl font-semibold -mt-1">
              {driver?.vehicle?.plate || "Assigned vehicle"}
            </h4>
            <p className="text-sm text-gray-600">
              {[driver?.vehicle?.color, driver?.vehicle?.vehicleType]
                .filter(Boolean)
                .join(" ")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Fare</p>
            <h3 className="text-xl font-bold">Rs. {ride?.fare || 0}</h3>
          </div>
        </div>

        <div className="flex flex-col justify-between items-center gap-5">
          <div className="w-full flex flex-col gap-2">
            <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
              <i className="ri-square-fill"></i>
              {ride?.destination || "Destination"}
            </div>
            <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
              <i className="ri-bank-card-2-fill"></i>
              Cash payment
            </div>
          </div>
        </div>
        <button className="bg-green-500 p-3 mt-5 rounded-lg w-full font-semibold text-white">
          Make a Payment
        </button>
      </div>
    </div>
  );
};

export default Riding;
