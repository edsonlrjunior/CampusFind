import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, navigate } from '../lib/router.jsx';
import { toast } from '../lib/toast.js';
import PostForm from '../components/PostForm.jsx';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';

// HU08 — Editar minha publicação (RN06, RN09)
export default function EditPost({ id }) {
  const { user } = useAuth();
  const [post, setPost] = useState(undefined);

  useEffect(() => {
    api.getPublicacao(id).then(setPost).catch(() => setPost(null));
  }, [id]);

  if (post === undefined) return <Loading />;
  if (!post || post.usuarioId !== user.id || post.status !== 'ATIVA') {
    return (
      <EmptyState title="Esta publicação não pode ser editada">
        <p>Só o autor pode editar, e apenas enquanto a publicação estiver ativa.</p>
        <Link to="/minhas" className="btn btn-secondary">Ver minhas publicações</Link>
      </EmptyState>
    );
  }

  async function onSubmit(values, file, opts) {
    await api.updatePublicacao(id, values, file, opts);
    toast('Alterações salvas.');
    navigate(`/publicacao/${id}`, { replace: true });
  }

  return (
    <div className="form-page">
      <h1>Editar publicação</h1>
      <p className="lead">Corrija ou complete as informações do seu anúncio.</p>
      <PostForm
        isEdit
        initial={{
          tipo: post.tipo,
          titulo: post.titulo,
          categoriaId: String(post.categoriaId),
          descricao: post.descricao,
          dataOcorrido: post.dataOcorrido,
          local: post.local,
          imagemUrl: post.imagemUrl,
        }}
        submitLabel="Salvar alterações"
        onSubmit={onSubmit}
        onCancel={() => navigate(`/publicacao/${id}`)}
      />
    </div>
  );
}
