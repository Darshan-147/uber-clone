import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import FinishRide from "./FinishRide";

const DriverRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false);
  const finishRidePanelRef = useRef(null);

  useGSAP(() => {
    if (finishRidePanel) {
      gsap.to(finishRidePanelRef.current, {
        transform: "translateY(0%)",
      });
    } else {
      gsap.to(finishRidePanelRef.current, {
        transform: "translateY(100%)",
      });
    }
  }, [finishRidePanel]);

  return (
    <div className="h-screen">
      <img
        className="w-16 absolute top-5 left-5"
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt="Uber Logo"
      />
      <Link
        to="/driver-home"
        className="fixed top-2 right-2 rounded-full bg-white py-1 px-2"
      >
        <i className="ri-logout-box-r-fill"></i>
      </Link>

      <div className="h-4/5">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Uber map"
        />
      </div>
      <div
        className="h-1/5 bg-yellow-500 relative flex justify-between items-center"
        onClick={() => setFinishRidePanel(true)}
      >
        <h5
          onClick={() => {}}
          className="absolute w-full text-center top-0 text-black font-semibold text-3xl"
        >
          <i className="ri-arrow-up-wide-line"></i>
        </h5>
        <div className="p-6 flex justify-between items-center w-full">
          <h4 className="text-xl font-semibold">5 KM away</h4>
          <button className="bg-green-500 p-3 rounded-lg font-semibold text-white justify-center flex">
            Complete Ride
          </button>
        </div>
      </div>
      <div
        ref={finishRidePanelRef}
        className="fixed h-screen w-full z-10 bottom-0 bg-white px-3 py-8"
      >
        <FinishRide setFinishRidePanel={setFinishRidePanel}/>
      </div>
    </div>
  );
};

export default DriverRiding;
