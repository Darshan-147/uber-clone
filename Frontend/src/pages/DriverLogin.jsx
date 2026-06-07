import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DriverDataContext } from "../context/DriverContext";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const DriverLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { updateDriver } = useContext(DriverDataContext);
  const toast = useToast();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/drivers/user-login`,
        { email, password },
      );

      if (response.status === 200) {
        const data = response.data;
        updateDriver(data.driver);
        localStorage.setItem("driverToken", data.token);
        localStorage.removeItem("token");
        toast.success("Welcome back, driver!");
        navigate("/driver-home");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-green-600 text-white rounded-lg px-3 py-1 font-bold text-base tracking-tight">BMR</div>
          <span className="font-bold text-xl">BookMyRide <span className="text-green-600 text-sm font-normal">Driver</span></span>
        </div>

        <h2 className="text-3xl font-bold mb-1">Driver Sign In</h2>
        <p className="text-gray-500 text-sm mb-6">Start earning with BookMyRide today.</p>

        <form onSubmit={submitHandler}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

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
            className="bg-gray-100 rounded-xl px-4 py-3 mb-6 border border-gray-200 w-full text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white font-semibold rounded-xl px-4 py-3 w-full text-base disabled:bg-gray-400 hover:bg-green-700 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In as Driver"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          New driver?{" "}
          <Link to="/driver-signup" className="text-green-600 font-semibold">
            Register here
          </Link>
        </p>
      </div>

      <div>
        <Link
          to="/user-login"
          className="bg-black text-white font-semibold rounded-xl px-4 py-3 mb-3 w-full flex justify-center text-base hover:bg-gray-800 transition-colors"
        >
          Sign In as User
        </Link>
      </div>
    </div>
  );
};

export default DriverLogin;
