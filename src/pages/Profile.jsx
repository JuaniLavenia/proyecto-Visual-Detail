import "./Profile.css";
import React, { useState } from "react";
import OrdersTab from "../components/OrdersTab";
import PersonalInfoTab from "../components/PersonalInfoTab";
import { Button } from "react-bootstrap";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("pedidos");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="bg-dark">
      <div className="user-profile-container bg-light text-dark">
        <h1 className="text-center">Bienvenido a tu perfil</h1>
        <div className="tab-buttons">
          <Button
            variant={activeTab === "pedidos" ? "warning" : "secondary"}
            className="w-50"
            onClick={() => handleTabChange("pedidos")}
          >
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              color="#000000"
            >
              <path
                d="M9 6L20 6"
                stroke="#000000"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M5 6.01L5.01 5.99889"
                stroke="#000000"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M5 12.01L5.01 11.9989"
                stroke="#000000"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M3.80005 17.8L4.60005 18.6L6.60004 16.6"
                stroke="#000000"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M9 12L20 12"
                stroke="#000000"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M9 18L20 18"
                stroke="#000000"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </Button>
          <Button
            variant={
              activeTab === "informacion-personal" ? "warning" : "secondary"
            }
            className="w-50"
            onClick={() => handleTabChange("informacion-personal")}
          >
            <svg
              width="20px"
              height="20px"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              color="#000000"
            >
              <path
                d="M12 11.5V16.5"
                stroke="#000000"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M12 7.51L12.01 7.49889"
                stroke="#000000"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="#000000"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </Button>
        </div>

        <div className="tab-content">
          {activeTab === "pedidos" && <OrdersTab />}
          {activeTab === "informacion-personal" && <PersonalInfoTab />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
