import React, { useState } from "react";
import { Link } from "react-router-dom";

const DriverLogin = () => {
  // This is necessary because react won't understand what I am typing otherwise. It is called two-way binding.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [driverData, setDriverData] = useState({});

  const submitHandler = (e) => {
    e.preventDefault();

    setDriverData({
      email: email,
      password: password,
    });
    // I'll remove all this clgs after project completion
    console.log(driverData);
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
            value={email}
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
            value={password}
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
