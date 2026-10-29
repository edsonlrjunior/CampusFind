import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authDestination } from '../lib/authRedirect.js';
import { navigate } from '../lib/router.jsx';
import Loading from './Loading.jsx';

// Só navega depois que a sessão já estiver disponível para as rotas protegidas.
export default function AuthPage({ next, children }) {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && user) navigate(authDestination(next), { replace: true });
  }, [user, loading, next]);
  if (loading || user) return <Loading />;
  return children;
}
