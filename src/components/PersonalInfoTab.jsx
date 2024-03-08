import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useUserContext } from "../context/UserContext";
import { AuthContext } from "../context/AuthContext";

const PersonalInfoTab = () => {
  const { userInfo, updateUser } = useUserContext();
  const { userId } = useContext(AuthContext);
  const [error, setError] = useState();

  const fetchUserInfo = async () => {
    try {
      if (userInfo) {
        return;
      } else {
        const response = await axios.get(
          `https://visual-detail-backend.onrender.com/api/user/${userId}`
        );
        const newUserInfo = response.data.usuario;
        updateUser(newUserInfo);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setError("Hubo un error al cargar la información del usuario");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserInfo();
    } else {
      setError("Debes volver a iniciar sesion");
    }
  }, []);

  return (
    <div>
      <h2>Información Personal</h2>
      {error ? (
        <p>{error}</p>
      ) : userInfo ? (
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
