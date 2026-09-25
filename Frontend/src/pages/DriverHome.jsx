import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { DriverDataContext } from "../context/DriverContext";
import { SocketContext } from "../context/SocketContext";
import MapView from "../components/MapView";
import RidePopUp from "../components/RidePopUp";
import uberLogo from "../../assets/images/uber_logo.png";

const API_URL = import.meta.env.VITE_BASEAPP_BACKEND_URL || "http://localhost:4000";
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("driverToken")}` });

const DriverHome = () => {
  const navigate = useNavigate();
  const { driver, updateDriver } = useContext(DriverDataContext);
  const { socket, connect } = useContext(SocketContext);
  const [location, setLocation] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const publishLocation = useCallback((afterPublish) => {
    if (!navigator.geolocation || !socket?.connected) return afterPublish?.(new Error("Location or socket connection is unavailable"));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const point = { lat: coords.latitude, lng: coords.longitude };
        setLocation(point);
        socket.emit("update-driver-location", { location: point }, (result) => afterPublish?.(result?.ok ? null : new Error(result?.message)));
      },
      () => afterPublish?.(new Error("Location permission is required to go online")),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 10_000 }
    );
  }, [socket]);

  useEffect(() => {
    if (!socket || !driver?._id) return undefined;
    connect();
    const join = () => socket.emit("join", { token: localStorage.getItem("driverToken"), userType: "driver" });
    const receivedRide = ({ ride }) => setRideRequest(ride);
    socket.on("connect", join);
    socket.on("ride-request", receivedRide);
    if (socket.connected) join();
    return () => { socket.off("connect", join); socket.off("ride-request", receivedRide); };
  }, [connect, driver?._id, socket]);

  useEffect(() => {
    if (!socket?.connected || !driver?._id) return undefined;
    publishLocation();
    const locationInterval = window.setInterval(() => publishLocation(), 15_000);
    return () => window.clearInterval(locationInterval);
  }, [driver?._id, publishLocation, socket?.connected]);

  const setOnline = () => {
    setWorking(true); setError("");
    publishLocation(async (locationError) => {
      if (locationError) { setError(locationError.message); setWorking(false); return; }
      try {
        const { data } = await axios.patch(`${API_URL}/api/drivers/status`, { status: driver.status === "available" ? "offline" : "available" }, { headers: headers() });
        updateDriver(data.data.driver);
        socket.emit(data.data.driver.status === "available" ? "driver-online" : "driver-offline");
      } catch (requestError) { setError(requestError.response?.data?.error?.message || "Could not update availability."); }
      setWorking(false);
    });
  };

  const acceptRide = async () => {
    setWorking(true); setError("");
    try {
      const { data } = await axios.post(`${API_URL}/api/rides/${rideRequest._id}/accept`, {}, { headers: headers() });
      localStorage.setItem("activeDriverRide", data.data.ride._id);
      updateDriver({ ...driver, status: "busy" });
      navigate("/driver-riding");
    } catch (requestError) { setError(requestError.response?.data?.error?.message || "This ride is no longer available."); }
    finally { setWorking(false); }
  };

  const rejectRide = async () => {
    if (!rideRequest) return;
    setWorking(true);
    try { await axios.post(`${API_URL}/api/rides/${rideRequest._id}/reject`, {}, { headers: headers() }); setRideRequest(null); }
    catch (requestError) { setError(requestError.response?.data?.error?.message || "Could not reject this ride."); }
    finally { setWorking(false); }
  };

  return <main className="min-h-screen bg-gray-100"><header className="absolute z-10 flex w-full items-center justify-between p-5"><img className="w-16" src={uberLogo} alt="Uber" /><Link to="/driver-logout" className="rounded bg-white px-3 py-2 shadow">Log out</Link></header><MapView className="h-[55vh]" driverLocation={location || driver?.location} />
    <section className="mx-auto mt-4 max-w-xl rounded-t-3xl bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><div><h1 className="text-xl font-bold">{driver?.fullname?.firstname} {driver?.fullname?.lastname}</h1><p className="text-sm text-gray-600">{driver?.vehicle?.color} {driver?.vehicle?.vehicleType} · {driver?.vehicle?.plate}</p></div><span className={`rounded-full px-3 py-1 text-sm font-medium ${driver?.status === "available" ? "bg-green-100 text-green-800" : "bg-gray-200"}`}>{driver?.status || "offline"}</span></div><p className="mt-4 text-sm text-gray-600">Earnings and trip statistics are available after completed rides are recorded.</p>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}<button type="button" onClick={setOnline} disabled={working || driver?.status === "busy"} className="mt-5 w-full rounded-lg bg-black p-3 font-semibold text-white disabled:opacity-60">{driver?.status === "available" ? "Go offline" : driver?.status === "busy" ? "Ride in progress" : "Go online"}</button></section>
    {rideRequest && <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-xl"><RidePopUp ride={rideRequest} loading={working} onAccept={acceptRide} onReject={rejectRide} onClose={() => setRideRequest(null)} /></div>}</main>;
};

export default DriverHome;
