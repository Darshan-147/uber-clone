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
import axios from "axios";

const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location access is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
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
  const [stats, setStats] = useState({
    earnings: 0,
    totalDistance: 0,
    rides: 0,
  });

  const ridePopUpRef = useRef(null);
  const confirmRidePopUpRef = useRef(null);
  const navigate = useNavigate();

  const { sendMessage, recieveMessage } = useContext(SocketContext);
  const { driver } = useContext(DriverDataContext);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${
        localStorage.getItem("driverToken") || localStorage.getItem("token")
      }`,
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
        {
          params: location,
          headers: authHeaders,
        },
      );

      const rides = response.data || [];
      setAvailableRides(rides);

      if (openPanel || rides.length > 0) {
        setRidePopUp(true);
      }

      return rides;
    },
    [authHeaders],
  );

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
          await fetchAvailableRidesForLocation({
            latitude,
            longitude,
            openPanel: false,
          });
        }
      } catch (error) {
        console.warn(error.message);
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

  useEffect(() => {
    const handleNewRide = (ride) => {
      const incomingRide = ride?.data || ride;
      if (!incomingRide?._id) return;

      setAvailableRides((prev) => {
        const exists = prev.some((item) => item._id === incomingRide._id);
        return exists ? prev : [incomingRide, ...prev];
      });
      setRidePopUp(true);
    };

    const removeNewRide = recieveMessage("new-ride", handleNewRide);
    const removeNotification = recieveMessage("new-ride-notification", (data) =>
      handleNewRide(data?.ride),
    );
    const removeCancelled = recieveMessage("ride-cancelled", () => {
      setSelectedRide(null);
      setConfirmRidePopUp(false);
    });

    return () => {
      removeNewRide?.();
      removeNotification?.();
      removeCancelled?.();
    };
  }, [recieveMessage]);

  useEffect(() => {
    const loadDriverState = async () => {
      try {
        const [activeResponse, completedResponse] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/get-driver-rides`,
            {
              params: { status: "accepted" },
              headers: authHeaders,
            },
          ),
          axios.get(
            `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/rides/get-driver-rides`,
            {
              params: { status: "completed" },
              headers: authHeaders,
            },
          ),
        ]);

        const acceptedRide = activeResponse.data?.[0];
        if (acceptedRide) {
          setSelectedRide(acceptedRide);
          setConfirmRidePopUp(true);
        }

        const completedRides = completedResponse.data || [];
        setStats({
          earnings: completedRides.reduce((sum, ride) => sum + (ride.fare || 0), 0),
          totalDistance: completedRides.reduce(
            (sum, ride) => sum + (ride.distance || 0),
            0,
          ),
          rides: completedRides.length,
        });
      } catch (error) {
        console.warn("Could not load driver ride state", error.response?.data);
      }
    };

    loadDriverState();
  }, [authHeaders]);

  const fetchAvailableRides = async () => {
    try {
      setLoading(true);
      await fetchAvailableRidesForLocation({ openPanel: true });
    } catch (error) {
      alert(error.response?.data?.message || error.message);
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
      setAvailableRides((prev) => prev.filter((item) => item._id !== ride._id));
      setRidePopUp(false);
      setConfirmRidePopUp(true);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to accept ride");
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
      <img
        className="w-16 absolute top-5 left-5 z-20"
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt="Uber Logo"
      />
      <Link
        to="/driver-logout"
        className="fixed top-2 right-2 z-20 rounded-full bg-white py-2 px-4 hover:bg-gray-100"
      >
        <i className="ri-logout-box-r-fill"></i> Logout
      </Link>

      <div className="h-3/5">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Map"
        />
      </div>

      <div className="h-2/5 p-4 flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <img
            className="h-16 w-16 rounded-full object-cover"
            src={driverImage}
            alt="Driver"
          />
          <div className="flex flex-col items-end">
            <h4 className="text-xl font-medium">
              {[driver?.fullname?.firstname, driver?.fullname?.lastname]
                .filter(Boolean)
                .join(" ") || "Driver"}
            </h4>
            <h4 className="text-lg font-medium">
              Rs. {stats.earnings.toFixed(2)}
            </h4>
            <p className="text-sm font-semibold text-gray-600">Earned</p>
          </div>
        </div>

        <div className="flex justify-around bg-gray-100 rounded-lg p-3">
          <div className="text-center">
            <i className="ri-speed-up-fill text-2xl"></i>
            <h5 className="font-bold">
              {(stats.totalDistance / 1000).toFixed(1)} km
            </h5>
            <p className="text-xs">Completed Distance</p>
          </div>
          <div className="text-center">
            <i className="ri-booklet-line text-2xl"></i>
            <h5 className="font-bold">{stats.rides}</h5>
            <p className="text-xs">Rides Completed</p>
          </div>
        </div>

        <button
          onClick={fetchAvailableRides}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 p-3 rounded-lg w-full font-semibold text-white transition-colors"
        >
          {loading ? "Loading..." : "Check for Rides"}
        </button>
      </div>

      <div
        ref={ridePopUpRef}
        className="fixed w-full z-30 bottom-0 bg-white px-3 py-8 translate-y-full"
      >
        <RidePopUp
          rides={availableRides}
          onAcceptRide={acceptRide}
          onClose={() => setRidePopUp(false)}
          loading={loading}
        />
      </div>

      <div
        ref={confirmRidePopUpRef}
        className="fixed h-screen w-full z-40 bottom-0 bg-white px-3 py-8 translate-y-full"
      >
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
