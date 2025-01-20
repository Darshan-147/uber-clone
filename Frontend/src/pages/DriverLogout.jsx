import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DriverLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/drivers/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem("token");
          console.log("Deleted driver token");
          navigate("/driver-login"); // Redirecting to driver login page
        }
      })
      .catch((error) => {
        console.error("Driver logout failed:", error);
      });
  }, [navigate]);

  return <div>Logging out...</div>;
};

export default DriverLogout;
