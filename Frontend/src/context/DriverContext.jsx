import React, { createContext, useState, useEffect } from "react";

export const DriverDataContext = createContext();

const DriverContext = ({ children }) => {
  const [driver, setDriver] = useState(() => {
    // Try to retrieve driver data from localStorage on initial load
    const savedDriver = localStorage.getItem("driverData");
    return savedDriver ? JSON.parse(savedDriver) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateDriver = (driverData) => {
    // Save to localStorage and update state
    localStorage.setItem("driverData", JSON.stringify(driverData));
    setDriver(driverData);
  };

  
  const clearDriver = () => {
    console.log("Clearing driver data"); // Debug log
    localStorage.removeItem("driverData");
    setDriver(null);
  };

  const value = {
    driver,
    setDriver,
    loading,
    setLoading,
    error,
    setError,
    updateDriver,
    clearDriver,
  };

  return (
    <DriverDataContext.Provider value={value}>
      {children}
    </DriverDataContext.Provider>
  );
};

export default DriverContext;
