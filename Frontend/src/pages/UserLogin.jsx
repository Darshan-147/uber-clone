import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import uberLogo from "../../assets/images/uber_logo.png";

const API_URL = import.meta.env.VITE_BASEAPP_BACKEND_URL || "http://localhost:4000";

const UserLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { data } = await axios.post(`${API_URL}/api/users/login`, { email, password });
      localStorage.setItem("userToken", data.data.token);
      localStorage.removeItem("driverToken");
      setUser(data.data.user);
      navigate("/home");
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="flex min-h-screen flex-col justify-between p-7">
    <div>
      <img className="mb-10 w-14" src={uberLogo} alt="Uber" />
      <h1 className="mb-6 text-2xl font-bold">Sign in to ride</h1>
      <form onSubmit={submitHandler}>
        <label className="mb-2 block text-lg">Email</label>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="mb-5 w-full rounded border bg-gray-100 px-4 py-3" placeholder="email@example.com" required />
        <label className="mb-2 block text-lg">Password</label>
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mb-5 w-full rounded border bg-gray-100 px-4 py-3" placeholder="Password" required />
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <button disabled={submitting} className="mb-6 w-full rounded bg-black px-4 py-3 text-lg font-semibold text-white disabled:opacity-60">{submitting ? "Signing in…" : "Sign in"}</button>
      </form>
      <p>New here? <Link to="/signup" className="text-blue-700">Create an account</Link></p>
    </div>
    <Link to="/driver-login" className="flex w-full justify-center rounded bg-green-600 px-4 py-3 text-lg font-semibold text-white">Sign in as a driver</Link>
  </main>;
};

export default UserLogin;
