import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import uberLogo from "../../assets/images/uber_logo.png";

const API_URL = import.meta.env.VITE_BASEAPP_BACKEND_URL || "http://localhost:4000";

const UserSignup = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submitHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { data } = await axios.post(`${API_URL}/api/users/register`, {
        fullname: { firstname: form.firstname, lastname: form.lastname },
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("userToken", data.data.token);
      setUser(data.data.user);
      navigate("/home");
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="min-h-screen p-7">
    <img className="mb-10 w-14" src={uberLogo} alt="Uber" />
    <h1 className="mb-6 text-2xl font-bold">Create your rider account</h1>
    <form onSubmit={submitHandler} className="space-y-4">
      <div className="flex gap-3"><input value={form.firstname} onChange={update("firstname")} className="w-1/2 rounded border bg-gray-100 p-3" placeholder="First name" minLength="3" required /><input value={form.lastname} onChange={update("lastname")} className="w-1/2 rounded border bg-gray-100 p-3" placeholder="Last name" minLength="3" required /></div>
      <input value={form.email} onChange={update("email")} type="email" className="w-full rounded border bg-gray-100 p-3" placeholder="email@example.com" required />
      <input value={form.password} onChange={update("password")} type="password" className="w-full rounded border bg-gray-100 p-3" placeholder="Password (6+ characters)" minLength="6" required />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={submitting} className="w-full rounded bg-black p-3 font-semibold text-white disabled:opacity-60">{submitting ? "Creating…" : "Create account"}</button>
    </form>
    <p className="mt-5">Already have an account? <Link to="/login" className="text-blue-700">Sign in</Link></p>
  </main>;
};

export default UserSignup;
