import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";

const UserSignup = () => {
  // This is necessary because react won't understand what I am typing otherwise. It is called two-way binding.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const { user, setUser } = useContext(UserDataContext);

  const submitHandler = async (e) => {
    e.preventDefault();

    const newUser = {
      fullname: {
        firstname: firstName,
        lastname: lastName,
      },
      email: email,
      password: password,
    };
    // To send the response from frontend to backend
    const response = await axios.post(
      `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/users/register`,
      newUser
    );

    if (response.status === 201) {
      const data = response.data;

      setUser(data.user);
      localStorage.setItem('token',data.token)
      navigate("/home");
    }

    // reset the form after signup
    setFirstName("");
    setLastName("");
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
          <button className="bg-[#111] text-white font-semibold rounded px-4 py-2 mb-5 border w-full text-lg">
            Create User Account
          </button>
        </form>
        <p>
          Already have an account?{" "}
          <Link to="/login" className="text-blue-700">
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

export default UserSignup;
