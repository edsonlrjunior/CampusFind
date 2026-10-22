import { Link, navigate } from '../lib/router.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from '../lib/toast.js';

function NavLink({ to, path, children }) {
  const active = to === '/' ? path === '/' : path.startsWith(to);
  return (
    <Link to={to} className={active ? 'nav-link active' : 'nav-link'} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  );
}

export default function Header({ path }) {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    toast('Você saiu da sua conta.');
    navigate('/');
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="CampusFind, início">
          <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
            <path d="M10 3h16a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3H10L3 16z" fill="currentColor" />
            <circle cx="11" cy="16" r="2.6" fill="var(--surface)" />
          </svg>
          CampusFind
        </Link>
        <nav className="main-nav" aria-label="Principal">
          <NavLink to="/" path={path}>Início</NavLink>
          <NavLink to="/nova" path={path}><span className="nav-long">Nova publicação</span><span className="nav-short">Publicar</span></NavLink>
          <NavLink to="/minhas" path={path}><span className="nav-long">Minhas publicações</span><span className="nav-short">Minhas</span></NavLink>
        </nav>
        <div className="session">
          {user ? (
            <>
              <span className="session-name" title={user.email}>Olá, {user.nome.split(' ')[0]}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sair</button>
            </>
          ) : (
            <Link to="/entrar" className="btn btn-secondary btn-sm">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  );
}
