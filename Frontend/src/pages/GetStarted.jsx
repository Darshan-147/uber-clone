import React from "react";
import { Link } from "react-router-dom";

const GetStarted = () => {
  return (
    <div className="bg-cover bg-right-bottom bg-[url(https://www.asmag.com/upload/pic/case/55800.9755072.jpg)] h-screen w-full pt-8 flex justify-between flex-col">
      <div className="ml-8 flex items-center gap-2">
        <div className="bg-black text-white rounded-lg px-3 py-1 font-bold text-lg tracking-tight">BMR</div>
        <span className="font-bold text-white text-xl drop-shadow-lg">BookMyRide</span>
      </div>
      <div className="bg-white py-4 px-4 pb-7">
        <h2 className="text-4xl font-bold">Get Started with <span className="text-green-600">BookMyRide</span></h2>
        <p className="text-gray-500 mt-1 text-sm">Your ride, your way — anytime, anywhere.</p>
        <Link
          to="/user-login"
          className="bg-black text-white w-full flex justify-center py-3 mt-5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          Continue
        </Link>
      </div>
    </div>
  );
};

export default GetStarted;
