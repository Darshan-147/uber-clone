import { createContext, useState } from "react";

export const UserDataContext = createContext();

// Context APIs are used for data centralization
const UserContext = ({ children }) => {
  const [user, setUser] = useState({
    fullName: {
      firstName: "",
      lastName: "",
    },
    email: "",
  });
  return <UserDataContext.Provider value={{ user, setUser }}>{children}</UserDataContext.Provider>;
};

export default UserContext;
