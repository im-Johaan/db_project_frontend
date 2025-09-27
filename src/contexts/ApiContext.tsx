import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ApiContextType {
  apiCall: (url: string, options?: RequestInit) => Promise<Response>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`https://db-project-backend-1.onrender.com/api${url}`, {
      ...options,
      headers,
    });

    return response;
  };

  return (
    <ApiContext.Provider value={{ apiCall }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}