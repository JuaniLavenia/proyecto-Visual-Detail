import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = (tokenValue, userIdValue) => {
    setToken(tokenValue);
    setUserId(userIdValue);
    localStorage.setItem("token", tokenValue);
  };

  const logout = () => {
    setToken("");
    setUserId("");
    localStorage.removeItem("token");
  };

  const authContextValues = {
    token,
    userId,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValues}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };
