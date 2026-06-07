import React, { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import { SocketContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [lookingForDriver, setLookingForDriver] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState("");
  const [fare, setFare] = useState({});
  const [vehicleType, setVehicleType] = useState("");
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(false);

  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const lookingForDriverRef = useRef(null);
  const waitingForDriverRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  const { sendMessage, recieveMessage } = useContext(SocketContext);
  const { user } = useContext(UserDataContext);

  useEffect(() => {
    if (user?._id) {
      sendMessage("join", { userType: "user", userId: user._id });
    }
  }, [user, sendMessage]);

  // Socket listeners for ride lifecycle
  useEffect(() => {
    const removeAccepted = recieveMessage("ride-accepted", (data) => {
      setRide((currentRide) => ({
        ...currentRide,
        ...data,
        otp: data?.otp || currentRide?.otp,
      }));
      // Transition from "looking" to "waiting for driver"
      setLookingForDriver(false);
      setWaitingForDriver(true);
      toast.success("Driver accepted your ride!");
    });

    const removeOtpVerified = recieveMessage("otp-verified", (data) => {
      const activeRide = data?.ride || data;
      sessionStorage.setItem("activeRide", JSON.stringify(activeRide));
      setWaitingForDriver(false);
      navigate("/user-riding", { state: { ride: activeRide } });
    });

    const removeCompleted = recieveMessage("ride-completed", () => {
      sessionStorage.removeItem("activeRide");
      resetRideState();
      toast.success("Ride completed! Thank you for using BookMyRide.");
    });

    const removeCancelled = recieveMessage("ride-cancelled", (data) => {
      sessionStorage.removeItem("activeRide");
      resetRideState();
      toast.warning(data?.message || "Ride was cancelled.");
    });

    return () => {
      removeAccepted?.();
      removeOtpVerified?.();
      removeCompleted?.();
      removeCancelled?.();
    };
  }, [navigate, recieveMessage, toast]);

  const resetRideState = () => {
    setRide(null);
    setLookingForDriver(false);
    setWaitingForDriver(false);
    setConfirmRidePanel(false);
    setVehiclePanel(false);
    setPickup("");
    setDestination("");
  };

  const submitHandler = (e) => e.preventDefault();

  const fetchSuggestions = async (input) => {
    try {
      if (!input?.trim()) { setSuggestions([]); return; }
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/maps/get-suggestions`,
        {
          params: { input: input.trim() },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data) setSuggestions(response.data);
    } catch {
      setSuggestions([]);
    }
  };

  const debouncedFetchSuggestions = (input) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!input?.trim() || input.trim().length <= 3) { setSuggestions([]); return; }
    debounceTimerRef.current = setTimeout(() => fetchSuggestions(input), 500);
  };

  const handleSuggestionClick = (suggestion) => {
    if (activeField === "pickup") setPickup(suggestion.name);
    else if (activeField === "destination") setDestination(suggestion.name);
    setSuggestions([]);
    setPanelOpen(false);
  };

  const findTrip = async () => {
    if (!pickup || !destination) {
      toast.error("Please enter pickup and destination.");
      return;
    }
    setVehiclePanel(true);
    setPanelOpen(false);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/get-fare`,
        {
          params: { pickup: pickup.trim(), destination: destination.trim() },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken") || localStorage.getItem("token")}`,
          },
        },
      );
      setFare(response.data);
    } catch {
      toast.error("Failed to fetch fare. Check your locations.");
      setVehiclePanel(false);
    }
  };

  const createRide = async () => {
    if (!vehicleType) { toast.error("Please select a vehicle type."); return; }
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/create-ride`,
        { pickup: pickup.trim(), destination: destination.trim(), vehicleType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken") || localStorage.getItem("token")}`,
          },
        },
      );
      setRide(response.data);
      setConfirmRidePanel(false);
      setVehiclePanel(false);
      setLookingForDriver(true);
      toast.info("Looking for a driver near you...");
    } catch {
      toast.error("Failed to create ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelRide = async () => {
    if (!ride?._id) { resetRideState(); return; }
    try {
      await axios.post(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/cancel-ride`,
        { rideId: ride._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken") || localStorage.getItem("token")}`,
          },
        },
      );
      toast.info("Ride cancelled.");
    } catch {
      toast.error("Could not cancel ride.");
    } finally {
      resetRideState();
    }
  };

  const images = {
    auto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4AGLOTGHSbWFi3XP-8x2dDD63dBBl3se-tQ&s",
    car: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS50dWc9jVI7sEuKrjwkvIKFFShG0hab9uA4A&s",
    bike: "https://w1.pngwing.com/pngs/381/835/png-transparent-yamaha-logo-car-decal-motorcycle-sticker-sport-bike-yamaha-yzfr1-bicycle.png",
  };

  useGSAP(() => {
    gsap.to(panelRef.current, panelOpen
      ? { height: "70%", padding: 20, opacity: 1 }
      : { height: "0%", padding: 0, opacity: 0 });
    gsap.to(panelCloseRef.current, { opacity: panelOpen ? 1 : 0 });
  }, [panelOpen]);

  useGSAP(() => {
    gsap.to(vehiclePanelRef.current, { transform: vehiclePanel ? "translateY(0%)" : "translateY(100%)" });
  }, [vehiclePanel]);

  useGSAP(() => {
    gsap.to(confirmRidePanelRef.current, { transform: confirmRidePanel ? "translateY(0%)" : "translateY(100%)" });
  }, [confirmRidePanel]);

  useGSAP(() => {
    gsap.to(lookingForDriverRef.current, { transform: lookingForDriver ? "translateY(0%)" : "translateY(100%)" });
  }, [lookingForDriver]);

  useGSAP(() => {
    gsap.to(waitingForDriverRef.current, { transform: waitingForDriver ? "translateY(0%)" : "translateY(100%)" });
  }, [waitingForDriver]);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-black text-white rounded-lg px-3 py-1 font-bold text-sm tracking-tight shadow">BMR</div>
        <span className="font-bold text-white text-base drop-shadow-lg">BookMyRide</span>
      </div>

      <Link
        to="/user-logout"
        className="fixed top-3 right-3 z-20 bg-white rounded-full py-2 px-4 text-sm font-semibold shadow hover:bg-gray-100"
      >
        <i className="ri-logout-box-r-line mr-1"></i>Logout
      </Link>

      {/* Map background */}
      <div className="h-screen w-screen">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Map"
        />
      </div>

      {/* Search Panel */}
      <div className="absolute h-screen flex flex-col justify-end top-0 w-full">
        <div className="p-5 bg-white relative rounded-t-3xl shadow-xl">
          <h4 className="font-semibold text-2xl">Find a trip</h4>
          <h5
            ref={panelCloseRef}
            onClick={() => setPanelOpen(false)}
            className="absolute right-5 top-5 font-semibold text-3xl opacity-0 cursor-pointer text-gray-400"
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <form onSubmit={submitHandler}>
            <div className="line absolute h-16 w-1 bg-black top-[38%] left-9 rounded-full"></div>
            <input
              value={pickup}
              onClick={() => { setPanelOpen(true); setActiveField("pickup"); }}
              onChange={(e) => { setPickup(e.target.value); debouncedFetchSuggestions(e.target.value); }}
              className="bg-gray-100 px-8 py-3 w-full mt-5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              type="text"
              placeholder="Enter your pickup location"
            />
            <input
              value={destination}
              onClick={() => { setPanelOpen(true); setActiveField("destination"); }}
              onChange={(e) => { setDestination(e.target.value); debouncedFetchSuggestions(e.target.value); }}
              className="bg-gray-100 px-8 py-3 w-full mt-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              type="text"
              placeholder="Enter your destination"
            />
          </form>
          <button
            onClick={findTrip}
            className="bg-black text-white mt-4 p-3 w-full rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Find Trip
          </button>
        </div>

        {/* Suggestions */}
        <div ref={panelRef} className="bg-white z-30 max-h-[70vh] overflow-y-auto opacity-0">
          <LocationSearchPanel
            setPanelOpen={setPanelOpen}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>
      </div>

      {/* Vehicle Selection */}
      <div ref={vehiclePanelRef} className="fixed w-full z-10 bottom-0 bg-white px-3 py-8 translate-y-full rounded-t-3xl shadow-xl">
        <VehiclePanel
          fare={fare}
          image={images}
          setVehicleType={setVehicleType}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehiclePanel={setVehiclePanel}
        />
      </div>

      {/* Confirm Ride */}
      <div ref={confirmRidePanelRef} className="fixed w-full z-10 bottom-0 bg-white px-3 py-8 pt-12 translate-y-full rounded-t-3xl shadow-xl">
        <ConfirmRide
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          image={images}
          createRide={createRide}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehiclePanel={setVehiclePanel}
          loading={loading}
        />
      </div>

      {/* Looking For Driver */}
      <div ref={lookingForDriverRef} className="fixed w-full z-10 bottom-0 bg-white px-3 py-8 pt-12 translate-y-full rounded-t-3xl shadow-xl">
        <LookingForDriver
          ride={ride}
          setVehicleFound={setLookingForDriver}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          image={images}
          onCancel={cancelRide}
        />
      </div>

      {/* Waiting For Driver (after acceptance) */}
      <div ref={waitingForDriverRef} className="fixed w-full z-10 bottom-0 bg-white px-3 py-8 pt-12 translate-y-full rounded-t-3xl shadow-xl">
        <WaitingForDriver
          ride={ride}
          setWaitingForDriver={setWaitingForDriver}
        />
      </div>
    </div>
  );
};

export default Home;
