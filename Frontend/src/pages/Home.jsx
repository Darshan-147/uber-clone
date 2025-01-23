import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../components/LocationSearchPanel";

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const [vehiclePanel, setVehiclePanel] = useState(false);

  const submitHandler = (e) => {
    e.preventDefault();
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
        <div className="h-[30%] p-5 bg-white relative">
          <h4 className="font-semibold text-3xl">Find a trip</h4>
          <h5
            ref={panelCloseRef}
            onClick={() => setPanelOpen(false)}
            className="absolute right-5 top-5 font-semibold text-3xl opacity-0"
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <form
            onSubmit={(e) => {
              submitHandler(e);
            }}
          >
            <div className="line absolute h-16 w-1 bg-black top-[44%] left-8 rounded-full"></div>
            <input
              value={pickup}
              onClick={() => {
                setPanelOpen(true);
              }}
              onChange={(e) => {
                setPickup(e.target.value);
              }}
              className="bg-[#eee] px-8 py-3 w-full mt-5 rounded-2xl"
              type="text"
              placeholder="Enter your pickup location"
            />
            <input
              value={destination}
              onClick={() => {
                setPanelOpen(true);
              }}
              onChange={(e) => {
                setDestination(e.target.value);
              }}
              className="bg-[#eee] px-8 py-3 w-full mt-3 rounded-2xl"
              type="text"
              placeholder="Enter your destination"
            />
          </form>
        </div>
        <div ref={panelRef} className="h-0 bg-white">
          <LocationSearchPanel vehiclePanel={vehiclePanel} setVehiclePanel={setVehiclePanel}/>
        </div>
      </div>
      {/* Vehicles section */}
      <div className="fixed w-full z-10 bottom-0 bg-white px-3 py-8 translate-y-full">
        <h3 className="text-2xl font-semibold mb-5">Choose a vehicle</h3>

        <div className="flex border-2 active:border-black rounded-xl w-full p-3 mb-4 items-center justify-between">
          <img className="h-10 w-16" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4AGLOTGHSbWFi3XP-8x2dDD63dBBl3se-tQ&s" alt="UberGo" />
              <div className="ml-2 w-1/2"> 
                <h4 className="font-medium text-base">UberGo <span><i className="ri-user-3-fill"></i>4</span></h4>
                <h5 className="font-medium text-sm">2 mins away</h5>
                <p className="font-normal text-xs text-gray-500">Affordable, compact rides</p>
              </div>
            <h2 className="font-semibold text-xl">₹120.21</h2>
        </div>
        <div className="flex border-2 active:border-black rounded-xl w-full p-3 mb-4 items-center justify-between">
          <img className="h-10 w-16" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS50dWc9jVI7sEuKrjwkvIKFFShG0hab9uA4A&s" alt="MBenz" />
              <div className="ml-2 w-1/2"> 
                <h4 className="font-medium text-base">Mercedes Benz <span><i className="ri-user-3-fill"></i>5</span></h4>
                <h5 className="font-medium text-sm">5 mins away</h5>
                <p className="font-normal text-xs text-gray-500">Luxurious ride for luxurious people</p>
              </div>
            <h2 className="font-semibold text-xl">₹520.67</h2>
        </div>
        <div className="flex border-2 active:border-black rounded-xl w-full p-3 mb-4 items-center justify-between">
          <img className="h-10 w-14" src="https://w1.pngwing.com/pngs/381/835/png-transparent-yamaha-logo-car-decal-motorcycle-sticker-sport-bike-yamaha-yzfr1-bicycle.png" alt="Bike" />
              <div className="ml-2 w-1/2"> 
                <h4 className="font-medium text-base">Motorcycle <span><i className="ri-user-3-fill"></i>1</span></h4>
                <h5 className="font-medium text-sm">1 min away</h5>
                <p className="font-normal text-xs text-gray-500">For bike lovers</p>
              </div>
            <h2 className="font-semibold text-xl">₹70.32</h2>
        </div>

      </div>
    </div>
  );
};

export default Home;
