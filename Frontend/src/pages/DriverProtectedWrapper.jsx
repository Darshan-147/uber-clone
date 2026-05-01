import React, { useContext, useEffect, useState } from "react";
import { DriverDataContext } from "../context/DriverContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DriverProtectedWrapper = ({ children }) => {
  const token =
    localStorage.getItem("driverToken") || localStorage.getItem("token");
  const navigate = useNavigate();
  const { driver, setDriver } = useContext(DriverDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/driver-login");
      return;
    }

    // Fetch driver profile
    axios
      .get(
        `${import.meta.env.VITE_BASEAPP_BACKEND_URL}/api/drivers/user-profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .then((response) => {
        if (response.status === 200) {
          setDriver(response.data);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
        localStorage.removeItem("driverToken");
        localStorage.removeItem("token");
        navigate("/driver-login");
      });
  }, [token, navigate, setDriver]); // Added proper dependencies

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default DriverProtectedWrapper;
