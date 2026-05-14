'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '@/lib/api';

interface AppContextType {
  ProjectOpen: boolean;
  SetProjectOpen: (open: boolean) => void;
  TaskOpen: boolean;
  SetTaskOpen: (open: boolean) => void;
  SelectProject: any;
  SetSelectProject: (project: any) => void;

  UpdateTaskData: any;
  SetUpdateTaskData: (data: any) => void;
  isAuthenticated: boolean | null;
  setIsAuthenticated: (val: boolean | null) => void; 
  user: any;
  setUser: (user: any) => void;
  InviteOpen: boolean;
  SetInviteOpen: (val: boolean) => void
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [ProjectOpen, SetProjectOpen] = useState(false);
  const [TaskOpen, SetTaskOpen] = useState(false);
  const [InviteOpen, SetInviteOpen] = useState(false);
  const [SelectProject, SetSelectProject] = useState(null);
  const [UpdateTaskData, SetUpdateTaskData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/get-auth');
        setIsAuthenticated(res.data.authenticated);

        setUser(res.data.user || null);
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('accessToken');
      }
    };

    checkAuth();
  }, []);

  return (
    <AppContext.Provider
      value={{
        ProjectOpen,
        SetProjectOpen,
        TaskOpen,
        SetTaskOpen,
        SelectProject,
        SetSelectProject,
        UpdateTaskData,
        SetUpdateTaskData,
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        InviteOpen,
        SetInviteOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return context;
};

