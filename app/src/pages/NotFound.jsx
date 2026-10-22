import { Link } from '../lib/router.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFound() {
  return (
    <EmptyState title="Página não encontrada">
      <p>O endereço pode estar errado ou a página foi removida.</p>
      <Link to="/" className="btn btn-primary">Voltar ao início</Link>
    </EmptyState>
  );
}
