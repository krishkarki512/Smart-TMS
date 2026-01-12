// src/utils/RequireAdmin.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const RequireAdmin = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/accounts/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsAdmin(res.data.is_superuser);
      } catch (error) {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [token]);

  if (isAdmin === null) {
    return <p>Checking admin access...</p>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAdmin;
