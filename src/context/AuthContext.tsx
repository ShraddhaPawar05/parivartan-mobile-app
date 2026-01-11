import React, { createContext, useContext, useEffect, useState } from 'react';

// Optional AsyncStorage (will fail gracefully if not installed)
let AsyncStorage: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

type AuthState = {
  isLoggedIn: boolean;
  user?: { name?: string; emailOrPhone?: string } | null;
  signIn: (identifier: string) => Promise<void>;
  signUp: (name: string, identifier: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name?: string; emailOrPhone?: string } | null>(null);

  useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        const raw = await AsyncStorage.getItem('@parivartan:auth');
        if (raw) {
          const data = JSON.parse(raw);
          setUser(data.user ?? null);
          setLoggedIn(Boolean(data.isLoggedIn));
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        await AsyncStorage.setItem('@parivartan:auth', JSON.stringify({ isLoggedIn, user }));
      } catch (e) {
        // ignore
      }
    })();
  }, [isLoggedIn, user]);

  const signIn = async (identifier: string) => {
    // mock sign in
    setUser({ name: undefined, emailOrPhone: identifier });
    setLoggedIn(true);
  };

  const signUp = async (name: string, identifier: string) => {
    // mock sign up
    setUser({ name, emailOrPhone: identifier });
    setLoggedIn(true);
  };

  const signOut = async () => {
    setUser(null);
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
