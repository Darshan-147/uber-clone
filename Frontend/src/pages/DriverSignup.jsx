import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DriverDataContext } from "../context/DriverContext";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const DriverSignup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { updateDriver } = useContext(DriverDataContext);
  const toast = useToast();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/drivers/register`,
        {
          fullname: { firstname: firstName, lastname: lastName },
          email,
          password,
          vehicle: {
            color: vehicleColor,
            plate: vehiclePlate,
            capacity: vehicleCapacity,
            vehicleType,
          },
        },
      );

      if (response.status === 201) {
        const data = response.data;
        updateDriver(data.driver);
        localStorage.setItem("driverToken", data.token);
        localStorage.removeItem("token");
        toast.success("Driver account created! Welcome aboard.");
        navigate("/driver-home");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-7 pb-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-8">
        <div className="bg-green-600 text-white rounded-lg px-3 py-1 font-bold text-base tracking-tight">BMR</div>
        <span className="font-bold text-xl">BookMyRide <span className="text-green-600 text-sm font-normal">Driver</span></span>
      </div>

      <h2 className="text-3xl font-bold mb-1">Join as Driver</h2>
      <p className="text-gray-500 text-sm mb-5">Register your vehicle and start earning.</p>

      <form onSubmit={submitHandler}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={firstName}
            className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-200 w-1/2 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="First name"
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            value={lastName}
            className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-200 w-1/2 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Last name"
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="bg-gray-100 rounded-xl px-4 py-3 mb-4 border border-gray-200 w-full text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="email@example.com"
          required
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="bg-gray-100 rounded-xl px-4 py-3 mb-5 border border-gray-200 w-full text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Min. 6 characters"
          required
        />

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Vehicle Details</p>

        <div className="flex gap-3 mb-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
              type="text"
              className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-200 w-full text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. White"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
            <input
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              type="text"
              className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-200 w-full text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. MH 01 AB 1234"
              required
            />
          </div>
        </div>

        <div className="flex gap-3 mb-5">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              value={vehicleCapacity}
              onChange={(e) => setVehicleCapacity(e.target.value)}
              type="number"
              min="1"
              max="10"
              className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-200 w-full text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Seats"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-200 w-full text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select type</option>
              <option value="car">Car</option>
              <option value="auto">Auto</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white font-semibold rounded-xl px-4 py-3 mb-4 w-full text-base disabled:bg-gray-400 hover:bg-green-700 transition-colors"
        >
          {loading ? "Creating account..." : "Register as Driver"}
        </button>
      </form>

      <p className="text-sm text-center mb-2">
        Already have an account?{" "}
        <Link to="/driver-login" className="text-green-600 font-semibold">
          Sign In
        </Link>
      </p>

      <p className="text-[11px] text-gray-400 leading-tight mt-3">
        By proceeding, you consent to receive communications from BookMyRide
        regarding your account and rides.
      </p>
    </div>
  );
};

export default DriverSignup;
