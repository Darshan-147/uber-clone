import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import RidePopUp from "../components/RidePopUp";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ConfirmRidePopUp from "../components/ConfirmRidePopUp";
import { DriverDataContext } from "../context/DriverContext";
import driverImage from "../../assets/images/driverImage.jpeg";

const DriverHome = () => {
  const [ridePopUp, setRidePopUp] = useState(false);
  const [confirmRidePopUp, setConfirmRidePopUp] = useState(false);
  const ridePopUpRef = useRef(null);
  const confirmRidePopUpRef = useRef(null);

  const { driver } = useContext(DriverDataContext);
  const driverData = JSON.parse(localStorage.getItem("driverData"));
  

  useEffect(() => {
    console.log("Driver data:", driver); // Debug log
  }, [driver]);

  useGSAP(() => {
    if (ridePopUp) {
      gsap.to(ridePopUpRef.current, {
        transform: "translateY(0%)",
      });
    } else {
      gsap.to(ridePopUpRef.current, {
        transform: "translateY(100%)",
      });
    }
  }, [ridePopUp]);

  useGSAP(() => {
    if (confirmRidePopUp) {
      gsap.to(confirmRidePopUpRef.current, {
        transform: "translateY(0%)",
      });
    } else {
      gsap.to(confirmRidePopUpRef.current, {
        transform: "translateY(100%)",
      });
    }
  }, [confirmRidePopUp]);

  return (
    <div className="h-screen">
      <div>
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
      </div>
      <div className="h-3/5">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Uber map"
        />
      </div>

      <div className="h-2/5 m-4 flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={driverImage}
              alt=""
            />
          </div>
          <div className="flex flex-col items-end">
            <h4 className="text-xl font-medium">
              {/* {driver.fullname?.firstname} */}Shubham Sadhwani
            </h4>
            <h4 className="text-lg font-medium">₹ 300.01</h4>
            <p className="text-sm font-semibold text-gray-600">Earned</p>
          </div>
        </div>
        <div className="flex justify-around bg-gray-100 rounded-2xl p-2">
          <div className="text-center">
            <i className="ri-timer-line text-2xl"></i>
            <h5 className="font-bold">12.2</h5>
            <p>Hours Online</p>
          </div>
          <div className="text-center">
            <i className="ri-speed-up-fill text-2xl"></i>
            <h5 className="font-bold">50 km</h5>
            <p>Total Distance</p>
          </div>
          <div className="text-center">
            <i className="ri-booklet-line text-2xl"></i>
            <h5 className="font-bold">20</h5>
            <p>Notes taken</p>
          </div>
        </div>
        <button
          className="bg-blue-400 p-3 rounded-lg w-full font-semibold text-white"
          onClick={() => setRidePopUp(true)}
        >
          Check for Rides
        </button>
      </div>
      <div
        ref={ridePopUpRef}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-8"
      >
        <RidePopUp
          setRidePopUp={setRidePopUp}
          setConfirmRidePopUp={setConfirmRidePopUp}
        />
      </div>
      <div
        ref={confirmRidePopUpRef}
        className="fixed h-screen w-full z-10 bottom-0 bg-white px-3 py-8"
      >
        <ConfirmRidePopUp
          setRidePopUp={setRidePopUp}
          setConfirmRidePopUp={setConfirmRidePopUp}
        />
      </div>
    </div>
  );
};

export default DriverHome;
