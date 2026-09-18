import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import MapView from "../components/MapView";

const API_URL = import.meta.env.VITE_BASEAPP_BACKEND_URL || "http://localhost:4000";

const Riding = () => {
  const { socket } = useContext(SocketContext);
  const [ride, setRide] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const rideId = localStorage.getItem("activeUserRide");
    if (!rideId) { setError("There is no active ride."); return undefined; }
    axios.get(`${API_URL}/api/rides/${rideId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } })
      .then(({ data }) => setRide(data.data.ride))
      .catch(() => setError("Could not load this ride."));
    return undefined;
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const updateRide = ({ ride: updated }) => updated && setRide((current) => ({ ...updated, otp: updated.otp || current?.otp }));
    const updateLocation = ({ location }) => setRide((current) => current ? { ...current, driver: { ...current.driver, location } } : current);
    socket.on("ride-status-updated", updateRide);
    socket.on("ride-completed", updateRide);
    socket.on("driver-location-updated", updateLocation);
    return () => { socket.off("ride-status-updated", updateRide); socket.off("ride-completed", updateRide); socket.off("driver-location-updated", updateLocation); };
  }, [socket]);

  if (error) return <main className="p-6"><p>{error}</p><Link className="mt-4 inline-block text-blue-700" to="/home">Return home</Link></main>;
  if (!ride) return <main className="p-6">Loading ride…</main>;
  const driver = ride.driver;
  return <main className="min-h-screen bg-gray-100"><MapView className="h-[50vh]" driverLocation={driver?.location} /><section className="mx-auto -mt-4 max-w-xl rounded-t-3xl bg-white p-5 shadow-xl"><Link to="/home" className="float-right text-sm text-blue-700">Home</Link><h1 className="text-2xl font-bold">Your ride</h1><p className="mt-2 capitalize">Status: <strong>{ride.status.replace("_", " ")}</strong></p>{driver ? <div className="mt-4 rounded-lg bg-gray-100 p-4"><p className="font-semibold">{driver.fullname?.firstname} {driver.fullname?.lastname}</p><p className="text-sm">{driver.vehicle?.color} {driver.vehicle?.vehicleType} · {driver.vehicle?.plate}</p></div> : <p className="mt-4 text-gray-600">We are matching you with a driver.</p>}<div className="mt-5 space-y-2 text-sm"><p><strong>Pickup:</strong> {ride.pickup}</p><p><strong>Destination:</strong> {ride.destination}</p><p><strong>Fare:</strong> ₹{ride.fare}</p>{ride.otp && ["accepted", "arriving"].includes(ride.status) && <p className="rounded bg-yellow-100 p-3 font-semibold">Your OTP: {ride.otp}</p>}</div>{ride.status === "completed" && <p className="mt-5 rounded bg-green-100 p-3 text-green-800">Ride completed. Thank you for riding.</p>}</section></main>;
};

export default Riding;
