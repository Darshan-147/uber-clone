import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { DriverDataContext } from "../context/DriverContext";
import uberLogo from "../../assets/images/uber_logo.png";

const API_URL = import.meta.env.VITE_BASEAPP_BACKEND_URL || "http://localhost:4000";

const DriverLogin = () => {
  const navigate = useNavigate();
  const { updateDriver } = useContext(DriverDataContext);
  const [email, setEmail] = useState("driver@gmail.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { data } = await axios.post(`${API_URL}/api/drivers/login`, { email, password });
      localStorage.setItem("driverToken", data.data.token);
      updateDriver(data.data.driver);
      navigate("/driver-home");
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="flex min-h-screen flex-col justify-between p-7">
    <div><img className="mb-10 w-14" src={uberLogo} alt="Uber" /><h1 className="mb-6 text-2xl font-bold">Driver sign in</h1>
      <form onSubmit={submitHandler}><label className="mb-2 block">Email</label><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="mb-5 w-full rounded border bg-gray-100 p-3" required /><label className="mb-2 block">Password</label><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mb-5 w-full rounded border bg-gray-100 p-3" required />{error && <p className="mb-4 text-sm text-red-600">{error}</p>}<button disabled={submitting} className="mb-6 w-full rounded bg-black p-3 font-semibold text-white disabled:opacity-60">{submitting ? "Signing in…" : "Sign in"}</button></form>
      <p>New driver? <Link to="/driver-signup" className="text-blue-700">Register</Link></p></div>
    <Link to="/login" className="flex justify-center rounded bg-orange-500 p-3 font-semibold text-white">Sign in as a rider</Link>
  </main>;
};

export default DriverLogin;
