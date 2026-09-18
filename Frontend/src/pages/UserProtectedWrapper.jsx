import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";

const API_URL = import.meta.env.VITE_BASEAPP_BACKEND_URL || "http://localhost:4000";

const UserProtectedWrapper = ({ children }) => {
  const token = localStorage.getItem("userToken");
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let active = true;
    axios.get(`${API_URL}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (active) setUser(data.data.user);
      })
      .catch(() => {
        localStorage.removeItem("userToken");
        if (active) navigate("/login", { replace: true });
      })
      .finally(() => active && setIsLoading(false));

    return () => { active = false; };
  }, [navigate, setUser, token]);

  if (isLoading) return <div className="p-6">Loading your account…</div>;
  return children;
};

export default UserProtectedWrapper;
