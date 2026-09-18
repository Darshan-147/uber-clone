import { createContext, useCallback, useMemo, useState } from "react";

export const DriverDataContext = createContext();

const DriverContext = ({ children }) => {
  const [driver, setDriver] = useState(() => {
    // Try to retrieve driver data from localStorage on initial load
    const savedDriver = localStorage.getItem("driverData");
    return savedDriver ? JSON.parse(savedDriver) : null;
  });
  const updateDriver = useCallback((driverData) => {
    // Save to localStorage and update state
    localStorage.setItem("driverData", JSON.stringify(driverData));
    setDriver(driverData);
  }, []);

  
  const clearDriver = useCallback(() => {
    localStorage.removeItem("driverData");
    setDriver(null);
  }, []);

  const value = useMemo(() => ({
    driver,
    setDriver,
    updateDriver,
    clearDriver,
  }), [driver, updateDriver, clearDriver]);

  return (
    <DriverDataContext.Provider value={value}>
      {children}
    </DriverDataContext.Provider>
  );
};

export default DriverContext;
