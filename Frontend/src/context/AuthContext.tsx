import React, { createContext, useContext, useState } from 'react';
import { Doctor } from '../types';

interface AuthContextType {
  token: string | null;
  doctor: Doctor | null;
  login: (token: string, doctorData: Doctor) => void;
  logout: () => void;
  updateDoctor: (doctorData: Doctor) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [doctor, setDoctor] = useState<Doctor | null>(() => {
    const saved = localStorage.getItem('doctor_data');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (newToken: string, doctorData: Doctor) => {
    setToken(newToken);
    setDoctor(doctorData);
    localStorage.setItem('jwt_token', newToken);
    localStorage.setItem('doctor_data', JSON.stringify(doctorData));
  };

  const updateDoctor = (doctorData: Doctor) => {
    setDoctor(doctorData);
    localStorage.setItem('doctor_data', JSON.stringify(doctorData));
  };

  const logout = () => {
    setToken(null);
    setDoctor(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('doctor_data');
  };

  return (
    <AuthContext.Provider value={{ token, doctor, login, logout, updateDoctor, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
