import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DriverDataContext } from "../context/DriverContext";
import axios from "axios";

const DriverSignup = () => {

  const navigate = useNavigate()
  // This is necessary because react won't understand what I am typing otherwise. It is called two-way binding.
  const [firstName, setFirstName] = useState("Test");
  const [lastName, setLastName] = useState("Driver");
  const [email, setEmail] = useState("testd@gmail.com");
  const [password, setPassword] = useState("123456");
  const [vehicleColor, setVehicleColor] = useState("Purple");
  const [vehiclePlate, setVehiclePlate] = useState("GJ 01 NY 2258");
  const [vehicleCapacity, setVehicleCapacity] = useState("3");
  const [vehicleType, setVehicleType] = useState("");

  const { driver, setDriver } = useContext(DriverDataContext);

  const submitHandler = async (e) => {
    e.preventDefault();

    const newDriver = {
      fullname: {
        firstname: firstName,
        lastname: lastName,
      },
      email: email,
      password: password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: vehicleCapacity,
        vehicleType: vehicleType,
      },
    };

    const response = await axios.post(
      `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/drivers/register`,
      newDriver
    );

    if (response.status === 201) {
      const data = response.data;

      setDriver(data.driver);
      localStorage.setItem('token',data.token)
      navigate("/driver-home");
    }

    // reset the form after signup
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setVehicleColor("");
    setVehiclePlate("");
    setVehicleCapacity("");
    setVehicleType("");
  };

  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <img
          className="w-14 mb-10"
          src="https://freelogopng.com/images/all_img/1659761425uber-driver-logo-png.png"
        ></img>
        <form
          onSubmit={(e) => {
            submitHandler(e);
          }}
        >
          <h3 className="text-lg mb-2">Yo, what's your name?</h3>
          <div className="flex gap-4 mb-5">
            <input
              type="text"
              value={firstName}
              className="bg-gray-200 rounded px-4 py-2 border w-1/2 text-lg placeholder:text-base"
              placeholder="First name"
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
              required
            />
            <input
              type="text"
              value={lastName}
              className="bg-gray-200 rounded px-4 py-2 border w-1/2 text-lg placeholder:text-base"
              placeholder="Last name"
              onChange={(e) => {
                setLastName(e.target.value);
              }}
              required
            />
          </div>
          <h3 className="text-lg mb-2">What's your email?</h3>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            type="email"
            className="bg-gray-200 rounded px-4 py-2 mb-5 border w-full text-lg placeholder:text-base"
            placeholder="email@example.com"
            required
          />
          <h3 className="text-lg mb-2">Enter password</h3>
          <input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            type="password"
            className="bg-gray-200 rounded px-4 py-2 mb-5 border w-full text-lg placeholder:text-base"
            placeholder="password"
            required
          />

          <h3 className="text-lg mb-2">Vehicle Color</h3>
          <input
            value={vehicleColor}
            onChange={(e) => setVehicleColor(e.target.value)}
            type="text"
            className="bg-gray-200 rounded px-4 py-2 mb-5 border w-full text-lg placeholder:text-base"
            placeholder="Enter vehicle color"
            required
          />
          <h3 className="text-lg mb-2">Vehicle Plate Number</h3>
          <input
            value={vehiclePlate}
            onChange={(e) => setVehiclePlate(e.target.value)}
            type="text"
            className="bg-gray-200 rounded px-4 py-2 mb-5 border w-full text-lg placeholder:text-base"
            placeholder="Enter plate number"
            required
          />
          <h3 className="text-lg mb-2">Vehicle Capacity</h3>
          <input
            value={vehicleCapacity}
            onChange={(e) => setVehicleCapacity(e.target.value)}
            type="number"
            className="bg-gray-200 rounded px-4 py-2 mb-5 border w-full text-lg placeholder:text-base"
            placeholder="Enter vehicle capacity"
            required
          />
          <h3 className="text-lg mb-2">Vehicle Type</h3>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="bg-gray-200 rounded px-4 py-2 mb-5 border w-full text-lg"
            required
          >
            <option value="">Select vehicle type</option>
            <option value="car">Car</option>
            <option value="auto">Auto</option>
            <option value="motorcycle">Motorcycle</option>
          </select>
          <button className="bg-[#111] text-white font-semibold rounded px-4 py-2 mb-5 border w-full text-lg">
            Create Driver Account
          </button>
        </form>
        <p>
          Already have an account?{" "}
          <Link to="/driver-login" className="text-blue-700">
            Login
          </Link>{" "}
        </p>
      </div>
      <div>
        <p className="text-[11px] leading-tight">
          By proceeding, you consent to get calls, WhatsApp or SMS/RCS messages,
          including by automated means, from Uber and its affiliates to the
          number provided.
        </p>
      </div>
    </div>
  );
};

export default DriverSignup;
