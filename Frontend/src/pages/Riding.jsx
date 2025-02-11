import React from "react";
import { Link } from "react-router-dom";

const Riding = () => {
  return (
    <div className="h-screen">
      <Link to={"/home"} className="fixed top-2 right-2 rounded-full bg-white py-1 px-2">
        <i className="ri-home-3-fill"></i>
      </Link>
      <div className="h-1/2">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Uber map"
        />
      </div>
      <div className="h-1/2 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <img
            className="h-16"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4AGLOTGHSbWFi3XP-8x2dDD63dBBl3se-tQ&s"
            alt="UberGo"
          />
          <div className="text-right">
            <h2 className="text-lg font-bold">Ramu</h2>
            <h4 className="text-xl font-semibold -mt-2 -mb-1">GJ 01 NY 2258</h4>
            <p className="text-sm text-gray-600">Jaguar</p>
          </div>
        </div>

        <div className="flex flex-col justify-between items-center gap-5">
          <div className="w-full flex flex-col gap-2">
            <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
              <i className="ri-square-fill"></i>Destination
            </div>
            <div className="flex gap-4 border-b-2 border-gray-700 p-3 rounded-md">
              <i className="ri-bank-card-2-fill"></i>Rokda
            </div>
          </div>
        </div>
        <button className="bg-green-400 p-3 mt-5 rounded-lg w-full font-semibold text-white">
          Make a Payment
        </button>
      </div>
    </div>
  );
};

export default Riding;
