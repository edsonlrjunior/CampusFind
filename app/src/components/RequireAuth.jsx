import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { navigate } from '../lib/router.jsx';
import { loginPath } from '../lib/authRedirect.js';
import Loading from './Loading.jsx';

// RN01: telas de criação/edição/encerramento exigem autenticação.
export default function RequireAuth({ children, returnTo = '/' }) {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && !user) {
      navigate(loginPath(returnTo), { replace: true });
    }
  }, [user, loading, returnTo]);
  if (loading || !user) return <Loading />;
  return children;
}
