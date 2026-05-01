import React, { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";
import { SocketContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
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
  const vehicleFoundRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const navigate = useNavigate();

  const { sendMessage, recieveMessage } = useContext(SocketContext);
  const { user } = useContext(UserDataContext);

  useEffect(() => {
    if (user?._id) {
      sendMessage("join", { userType: "user", userId: user._id });
    }
  }, [user, sendMessage]);

  // Listen for ride acceptance from driver
  useEffect(() => {
    const removeAccepted = recieveMessage("ride-accepted", (data) => {
      console.log("Ride accepted:", data);
      setRide((currentRide) => ({
        ...currentRide,
        ...data,
        otp: data?.otp || currentRide?.otp,
      }));
      setVehicleFound(true);
    });

    const removeOtpVerified = recieveMessage("otp-verified", (data) => {
      console.log("OTP verified, ride started:", data);
      alert("OTP verified! Ride has started.");
      sessionStorage.setItem("activeRide", JSON.stringify(data?.ride || data));
      navigate("/riding", { state: { ride: data?.ride || data } });
    });

    const removeCompleted = recieveMessage("ride-completed", (data) => {
      console.log("Ride completed:", data);
      alert("Ride completed! Thank you for using Uber.");
      sessionStorage.removeItem("activeRide");
      resetRideState();
    });

    const removeCancelled = recieveMessage("ride-cancelled", (data) => {
      console.log("Ride cancelled:", data?.message);
      alert(`Ride cancelled: ${data?.message || "Ride cancelled"}`);
      sessionStorage.removeItem("activeRide");
      resetRideState();
    });

    return () => {
      removeAccepted?.();
      removeOtpVerified?.();
      removeCompleted?.();
      removeCancelled?.();
    };
  }, [navigate, recieveMessage]);

  const resetRideState = () => {
    setRide(null);
    setVehicleFound(false);
    setConfirmRidePanel(false);
    setVehiclePanel(false);
    setPickup("");
    setDestination("");
  };

  const submitHandler = (e) => {
    e.preventDefault();
  };

  const fetchSuggestions = async (input) => {
    try {
      if (!input || input.trim() === "") {
        setSuggestions([]);
        return;
      }

      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/maps/get-suggestions`,
        {
          params: { input: input.trim() },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data) {
        setSuggestions(response.data);
      }
    } catch (error) {
      console.error(
        "Error fetching suggestions:",
        error.response?.data || error.message,
      );
      setSuggestions([]);
    }
  };

  const debouncedFetchSuggestions = (input) => {
    // Clear previous timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Clear suggestions if input is empty or too short
    if (!input || input.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    // Only fetch if more than 3 characters
    if (input.trim().length > 3) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(input);
      }, 500); // 500ms debounce delay
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (activeField === "pickup") {
      setPickup(suggestion.name);
    } else if (activeField === "destination") {
      setDestination(suggestion.name);
    }
    setSuggestions([]);
    setPanelOpen(false);
  };

  const findTrip = async () => {
    try {
      if (!pickup || !destination) {
        alert("Please enter pickup and destination");
        return;
      }

      setVehiclePanel(true);
      setPanelOpen(false);

      const response = await axios.get(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/get-fare`,
        {
          params: {
            pickup: pickup.trim(),
            destination: destination.trim(),
          },
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("userToken") || localStorage.getItem("token")
            }`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Fare response:", response.data);
      setFare(response.data);
    } catch (error) {
      console.error(
        "Error getting fare:",
        error.response?.data || error.message,
      );
      alert("Failed to fetch fare");
    }
  };

  const createRide = async () => {
    try {
      if (!vehicleType) {
        alert("Please select a vehicle type");
        return;
      }

      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/create-ride`,
        {
          pickup: pickup.trim(),
          destination: destination.trim(),
          vehicleType,
        },
        {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("userToken") || localStorage.getItem("token")
            }`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Ride created:", response.data);
      setRide(response.data);
      setConfirmRidePanel(false);
      setVehiclePanel(false);
      setVehicleFound(true);

      return response.data;
    } catch (error) {
      console.error(
        "Error creating ride:",
        error.response?.data || error.message,
      );
      alert("Failed to create ride");
    } finally {
      setLoading(false);
    }
  };

  const images = {
    auto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4AGLOTGHSbWFi3XP-8x2dDD63dBBl3se-tQ&s",
    car: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS50dWc9jVI7sEuKrjwkvIKFFShG0hab9uA4A&s",
    bike: "https://w1.pngwing.com/pngs/381/835/png-transparent-yamaha-logo-car-decal-motorcycle-sticker-sport-bike-yamaha-yzfr1-bicycle.png",
  };

  useGSAP(() => {
    if (panelOpen) {
      gsap.to(panelRef.current, {
        height: "70%",
        padding: 20,
        opacity: 1,
      });
      gsap.to(panelCloseRef.current, {
        opacity: 1,
      });
    } else {
      gsap.to(panelRef.current, {
        height: "0%",
        padding: 0,
        opacity: 0,
      });
      gsap.to(panelCloseRef.current, {
        opacity: 0,
      });
    }
  }, [panelOpen]);

  useGSAP(() => {
    if (vehiclePanel) {
      gsap.to(vehiclePanelRef.current, {
        transform: "translateY(0%)",
      });
    } else {
      gsap.to(vehiclePanelRef.current, {
        transform: "translateY(100%)",
      });
    }
  }, [vehiclePanel]);

  useGSAP(() => {
    if (confirmRidePanel) {
      gsap.to(confirmRidePanelRef.current, {
        transform: "translateY(0%)",
      });
    } else {
      gsap.to(confirmRidePanelRef.current, {
        transform: "translateY(100%)",
      });
    }
  }, [confirmRidePanel]);

  useGSAP(() => {
    if (vehicleFound) {
      gsap.to(vehicleFoundRef.current, {
        transform: "translateY(0%)",
      });
    } else {
      gsap.to(vehicleFoundRef.current, {
        transform: "translateY(100%)",
      });
    }
  }, [vehicleFound]);

  return (
    <div className="relative h-screen overflow-hidden">
      <img
        className="w-16 absolute top-5 left-5 z-20"
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt="Uber Logo"
      />

      <div className="h-screen w-screen">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Uber map"
        />
      </div>
      <div className="absolute h-screen flex flex-col justify-end top-0 w-full">
        <div className="p-5 bg-white relative">
          <h4 className="font-semibold text-2xl md:text-3xl">Find a trip</h4>
          <h5
            ref={panelCloseRef}
            onClick={() => {
              setPanelOpen(false);
            }}
            className="absolute right-5 top-5 font-semibold text-3xl opacity-0 cursor-pointer"
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <form onSubmit={(e) => submitHandler(e)}>
            {/* Vertical line */}
            <div className="line absolute h-16 w-1 bg-black top-[35%] left-9 rounded-full"></div>
            <input
              value={pickup}
              onClick={() => {
                setPanelOpen(true);
                setActiveField("pickup");
              }}
              onChange={(e) => {
                setPickup(e.target.value);
                debouncedFetchSuggestions(e.target.value);
              }}
              className="bg-[#eee] px-8 py-3 w-full mt-5 rounded-2xl"
              type="text"
              placeholder="Enter your pickup location"
            />
            <input
              value={destination}
              onClick={() => {
                setPanelOpen(true);
                setActiveField("destination");
              }}
              onChange={(e) => {
                setDestination(e.target.value);
                debouncedFetchSuggestions(e.target.value);
              }}
              className="bg-[#eee] px-8 py-3 w-full mt-3 rounded-2xl"
              type="text"
              placeholder="Enter your destination"
            />
          </form>
          <button
            onClick={findTrip}
            className="bg-black text-white mt-5 p-3 w-full rounded-lg font-semibold hover:bg-gray-800"
          >
            Find Trip
          </button>
        </div>
        {/* Suggestions Panel */}
        <div
          ref={panelRef}
          className="bg-white z-30 max-h-[70vh] overflow-y-auto opacity-0"
        >
          <LocationSearchPanel
            setPanelOpen={setPanelOpen}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>
      </div>
      {/* Vehicles section */}
      <div
        ref={vehiclePanelRef}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-8 translate-y-full"
      >
        <VehiclePanel
          fare={fare}
          image={images}
          setVehicleType={setVehicleType}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehiclePanel={setVehiclePanel}
        />
      </div>
      <div
        ref={confirmRidePanelRef}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-8 pt-12 translate-y-full"
      >
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
      <div
        ref={vehicleFoundRef}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-8 pt-12 translate-y-full"
      >
        <LookingForDriver
          ride={ride}
          setVehicleFound={setVehicleFound}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          image={images}
        />
      </div>
    </div>
  );
};

export default Home;
