import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";

const UserLogin = () => {
  const [email, setEmail] = useState("legend@gmail.com");
  const [password, setPassword] = useState("legendOP");

  const navigate = useNavigate();

  const { user, setUser } = useContext(UserDataContext);

  const submitHandler = async (e) => {
    e.preventDefault();

    const existingUser = {
      email: email,
      password: password,
    };

    // To send the response from frontend to backend
    const response = await axios.post(
      `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/users/login`,
      existingUser,
    );

    if (response.status === 200) {
      const data = response.data;

      setUser(data.user);
      localStorage.setItem("userToken", data.token);
      localStorage.removeItem("token");
      navigate("/home");
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
          src="https://static-00.iconduck.com/assets.00/uber-icon-2048x2048-1c9pt96a.png"
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
          New here?{" "}
          <Link to="/user-signup" className="text-blue-700">
            Create Account
          </Link>{" "}
        </p>
      </div>
      <div>
        <Link
          to="/driver-login"
          className="bg-green-600 text-white font-semibold rounded px-4 py-2 mb-7 border w-full flex justify-center text-lg"
        >
          Sign In as Driver
        </Link>
      </div>
    </div>
  );
};

export default UserLogin;
