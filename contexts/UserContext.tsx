import React, { createContext, useState, useEffect, useContext } from 'react';
import { UserProfile } from '../types';

const DEFAULT_USER: UserProfile = {
  name: "Coureur",
  level: "Intermédiaire",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
};

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  useEffect(() => {
    const savedUser = localStorage.getItem('runflow_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => {
      const newUser = { ...prev, ...updates };
      localStorage.setItem('runflow_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};