import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { navigate } from '../lib/router.jsx';
import Loading from './Loading.jsx';

// RN01: telas de criação/edição/encerramento exigem autenticação.
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && !user) {
      const here = window.location.hash.replace(/^#/, '') || '/';
      navigate(`/entrar?next=${encodeURIComponent(here)}`, { replace: true });
    }
  }, [user, loading]);
  if (loading || !user) return <Loading />;
  return children;
}
