import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import { useToast } from "../context/ToastContext";

const UserLogin = () => {
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
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/users/login`,
        { email, password },
      );

      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem("userToken", data.token);
        localStorage.removeItem("token");
        toast.success("Welcome back!");
        navigate("/home");
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
          <div className="bg-black text-white rounded-lg px-3 py-1 font-bold text-base tracking-tight">BMR</div>
          <span className="font-bold text-xl">BookMyRide</span>
        </div>

        <h2 className="text-3xl font-bold mb-1">Sign In</h2>
        <p className="text-gray-500 text-sm mb-6">Welcome back! Enter your details below.</p>

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
            className="bg-gray-100 rounded-xl px-4 py-3 mb-4 border border-gray-200 w-full text-base focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="email@example.com"
            required
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="bg-gray-100 rounded-xl px-4 py-3 mb-6 border border-gray-200 w-full text-base focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter your password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white font-semibold rounded-xl px-4 py-3 w-full text-base disabled:bg-gray-400 hover:bg-gray-800 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          New here?{" "}
          <Link to="/user-signup" className="text-green-600 font-semibold">
            Create Account
          </Link>
        </p>
      </div>

      <div>
        <Link
          to="/driver-login"
          className="bg-green-600 text-white font-semibold rounded-xl px-4 py-3 mb-3 border w-full flex justify-center text-base hover:bg-green-700 transition-colors"
        >
          Sign In as Driver
        </Link>
      </div>
    </div>
  );
};

export default UserLogin;
