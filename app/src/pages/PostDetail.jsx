import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from '../lib/router.jsx';
import { toast } from '../lib/toast.js';
import { formatDate, onlyDigits } from '../lib/validation.js';
import { StatusBadge, TipoBadge } from '../components/Badges.jsx';
import Thumb from '../components/Thumb.jsx';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

function Contato({ usuarioId, tipo, titulo }) {
  const { user } = useAuth();
  const [contato, setContato] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    api.getContato(usuarioId).then(setContato).catch((e) => setError(e.message));
  }, [user, usuarioId]);

  if (!user) {
    const here = window.location.hash.replace(/^#/, '');
    return (
      <div className="contact-box">
        <h2>Contato</h2>
        <p>Entre na sua conta para ver o telefone e o e-mail de quem publicou.</p>
        <Link to={`/entrar?next=${encodeURIComponent(here)}`} className="btn btn-primary">Entrar para ver o contato</Link>
      </div>
    );
  }
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!contato) return <div className="contact-box"><Loading label="Carregando contato…" /></div>;

  const own = user.id === usuarioId;
  const digits = onlyDigits(contato.telefone);
  const msg = encodeURIComponent(`Olá, ${contato.nome.split(' ')[0]}! Vi sua publicação “${titulo}” no CampusFind.`);
  return (
    <div className="contact-box">
      <h2>{own ? 'Seu contato nesta publicação' : tipo === 'PERDIDO' ? 'Encontrou? Fale com o dono' : 'É seu? Fale com quem encontrou'}</h2>
      <p className="contact-name">{contato.nome}</p>
      <ul className="contact-list">
        <li><span>Telefone</span><a href={`tel:+55${digits}`}>{contato.telefone}</a></li>
        <li><span>E-mail</span><a href={`mailto:${contato.email}?subject=${encodeURIComponent('CampusFind: ' + titulo)}`}>{contato.email}</a></li>
      </ul>
      {!own && (
        <a className="btn btn-secondary btn-sm" href={`https://wa.me/55${digits}?text=${msg}`} target="_blank" rel="noopener noreferrer">
          Enviar mensagem no WhatsApp
        </a>
      )}
    </div>
  );
}

// HU07 — Ver detalhes e contato (RF07, RF08); ações do autor (HU08, HU09)
export default function PostDetail({ id }) {
  const { user } = useAuth();
  const [post, setPost] = useState(undefined);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getPublicacao(id).then(setPost).catch(() => setPost(null));
  }, [id, user?.id]);

  if (post === undefined) return <Loading />;
  if (!post) {
    return (
      <EmptyState title="Publicação não encontrada">
        <p>Ela pode ter sido resolvida pelo autor ou o link está incorreto.</p>
        <Link to="/" className="btn btn-primary">Ver publicações ativas</Link>
      </EmptyState>
    );
  }

  const isOwner = user?.id === post.usuarioId; // RN06
  const isActive = post.status === 'ATIVA';

  async function resolver() {
    setBusy(true);
    try {
      setPost(await api.resolverPublicacao(post.id));
      toast('Publicação marcada como resolvida.');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  }

  return (
    <>
      <p className="back"><a href="#/" onClick={(e) => { if (window.history.length > 1) { e.preventDefault(); window.history.back(); } }}>Voltar</a></p>
      <article className={`detail ${post.tipo === 'PERDIDO' ? 'is-lost' : 'is-found'}`}>
        <Thumb post={post} large />
        <div className="detail-body">
          <div className="post-card-head">
            <TipoBadge tipo={post.tipo} />
            <StatusBadge status={post.status} />
          </div>
          <h1>{post.titulo}</h1>
          <dl className="detail-meta">
            <div><dt>Categoria</dt><dd>{post.categoria}</dd></div>
            <div><dt>{post.tipo === 'PERDIDO' ? 'Perdido em' : 'Encontrado em'}</dt><dd>{formatDate(post.dataOcorrido)}</dd></div>
            <div><dt>Local</dt><dd>{post.local}</dd></div>
            <div><dt>Publicado em</dt><dd>{formatDate(post.criadoEm)}</dd></div>
          </dl>
          <h2 className="sr-only">Descrição</h2>
          <p className="description">{post.descricao}</p>

          {isOwner && isActive && (
            <div className="owner-actions">
              <Link to={`/publicacao/${post.id}/editar`} className="btn btn-secondary">Editar</Link>
              <button type="button" className="btn btn-primary" onClick={() => setConfirm(true)}>Marcar como resolvida</button>
            </div>
          )}
          {!isActive && (
            <div className="alert alert-info">Esta publicação foi resolvida e não aparece mais na listagem.</div>
          )}

          {isActive && <Contato usuarioId={post.usuarioId} tipo={post.tipo} titulo={post.titulo} />}
        </div>
      </article>
      <ConfirmDialog
        open={confirm}
        busy={busy}
        title="Marcar como resolvida?"
        message="A publicação sairá da listagem e não poderá mais ser editada. Ela continua no seu histórico."
        confirmLabel="Marcar como resolvida"
        onConfirm={resolver}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
