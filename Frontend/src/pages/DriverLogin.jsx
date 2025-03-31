import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DriverDataContext } from "../context/DriverContext";
import axios from "axios";

const DriverLogin = () => {
  // Two way binding means jo value (e.g.email) me yaha declare kar raha hu wahi value me input tag ke undar use karunga. This is necessary because react won't understand what I am typing otherwise.
  const [email, setEmail] = useState("shambhu@gmail.com");
  const [password, setPassword] = useState("Khataro");

  const navigate = useNavigate();

  const { driver, updateDriver } = useContext(DriverDataContext);

  const submitHandler = async (e) => {
    e.preventDefault();

    const existingDriver = {
      email: email,
      password: password,
    };

    // To send the response from frontend to backend
    const response = await axios.post(
      `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/drivers/login`,
      existingDriver
    );

    if (response.status === 200) {
      const data = response.data;
      console.log("Received driver data:", data.driver); // Debug log
      updateDriver(data.driver);
      localStorage.setItem("token", data.token);
      navigate("/driver-home");
    }

    // reset the form after login
    setEmail("");
    setPassword("");
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
          <h3 className="text-lg mb-2">Yo, what's your email?</h3>
          <input
            value={email}   // Two way binding
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            type="email"
            className="bg-gray-200 rounded px-4 py-2 mb-7 border w-full text-lg placeholder:text-base"
            placeholder="email@example.com"
            required
          />
          <h3 className="text-lg mb-2">Enter password</h3>
          <input
            value={password}   // Two way binding
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            type="password"
            className="bg-gray-200 rounded px-4 py-2 mb-7 border w-full text-lg placeholder:text-base"
            placeholder="password"
            required
          />
          <button className="bg-[#111] text-white font-semibold rounded px-4 py-2 mb-7 border w-full text-lg">
            Login
          </button>
        </form>
        <p>
          Join a fleet?{" "}
          <Link to="/driver-signup" className="text-blue-700">
            Register as a Driver
          </Link>{" "}
        </p>
      </div>
      <div>
        <Link
          to="/login"
          className="bg-[#ff8a00] text-white font-semibold rounded px-4 py-2 mb-7 border w-full flex justify-center text-lg"
        >
          Sign In as User
        </Link>
      </div>
    </div>
  );
};

export default DriverLogin;
