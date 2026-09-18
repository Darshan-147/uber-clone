import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { DriverDataContext } from "../context/DriverContext";
import uberLogo from "../../assets/images/uber_logo.png";

const API_URL = import.meta.env.VITE_BASEAPP_BACKEND_URL || "http://localhost:4000";
const emptyForm = { firstname: "", lastname: "", email: "", password: "", color: "", plate: "", capacity: "", vehicleType: "" };

const DriverSignup = () => {
  const navigate = useNavigate();
  const { updateDriver } = useContext(DriverDataContext);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setSubmitting(true); setError("");
    try {
      const { data } = await axios.post(`${API_URL}/api/drivers/register`, { fullname: { firstname: form.firstname, lastname: form.lastname }, email: form.email, password: form.password, vehicle: { color: form.color, plate: form.plate, capacity: Number(form.capacity), vehicleType: form.vehicleType } });
      localStorage.setItem("driverToken", data.data.token); updateDriver(data.data.driver); navigate("/driver-home");
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Unable to register this driver.");
    } finally { setSubmitting(false); }
  };
  return <main className="min-h-screen p-7"><img className="mb-10 w-14" src={uberLogo} alt="Uber" /><h1 className="mb-6 text-2xl font-bold">Register as a driver</h1>
    <form onSubmit={submit} className="space-y-4"><div className="flex gap-3"><input value={form.firstname} onChange={update("firstname")} className="w-1/2 rounded border bg-gray-100 p-3" placeholder="First name" minLength="3" required /><input value={form.lastname} onChange={update("lastname")} className="w-1/2 rounded border bg-gray-100 p-3" placeholder="Last name" minLength="3" required /></div><input value={form.email} onChange={update("email")} type="email" className="w-full rounded border bg-gray-100 p-3" placeholder="Email" required /><input value={form.password} onChange={update("password")} type="password" className="w-full rounded border bg-gray-100 p-3" placeholder="Password (6+ characters)" minLength="6" required /><input value={form.color} onChange={update("color")} className="w-full rounded border bg-gray-100 p-3" placeholder="Vehicle color" minLength="3" required /><input value={form.plate} onChange={update("plate")} className="w-full rounded border bg-gray-100 p-3" placeholder="Vehicle plate" minLength="3" required /><input value={form.capacity} onChange={update("capacity")} type="number" min="1" className="w-full rounded border bg-gray-100 p-3" placeholder="Capacity" required /><select value={form.vehicleType} onChange={update("vehicleType")} className="w-full rounded border bg-gray-100 p-3" required><option value="">Vehicle type</option><option value="car">Car</option><option value="auto">Auto</option><option value="motorcycle">Motorcycle</option></select>{error && <p className="text-sm text-red-600">{error}</p>}<button disabled={submitting} className="w-full rounded bg-black p-3 font-semibold text-white disabled:opacity-60">{submitting ? "Creating…" : "Create driver account"}</button></form>
    <p className="mt-5">Already registered? <Link to="/driver-login" className="text-blue-700">Sign in</Link></p></main>;
};

export default DriverSignup;
