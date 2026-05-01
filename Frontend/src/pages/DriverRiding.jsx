import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import axios from "axios";
import FinishRide from "./FinishRide";

const DriverRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false);
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const finishRidePanelRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const stateRide = location.state?.ride;
    if (stateRide) {
      setRide(stateRide);
      setLoading(false);
      return;
    }

    const loadActiveRide = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/get-driver-rides`,
          {
            params: { status: "in-progress" },
            headers: {
              Authorization: `Bearer ${
                localStorage.getItem("driverToken") ||
                localStorage.getItem("token")
              }`,
              "Content-Type": "application/json",
            },
          },
        );

        setRide(response.data?.[0] || null);
      } finally {
        setLoading(false);
      }
    };

    loadActiveRide();
  }, [location.state]);

  const handleFinished = () => {
    setFinishRidePanel(false);
    navigate("/driver-home", { replace: true });
  };

  useGSAP(() => {
    gsap.to(finishRidePanelRef.current, {
      transform: finishRidePanel ? "translateY(0%)" : "translateY(100%)",
    });
  }, [finishRidePanel]);

  if (loading) {
    return (
      <div className="h-screen grid place-items-center">
        <p className="font-semibold">Loading ride...</p>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="h-screen p-5 grid place-items-center text-center">
        <div>
          <h1 className="text-2xl font-semibold">No ride in progress</h1>
          <Link
            to="/driver-home"
            className="mt-5 inline-flex bg-black text-white px-5 py-3 rounded-lg font-semibold"
          >
            Back to Driver Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <img
        className="w-16 absolute top-5 left-5 z-20"
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt="Uber Logo"
      />
      <Link
        to="/driver-home"
        className="fixed top-2 right-2 z-20 rounded-full bg-white py-1 px-2"
      >
        <i className="ri-home-3-fill"></i>
      </Link>

      <div className="h-4/5">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Map"
        />
      </div>

      <button
        type="button"
        className="h-1/5 bg-yellow-500 relative flex justify-between items-center w-full"
        onClick={() => setFinishRidePanel(true)}
      >
        <span className="absolute w-full text-center top-0 text-black font-semibold text-3xl">
          <i className="ri-arrow-up-wide-line"></i>
        </span>
        <div className="p-6 flex justify-between items-center w-full text-left">
          <div>
            <h4 className="text-xl font-semibold">Ride in progress</h4>
            <p className="text-sm">{ride.destination}</p>
          </div>
          <span className="bg-green-600 p-3 rounded-lg font-semibold text-white">
            Complete Ride
          </span>
        </div>
      </button>

      <div
        ref={finishRidePanelRef}
        className="fixed h-screen w-full z-30 bottom-0 bg-white px-3 py-8 translate-y-full"
      >
        <FinishRide
          ride={ride}
          onClose={() => setFinishRidePanel(false)}
          onFinished={handleFinished}
        />
      </div>
    </div>
  );
};

export default DriverRiding;
