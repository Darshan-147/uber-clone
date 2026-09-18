import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import { SocketContext } from "../context/SocketContext";
import MapView from "../components/MapView";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";
import uberLogo from "../../assets/images/uber_logo.png";

const API_URL = import.meta.env.VITE_BASEAPP_BACKEND_URL || "http://localhost:4000";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("userToken")}` });

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserDataContext);
  const { socket, connect } = useContext(SocketContext);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupPoint, setPickupPoint] = useState(null);
  const [destinationPoint, setDestinationPoint] = useState(null);
  const [activeField, setActiveField] = useState("pickup");
  const [suggestions, setSuggestions] = useState([]);
  const [fare, setFare] = useState(null);
  const [vehicleType, setVehicleType] = useState("");
  const [step, setStep] = useState("search");
  const [ride, setRide] = useState(null);
  const [error, setError] = useState("");
  const [loadingFare, setLoadingFare] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const driverLocation = ride?.driver?.location;
  const storedRideId = useMemo(() => localStorage.getItem("activeUserRide"), []);

  useEffect(() => {
    if (!socket || !user?._id) return undefined;
    connect();
    const join = () => socket.emit("join", { token: localStorage.getItem("userToken"), userType: "user" });
    const updateRide = ({ ride: updatedRide }) => {
      if (!updatedRide) return;
      setRide((current) => ({ ...updatedRide, otp: updatedRide.otp || current?.otp }));
      localStorage.setItem("activeUserRide", updatedRide._id);
    };
    const locationUpdate = ({ location }) => setRide((current) => current ? { ...current, driver: { ...current.driver, location } } : current);
    socket.on("connect", join);
    socket.on("driver-assigned", updateRide);
    socket.on("ride-accepted", updateRide);
    socket.on("ride-status-updated", updateRide);
    socket.on("ride-completed", updateRide);
    socket.on("driver-location-updated", locationUpdate);
    if (socket.connected) join();
    return () => {
      socket.off("connect", join);
      socket.off("driver-assigned", updateRide);
      socket.off("ride-accepted", updateRide);
      socket.off("ride-status-updated", updateRide);
      socket.off("ride-completed", updateRide);
      socket.off("driver-location-updated", locationUpdate);
    };
  }, [connect, socket, user?._id]);

  useEffect(() => {
    if (!storedRideId) return;
    axios.get(`${API_URL}/api/rides/${storedRideId}`, { headers: authHeaders() })
      .then(({ data }) => {
        setRide(data.data.ride);
        setStep("waiting");
      })
      .catch(() => localStorage.removeItem("activeUserRide"));
  }, [storedRideId]);

  const fetchSuggestions = async (value) => {
    if (value.trim().length < 3) return setSuggestions([]);
    try {
      const { data } = await axios.get(`${API_URL}/api/maps/get-suggestions`, { params: { input: value }, headers: authHeaders() });
      setSuggestions(data.data?.suggestions || data);
    } catch {
      setSuggestions([]);
    }
  };

  const chooseSuggestion = (suggestion) => {
    if (activeField === "pickup") {
      setPickup(suggestion.name);
      setPickupPoint({ lat: suggestion.lat, lng: suggestion.lng });
    } else {
      setDestination(suggestion.name);
      setDestinationPoint({ lat: suggestion.lat, lng: suggestion.lng });
    }
    setSuggestions([]);
  };

  const findFare = async () => {
    if (pickup.trim().length < 3 || destination.trim().length < 3) {
      setError("Choose both pickup and destination locations.");
      return;
    }
    setLoadingFare(true);
    setError("");
    try {
      const { data } = await axios.get(`${API_URL}/api/rides/get-fare`, { params: { pickup, destination }, headers: authHeaders() });
      setFare(data.data.fare);
      setStep("vehicle");
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Could not calculate the fare.");
    } finally {
      setLoadingFare(false);
    }
  };

  const requestRide = async () => {
    const { data } = await axios.post(`${API_URL}/api/rides/create-ride`, { pickup, destination, vehicleType }, { headers: authHeaders() });
    let createdRide = data.data.ride;
    if (!createdRide.otp) {
      const otpResponse = await axios.get(`${API_URL}/api/rides/${createdRide._id}/otp`, { headers: authHeaders() });
      createdRide = { ...createdRide, otp: otpResponse.data.data.otp };
    }
    setRide(createdRide);
    localStorage.setItem("activeUserRide", createdRide._id);
    setStep("waiting");
  };

  const cancelRide = async () => {
    if (!ride) return;
    setCancelling(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/rides/${ride._id}/cancel`, {}, { headers: authHeaders() });
      setRide(data.data.ride);
      localStorage.removeItem("activeUserRide");
      setStep("search");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-gray-100">
      <header className="absolute z-10 flex w-full items-center justify-between p-5">
        <img className="w-16" src={uberLogo} alt="Uber" />
        <Link to="/logout" className="rounded bg-white px-3 py-2 shadow">Log out</Link>
      </header>
      <MapView className="h-[42vh]" pickup={pickupPoint} destination={destinationPoint} driverLocation={driverLocation} />
      <div className="mx-auto -mt-4 max-w-xl rounded-t-3xl bg-white p-5 shadow-xl">
        {step === "search" && <>
          <h1 className="text-2xl font-bold">Where to?</h1>
          <label className="mt-4 block text-sm font-medium">Pickup</label>
          <input value={pickup} onFocus={() => setActiveField("pickup")} onChange={(event) => { setPickup(event.target.value); fetchSuggestions(event.target.value); }} className="mt-1 w-full rounded-lg bg-gray-100 p-3" placeholder="Enter pickup location" />
          <label className="mt-3 block text-sm font-medium">Destination</label>
          <input value={destination} onFocus={() => setActiveField("destination")} onChange={(event) => { setDestination(event.target.value); fetchSuggestions(event.target.value); }} className="mt-1 w-full rounded-lg bg-gray-100 p-3" placeholder="Enter destination" />
          {suggestions.length > 0 && <ul className="mt-2 max-h-44 overflow-y-auto rounded-lg border">{suggestions.map((suggestion) => <li key={`${suggestion.name}-${suggestion.lat}-${suggestion.lng}`}><button type="button" onClick={() => chooseSuggestion(suggestion)} className="w-full p-3 text-left hover:bg-gray-50">{suggestion.name}</button></li>)}</ul>}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button type="button" onClick={findFare} disabled={loadingFare} className="mt-5 w-full rounded-lg bg-black p-3 font-semibold text-white disabled:opacity-60">{loadingFare ? "Calculating…" : "Find rides"}</button>
        </>}
        {step === "vehicle" && <VehiclePanel fare={fare} selected={vehicleType} onSelect={(type) => { setVehicleType(type); setStep("confirm"); }} />}
        {step === "confirm" && <ConfirmRide pickup={pickup} destination={destination} vehicleType={vehicleType} fare={fare} onConfirm={requestRide} onBack={() => setStep("vehicle")} />}
        {step === "waiting" && ride && <LookingForDriver ride={ride} cancelling={cancelling} onCancel={cancelRide} />}
        {ride?.status === "in_progress" && <button type="button" onClick={() => navigate("/riding")} className="mt-4 w-full rounded-lg bg-black p-3 font-semibold text-white">Open active ride</button>}
      </div>
    </main>
  );
};

export default Home;
