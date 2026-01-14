// src/context/CenterContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const CenterContext = createContext();

export const useCenter = () => {
  const context = useContext(CenterContext);
  if (!context) {
    throw new Error('useCenter must be used within a CenterProvider');
  }
  return context;
};

export const CenterProvider = ({ children }) => {
  const [centerData, setCenterData] = useState({
    centerId: '',
    centerName: '',
    isLoggedIn: false,
  });

  const setCenter = (id, name) => {
    setCenterData({
      centerId: id,
      centerName: name,
      isLoggedIn: true,
    });
  };

  const clearCenter = () => {
    setCenterData({
      centerId: '',
      centerName: '',
      isLoggedIn: false,
    });
  };

  return (
    <CenterContext.Provider value={{ centerData, setCenter, clearCenter }}>
      {children}
    </CenterContext.Provider>
  );
};