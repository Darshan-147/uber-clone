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
              Authorization: `Bearer ${localStorage.getItem("driverToken") || localStorage.getItem("token")}`,
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
      <div className="h-screen grid place-items-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-semibold text-gray-600">Loading ride...</p>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="h-screen p-5 grid place-items-center text-center bg-white">
        <div>
          <i className="ri-taxi-line text-5xl text-gray-300 mb-4 block"></i>
          <h1 className="text-2xl font-semibold mb-2">No ride in progress</h1>
          <p className="text-gray-500 text-sm mb-5">Head back to find new rides.</p>
          <Link
            to="/driver-home"
            className="inline-flex bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-green-600 text-white rounded-lg px-3 py-1 font-bold text-sm">BMR</div>
        <span className="font-bold text-white text-base drop-shadow-lg">BookMyRide</span>
      </div>

      <Link
        to="/driver-home"
        className="fixed top-3 right-3 z-20 rounded-full bg-white py-2 px-3 shadow text-sm font-semibold hover:bg-gray-100"
      >
        <i className="ri-home-3-line mr-1"></i>Home
      </Link>

      {/* Map */}
      <div className="h-4/5">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Map"
        />
      </div>

      {/* Bottom CTA */}
      <button
        type="button"
        className="h-1/5 bg-green-500 relative flex justify-between items-center w-full hover:bg-green-600 transition-colors"
        onClick={() => setFinishRidePanel(true)}
      >
        <span className="absolute w-full text-center top-1 text-white text-3xl">
          <i className="ri-arrow-up-wide-line"></i>
        </span>
        <div className="p-5 flex justify-between items-center w-full text-left">
          <div>
            <h4 className="text-xl font-bold text-white">Ride in Progress</h4>
            <p className="text-sm text-green-100">{ride.destination}</p>
          </div>
          <span className="bg-white text-green-700 px-4 py-2 rounded-xl font-bold text-sm shadow">
            Complete Ride
          </span>
        </div>
      </button>

      {/* Finish Ride Panel */}
      <div
        ref={finishRidePanelRef}
        className="fixed h-screen w-full z-30 bottom-0 bg-white px-3 py-8 translate-y-full rounded-t-3xl shadow-xl"
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
