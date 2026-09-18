import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DriverDataContext } from "../context/DriverContext";

const API_URL = import.meta.env.VITE_BASEAPP_BACKEND_URL || "http://localhost:4000";

const DriverProtectedWrapper = ({ children }) => {
  const token = localStorage.getItem("driverToken");
  const navigate = useNavigate();
  const { updateDriver } = useContext(DriverDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/driver-login", { replace: true });
      return;
    }

    let active = true;
    axios.get(`${API_URL}/api/drivers/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => active && updateDriver(data.data.driver))
      .catch(() => {
        localStorage.removeItem("driverToken");
        if (active) navigate("/driver-login", { replace: true });
      })
      .finally(() => active && setIsLoading(false));

    return () => { active = false; };
  }, [navigate, token, updateDriver]);

  if (isLoading) return <div className="p-6">Loading your driver profile…</div>;
  return children;
};

export default DriverProtectedWrapper;
