import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock get initial session
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setSession({ user: u });
      setUser(u);
    }
    setLoading(false);
  }, []);

  const value = {
    session,
    user,
    loading,
    signIn: async (email, password) => {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 800));
      const u = { id: 'mock-user-123', email };
      localStorage.setItem('mockUser', JSON.stringify(u));
      setSession({ user: u });
      setUser(u);
      return { data: { user: u }, error: null };
    },
    signUp: async (email, password) => {
      await new Promise(r => setTimeout(r, 800));
      const u = { id: 'mock-user-123', email };
      localStorage.setItem('mockUser', JSON.stringify(u));
      setSession({ user: u });
      setUser(u);
      return { data: { user: u }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem('mockUser');
      setSession(null);
      setUser(null);
      // Clear mock data so they can start fresh if needed
      localStorage.removeItem('setupComplete');
      localStorage.removeItem('mockAccounts');
      localStorage.removeItem('mockTransactions');
      return { error: null };
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
