import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.getSession()
      .then((u) => alive && setUser(u))
      .finally(() => alive && setLoading(false));
    const unsubscribe = api.onAuthChange((u) => alive && setUser(u));
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (cred) => {
    const u = await api.signIn(cred);
    setUser(u);
    return u;
  }, []);

  const signUp = useCallback(async (data) => {
    const result = await api.signUp(data);
    if (result.user) setUser(result.user);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await api.signOut();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
