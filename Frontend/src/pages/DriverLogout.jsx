import { useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DriverDataContext } from "../context/DriverContext";

const DriverLogout = () => {
  const navigate = useNavigate();
  const { clearDriver } = useContext(DriverDataContext);

  useEffect(() => {
    const token = localStorage.getItem("driverToken");

    axios
      .post(`${import.meta.env.VITE_BASEAPP_BACKEND_URL || "http://localhost:4000"}/api/drivers/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem("driverToken");
          clearDriver();
          navigate("/driver-login"); // Redirecting to driver login page
        }
      })
      .catch(() => {
        localStorage.removeItem("driverToken");
        clearDriver();
        navigate("/driver-login");
      });
  }, [clearDriver, navigate]);

  return <div>Logging out...</div>;
};

export default DriverLogout;
