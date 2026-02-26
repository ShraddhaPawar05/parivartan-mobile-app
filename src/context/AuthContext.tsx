import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebase';

type AuthState = {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'logged in' : 'logged out');
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
