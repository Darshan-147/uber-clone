import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";

const Home = () => {
  const [pickup, setPickup] = useState("Ahmedabad, GJ, India");
  const [destination, setDestination] = useState("Chennai, TN, India");
  const [panelOpen, setPanelOpen] = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState("");
  const [fare, setFare] = useState({});
  const [vehicleType, setVehicleType] = useState("");
  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const vehicleFoundRef = useRef(null);

  const submitHandler = (e) => {
    e.preventDefault();
  };

  const fetchSuggestions = async (input) => {
    try {
      if (!input || input.trim() === "") {
        setSuggestions([]);
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/maps/get-suggestions`,
        {
          params: { input: input.trim() },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setSuggestions(response.data);
      }
    } catch (error) {
      console.error(
        "Error fetching suggestions:",
        error.response?.data || error.message
      );
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
    setVehiclePanel(true);
    setPanelOpen(false);

    const response = await axios.get(
      `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/get-fare`,
      {
        params: {
          pickup,
          destination,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    setFare(response.data);
    console.log(response.data);
  };

  const images = {
    auto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4AGLOTGHSbWFi3XP-8x2dDD63dBBl3se-tQ&s",
    car: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS50dWc9jVI7sEuKrjwkvIKFFShG0hab9uA4A&s",
    bike: "https://w1.pngwing.com/pngs/381/835/png-transparent-yamaha-logo-car-decal-motorcycle-sticker-sport-bike-yamaha-yzfr1-bicycle.png",
  };

  const createRide = async () => {
    setVehiclePanel(false);
    setConfirmRidePanel(true);

    const response = await axios.post(
      `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/create-ride`,
      {
        pickup,
        destination,
        vehicleType,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    console.log(response.data);
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
        className="w-16 absolute top-5 left-5"
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
            className="absolute right-5 top-5 font-semibold text-3xl opacity-0"
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
                fetchSuggestions(e.target.value);
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
                fetchSuggestions(e.target.value);
              }}
              className="bg-[#eee] px-8 py-3 w-full mt-3 rounded-2xl"
              type="text"
              placeholder="Enter your destination"
            />
          </form>
          <button
            onClick={findTrip}
            className="bg-black text-white mt-5 p-3 w-full"
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
          setVehicleFound={setVehicleFound}
        />
      </div>
      <div
        ref={vehicleFoundRef}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-8 pt-12 translate-y-full"
      >
        <LookingForDriver
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
