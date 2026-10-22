import { Link } from '../lib/router.jsx';
import { formatDate } from '../lib/validation.js';
import { StatusBadge, TipoBadge } from './Badges.jsx';
import Thumb from './Thumb.jsx';

export default function PostCard({ post, showStatus = false, actions = null }) {
  return (
    <article className={`post-card ${post.tipo === 'PERDIDO' ? 'is-lost' : 'is-found'}`}>
      <Thumb post={post} />
      <div className="post-card-body">
        <div className="post-card-head">
          <TipoBadge tipo={post.tipo} />
          {showStatus && <StatusBadge status={post.status} />}
        </div>
        <h3>
          <Link to={`/publicacao/${post.id}`} className="card-link">{post.titulo}</Link>
        </h3>
        <dl className="meta">
          <div><dt>Categoria</dt><dd>{post.categoria}</dd></div>
          <div><dt>Local</dt><dd>{post.local}</dd></div>
          <div><dt>Data</dt><dd>{formatDate(post.dataOcorrido)}</dd></div>
        </dl>
        <p className="excerpt">{post.descricao}</p>
        {actions && <div className="card-actions">{actions}</div>}
      </div>
    </article>
  );
}
