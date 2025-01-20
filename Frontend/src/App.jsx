import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import UserSignup from "./pages/UserSignup";
import UserLogin from "./pages/UserLogin";
import DriverSignup from "./pages/DriverSignup";
import DriverLogin from "./pages/DriverLogin";
import GetStarted from "./pages/GetStarted";
import UserProtectedWrapper from "./pages/UserProtectedWrapper";
import UserLogout from "./pages/UserLogout";
import DriverHome from "./pages/DriverHome";
import DriverProtectedWrapper from "./pages/DriverProtectedWrapper";
import DriverLogout from "./pages/DriverLogout";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<GetStarted />} />
        <Route
          path="/home"
          element={
            <UserProtectedWrapper>
              <Home />
            </UserProtectedWrapper>
          }
        />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/login" element={<UserLogin />} />
        <Route
          path="logout"
          element={
            <UserProtectedWrapper>
              <UserLogout />
            </UserProtectedWrapper>
          }
        />
        <Route
          path="/driver-home"
          element={
            <DriverProtectedWrapper>
              <DriverHome />
            </DriverProtectedWrapper>
          }
        />
        <Route path="/driver-signup" element={<DriverSignup />} />
        <Route path="/driver-login" element={<DriverLogin />} />
        <Route
          path="/driver-logout"
          element={
            <DriverProtectedWrapper>
              <DriverLogout />
            </DriverProtectedWrapper>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
