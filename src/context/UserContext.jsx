import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const useUserContext = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [ordersInfo, setOrdersInfo] = useState([]);

  const updateUser = (newUserInfo) => {
    setUserInfo(newUserInfo);
  };

  const updateOrders = (newOrdersInfo) => {
    setOrdersInfo(newOrdersInfo);
  };

  return (
    <UserContext.Provider
      value={{ userInfo, updateUser, ordersInfo, updateOrders }}
    >
      {children}
    </UserContext.Provider>
  );
};
