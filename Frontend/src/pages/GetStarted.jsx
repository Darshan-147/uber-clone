import React from "react";
import {Link} from "react-router-dom"

const GetStarted = () => {
  return (
    <div className="bg-cover bg-right-bottom bg-[url(https://www.asmag.com/upload/pic/case/55800.9755072.jpg)] h-screen w-full pt-8 flex justify-between flex-col ">
      <img className="w-12 ml-8" src="https://static-00.iconduck.com/assets.00/uber-icon-2048x2048-1c9pt96a.png" alt="uber-logo"></img>
      <div className="bg-white py-4 px-4 pb-7">
        <h2 className="text-5xl font-semibold">Get Started with Uber</h2>
        <Link to="/login" className="bg-black text-white w-full flex justify-center py-3 mt-5 rounded">Continue</Link>
      </div>
    </div>
  );
};

export default GetStarted;
