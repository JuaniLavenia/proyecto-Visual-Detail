import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const PersonalInfoTab = () => {
  const [userInfo, setUserInfo] = useState();
  const { userId } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          `https://visual-detail-backend.onrender.com/api/user/${userId}`
        );
        setUserInfo(response.data.usuario);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, [userId]);

  return (
    <div>
      <h2>Información Personal</h2>
      {userInfo ? (
        <div>
          <p>
            <strong>Email:</strong> {userInfo.email}
          </p>
        </div>
      ) : (
        <p>Cargando información personal...</p>
      )}
    </div>
  );
};

export default PersonalInfoTab;
