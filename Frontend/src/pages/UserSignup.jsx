import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import { useToast } from "../context/ToastContext";

const UserSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);
  const toast = useToast();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/users/register`,
        {
          fullname: { firstname: firstName, lastname: lastName },
          email,
          password,
        },
      );

      if (response.status === 201) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem("userToken", data.token);
        localStorage.removeItem("token");
        toast.success("Account created! Welcome to BookMyRide.");
        navigate("/home");
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
    <div className="p-7 h-screen overflow-y-auto flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-black text-white rounded-lg px-3 py-1 font-bold text-base tracking-tight">BMR</div>
          <span className="font-bold text-xl">BookMyRide</span>
        </div>

        <h2 className="text-3xl font-bold mb-1">Create Account</h2>
        <p className="text-gray-500 text-sm mb-5">Join BookMyRide and book rides instantly.</p>

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
              className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-200 w-1/2 text-base focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="First name"
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              value={lastName}
              className="bg-gray-100 rounded-xl px-4 py-3 border border-gray-200 w-1/2 text-base focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Last name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="bg-gray-100 rounded-xl px-4 py-3 mb-4 border border-gray-200 w-full text-base focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="email@example.com"
            required
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="bg-gray-100 rounded-xl px-4 py-3 mb-5 border border-gray-200 w-full text-base focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Min. 6 characters"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white font-semibold rounded-xl px-4 py-3 mb-4 w-full text-base disabled:bg-gray-400 hover:bg-gray-800 transition-colors"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/user-login" className="text-green-600 font-semibold">
            Sign In
          </Link>
        </p>
      </div>

      <div>
        <p className="text-[11px] text-gray-400 leading-tight mt-4">
          By proceeding, you consent to receive communications from BookMyRide
          regarding your account and rides.
        </p>
      </div>
    </div>
  );
};

export default UserSignup;
