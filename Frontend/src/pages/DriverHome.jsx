import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import RidePopUp from "../components/RidePopUp";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ConfirmRidePopUp from "../components/ConfirmRidePopUp";
import { DriverDataContext } from "../context/DriverContext";
import driverImage from "../../assets/images/driverImage.jpeg";
import { SocketContext } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import axios from "axios";

const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location access is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => reject(new Error("Allow location access to receive nearby rides.")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 },
    );
  });

const DriverHome = () => {
  const [ridePopUp, setRidePopUp] = useState(false);
  const [confirmRidePopUp, setConfirmRidePopUp] = useState(false);
  const [availableRides, setAvailableRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ earnings: 0, totalDistance: 0, rides: 0 });

  const ridePopUpRef = useRef(null);
  const confirmRidePopUpRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  const { sendMessage, recieveMessage } = useContext(SocketContext);
  const { driver } = useContext(DriverDataContext);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("driverToken") || localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    }),
    [],
  );

  const fetchAvailableRidesForLocation = useCallback(
    async ({ latitude, longitude, openPanel = true } = {}) => {
      const location =
        latitude !== undefined && longitude !== undefined
          ? { latitude, longitude }
          : await getCurrentLocation();

      const response = await axios.get(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/get-available-rides`,
        { params: location, headers: authHeaders },
      );

      const rides = response.data || [];
      setAvailableRides(rides);
      if (openPanel || rides.length > 0) setRidePopUp(true);
      return rides;
    },
    [authHeaders],
  );

  // Join socket and start location tracking
  useEffect(() => {
    if (!driver?._id) return;

    let locationInterval;
    let cancelled = false;

    const updateLocation = async ({ refreshRides = false } = {}) => {
      try {
        const { latitude, longitude } = await getCurrentLocation();
        if (cancelled) return;

        sendMessage("update-driver-location", {
          userId: driver._id,
          location: { lat: latitude, lng: longitude },
        });

        if (refreshRides) {
          await fetchAvailableRidesForLocation({ latitude, longitude, openPanel: false });
        }
      } catch (err) {
        console.warn(err.message);
      }
    };

    const removeJoined = recieveMessage("joined", () => {
      updateLocation({ refreshRides: true });
      locationInterval = setInterval(updateLocation, 10000);
    });

    sendMessage("join", { userId: driver._id, userType: "driver" });

    return () => {
      cancelled = true;
      removeJoined?.();
      clearInterval(locationInterval);
    };
  }, [driver, fetchAvailableRidesForLocation, recieveMessage, sendMessage]);

  // Listen for new ride broadcasts
  useEffect(() => {
    const handleNewRide = (ride) => {
      const incoming = ride?.data || ride;
      if (!incoming?._id) return;
      setAvailableRides((prev) => {
        const exists = prev.some((r) => r._id === incoming._id);
        return exists ? prev : [incoming, ...prev];
      });
      setRidePopUp(true);
      toast.info("New ride request nearby!");
    };

    const removeNewRide = recieveMessage("new-ride", handleNewRide);
    const removeNotification = recieveMessage("new-ride-notification", (data) =>
      handleNewRide(data?.ride),
    );
    const removeCancelled = recieveMessage("ride-cancelled", () => {
      setSelectedRide(null);
      setConfirmRidePopUp(false);
      toast.warning("The rider cancelled the ride.");
    });

    return () => {
      removeNewRide?.();
      removeNotification?.();
      removeCancelled?.();
    };
  }, [recieveMessage, toast]);

  // Load active/completed rides on mount
  useEffect(() => {
    const loadDriverState = async () => {
      try {
        const [activeRes, completedRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/get-driver-rides`,
            { params: { status: "accepted" }, headers: authHeaders },
          ),
          axios.get(
            `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/get-driver-rides`,
            { params: { status: "completed" }, headers: authHeaders },
          ),
        ]);

        const acceptedRide = activeRes.data?.[0];
        if (acceptedRide) {
          setSelectedRide(acceptedRide);
          setConfirmRidePopUp(true);
        }

        const completedRides = completedRes.data || [];
        setStats({
          earnings: completedRides.reduce((sum, r) => sum + (r.fare || 0), 0),
          totalDistance: completedRides.reduce((sum, r) => sum + (r.distance || 0), 0),
          rides: completedRides.length,
        });
      } catch (err) {
        console.warn("Could not load driver ride state", err.response?.data);
      }
    };

    loadDriverState();
  }, [authHeaders]);

  const fetchAvailableRides = async () => {
    try {
      setLoading(true);
      const rides = await fetchAvailableRidesForLocation({ openPanel: true });
      if (rides.length === 0) toast.info("No rides nearby right now. Try again shortly.");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Could not fetch rides.");
    } finally {
      setLoading(false);
    }
  };

  const acceptRide = async (ride) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/accept-ride`,
        { rideId: ride._id },
        { headers: authHeaders },
      );
      setSelectedRide(response.data);
      setAvailableRides((prev) => prev.filter((r) => r._id !== ride._id));
      setRidePopUp(false);
      setConfirmRidePopUp(true);
      toast.success("Ride accepted! Collect the OTP from the rider.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept ride.");
    } finally {
      setLoading(false);
    }
  };

  useGSAP(() => {
    gsap.to(ridePopUpRef.current, {
      transform: ridePopUp ? "translateY(0%)" : "translateY(100%)",
    });
  }, [ridePopUp]);

  useGSAP(() => {
    gsap.to(confirmRidePopUpRef.current, {
      transform: confirmRidePopUp ? "translateY(0%)" : "translateY(100%)",
    });
  }, [confirmRidePopUp]);

  return (
    <div className="h-screen overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-green-600 text-white rounded-lg px-3 py-1 font-bold text-sm tracking-tight shadow">BMR</div>
        <span className="font-bold text-white text-base drop-shadow-lg">BookMyRide</span>
      </div>

      <Link
        to="/driver-logout"
        className="fixed top-3 right-3 z-20 rounded-full bg-white py-2 px-4 text-sm font-semibold shadow hover:bg-gray-100"
      >
        <i className="ri-logout-box-r-line mr-1"></i>Logout
      </Link>

      {/* Map */}
      <div className="h-3/5">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Map"
        />
      </div>

      {/* Driver Dashboard */}
      <div className="h-2/5 p-4 flex flex-col gap-4 bg-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              className="h-14 w-14 rounded-full object-cover border-2 border-green-500"
              src={driverImage}
              alt="Driver"
            />
            <div>
              <h4 className="text-lg font-bold leading-tight">
                {[driver?.fullname?.firstname, driver?.fullname?.lastname].filter(Boolean).join(" ") || "Driver"}
              </h4>
              <p className="text-xs text-gray-500">{driver?.vehicle?.plate || "Vehicle"}</p>
            </div>
          </div>
          <div className="text-right">
            <h4 className="text-2xl font-bold text-green-600">₹{stats.earnings.toFixed(0)}</h4>
            <p className="text-xs text-gray-500">Total Earned</p>
          </div>
        </div>

        <div className="flex justify-around bg-gray-50 rounded-2xl p-3">
          <div className="text-center">
            <i className="ri-route-line text-xl text-green-600"></i>
            <h5 className="font-bold text-sm">{(stats.totalDistance / 1000).toFixed(1)} km</h5>
            <p className="text-xs text-gray-500">Distance</p>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div className="text-center">
            <i className="ri-taxi-line text-xl text-green-600"></i>
            <h5 className="font-bold text-sm">{stats.rides}</h5>
            <p className="text-xs text-gray-500">Rides Done</p>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div className="text-center">
            <i className="ri-star-fill text-xl text-yellow-500"></i>
            <h5 className="font-bold text-sm">4.9</h5>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
        </div>

        <button
          onClick={fetchAvailableRides}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 p-3 rounded-2xl w-full font-semibold text-white transition-colors"
        >
          {loading ? "Searching..." : "Check for Rides"}
        </button>
      </div>

      {/* Available Rides Popup */}
      <div ref={ridePopUpRef} className="fixed w-full z-30 bottom-0 bg-white px-3 py-8 translate-y-full rounded-t-3xl shadow-xl">
        <RidePopUp
          rides={availableRides}
          onAcceptRide={acceptRide}
          onClose={() => setRidePopUp(false)}
          loading={loading}
        />
      </div>

      {/* OTP Verification Popup */}
      <div ref={confirmRidePopUpRef} className="fixed h-screen w-full z-40 bottom-0 bg-white px-3 py-8 translate-y-full rounded-t-3xl shadow-xl">
        <ConfirmRidePopUp
          ride={selectedRide}
          onClose={() => setConfirmRidePopUp(false)}
          navigate={navigate}
        />
      </div>
    </div>
  );
};

export default DriverHome;
