import React, { createContext, useState } from "react";

export const DriverDataContext = createContext();

const DriverContext = ({ children }) => {
  const [driver, setDriver] = useState(null);
  const [loading, isLoading] = useState(null);
  const [error, setError] = useState(null);

  const updateDriver = (driverData) => {
    setDriver(driverData);
  };

  const value = {
    driver,
    setDriver,
    loading,
    isLoading,
    error,
    setError,
    updateDriver,
  };

  return (
    <DriverDataContext.Provider value={value}>
      {children}
    </DriverDataContext.Provider>
  );
};

export default DriverContext;
