import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Link } from '../lib/router.jsx';
import { toast } from '../lib/toast.js';
import PostCard from '../components/PostCard.jsx';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const TABS = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'ATIVA', label: 'Ativas' },
  { id: 'RESOLVIDA', label: 'Resolvidas' },
];

// HU10 — Minhas publicações; HU09 — marcar como resolvida
export default function MyPosts() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('TODAS');
  const [resolving, setResolving] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.listMinhas().then(setPosts).catch((e) => { setError(e.message); setPosts([]); });
  }, []);

  async function resolver() {
    setBusy(true);
    try {
      const updated = await api.resolverPublicacao(resolving.id);
      setPosts((list) => list.map((p) => (p.id === updated.id ? updated : p)));
      toast('Publicação marcada como resolvida.');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
      setResolving(null);
    }
  }

  if (!posts) return <Loading />;

  const count = (s) => (s === 'TODAS' ? posts.length : posts.filter((p) => p.status === s).length);
  const visible = tab === 'TODAS' ? posts : posts.filter((p) => p.status === tab);

  return (
    <>
      <section className="page-head">
        <div>
          <h1>Minhas publicações</h1>
          <p className="lead">Acompanhe, edite e encerre seus registros.</p>
        </div>
        <Link to="/nova" className="btn btn-primary">Publicar objeto</Link>
      </section>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {posts.length > 0 && (
        <div className="tabs" role="tablist" aria-label="Filtrar por status">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'tab active' : 'tab'} onClick={() => setTab(t.id)}>
              {t.label} <span className="tab-count">{count(t.id)}</span>
            </button>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <EmptyState title="Você ainda não publicou nada">
          <p>Perdeu ou encontrou algo? Registre agora — leva menos de 3 minutos.</p>
          <Link to="/nova" className="btn btn-primary">Publicar objeto</Link>
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState title={tab === 'ATIVA' ? 'Nenhuma publicação ativa' : 'Nenhuma publicação resolvida'} />
      ) : (
        <div className="post-grid">
          {visible.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              showStatus
              actions={p.status === 'ATIVA' ? (
                <>
                  <Link to={`/publicacao/${p.id}/editar`} className="btn btn-secondary btn-sm">Editar</Link>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setResolving(p)}>Marcar como resolvida</button>
                </>
              ) : null}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!resolving}
        busy={busy}
        title="Marcar como resolvida?"
        message={resolving ? `“${resolving.titulo}” sairá da listagem e não poderá mais ser editada.` : ''}
        confirmLabel="Marcar como resolvida"
        onConfirm={resolver}
        onCancel={() => setResolving(null)}
      />
    </>
  );
}
