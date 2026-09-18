import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DriverDataContext } from "../context/DriverContext";
import { SocketContext } from "../context/SocketContext";
import MapView from "../components/MapView";
import ConfirmRidePopUp from "../components/ConfirmRidePopUp";
import FinishRide from "../components/FinishRide";

const API_URL = import.meta.env.VITE_BASEAPP_BACKEND_URL || "http://localhost:4000";
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("driverToken")}` });

const DriverRiding = () => {
  const navigate = useNavigate();
  const { driver, updateDriver } = useContext(DriverDataContext);
  const { socket } = useContext(SocketContext);
  const [ride, setRide] = useState(null);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const rideId = localStorage.getItem("activeDriverRide");
    if (!rideId) { setError("There is no active ride."); return undefined; }
    axios.get(`${API_URL}/api/rides/${rideId}`, { headers: headers() }).then(({ data }) => setRide(data.data.ride)).catch(() => setError("Could not load this ride."));
    return undefined;
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const updateRide = ({ ride: updated }) => updated && setRide(updated);
    socket.on("ride-status-updated", updateRide);
    socket.on("ride-completed", updateRide);
    return () => { socket.off("ride-status-updated", updateRide); socket.off("ride-completed", updateRide); };
  }, [socket]);

  const action = async (path, body = {}) => {
    if (!ride) return;
    setWorking(true); setError("");
    try { const { data } = await axios.post(`${API_URL}/api/rides/${ride._id}/${path}`, body, { headers: headers() }); setRide(data.data.ride); return data.data.ride; }
    catch (requestError) { setError(requestError.response?.data?.error?.message || "Could not update this ride."); return null; }
    finally { setWorking(false); }
  };

  const arrive = () => action("arrive");
  const verify = (otp) => action("verify-otp", { otp });
  const start = () => action("start");
  const cancel = async () => { const updated = await action("cancel"); if (updated) { localStorage.removeItem("activeDriverRide"); updateDriver({ ...driver, status: "available" }); navigate("/driver-home"); } };
  const complete = async () => { const updated = await action("complete"); if (updated) { localStorage.removeItem("activeDriverRide"); updateDriver({ ...driver, status: "available" }); navigate("/driver-home"); } };

  if (error && !ride) return <main className="p-6"><p>{error}</p><button type="button" onClick={() => navigate("/driver-home")} className="mt-4 text-blue-700">Return to driver home</button></main>;
  if (!ride) return <main className="p-6">Loading ride…</main>;
  return <main className="min-h-screen bg-gray-100"><MapView className="h-[58vh]" driverLocation={driver?.location} /><section className="mx-auto -mt-4 max-w-xl rounded-t-3xl bg-white p-5 shadow-xl"><h1 className="text-2xl font-bold capitalize">{ride.status.replace("_", " ")}</h1><div className="mt-4 space-y-2 text-sm"><p><strong>Rider:</strong> {ride.user?.fullname?.firstname} {ride.user?.fullname?.lastname}</p><p><strong>Pickup:</strong> {ride.pickup}</p><p><strong>Destination:</strong> {ride.destination}</p><p><strong>Fare:</strong> ₹{ride.fare}</p></div>{error && <p className="mt-4 text-sm text-red-600">{error}</p>}{ride.status === "accepted" && <button type="button" onClick={arrive} disabled={working} className="mt-5 w-full rounded bg-black p-3 font-semibold text-white">{working ? "Updating…" : "I have arrived"}</button>}{ride.status === "arriving" && <div className="mt-5"><ConfirmRidePopUp ride={ride} loading={working} onVerify={verify} onStart={start} onCancel={cancel} /></div>}{ride.status === "in_progress" && <div className="mt-5"><FinishRide onComplete={complete} loading={working} /></div>}</section></main>;
};

export default DriverRiding;
