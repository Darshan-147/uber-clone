import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    axios
      .post(`${import.meta.env.VITE_BASEAPP_BACKEND_URL || "http://localhost:4000"}/api/users/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem("userToken");
          navigate("/login");
        }
      })
      .catch(() => {
        localStorage.removeItem("userToken");
        navigate("/login");
      });
  }, [navigate]);

  return <div>Logging out...</div>;
};

export default UserLogout;
