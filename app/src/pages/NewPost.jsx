import { api } from '../services/api.js';
import { navigate } from '../lib/router.jsx';
import { toast } from '../lib/toast.js';
import PostForm from '../components/PostForm.jsx';

// HU03 (perdido) e HU04 (encontrado)
export default function NewPost() {
  async function onSubmit(values, file) {
    const post = await api.createPublicacao(values, file);
    toast('Publicação criada.');
    navigate(`/publicacao/${post.id}`, { replace: true });
  }
  return (
    <div className="form-page">
      <h1>Nova publicação</h1>
      <p className="lead">Quanto mais detalhes, mais fácil o dono reconhecer o objeto.</p>
      <PostForm submitLabel="Publicar" onSubmit={onSubmit} onCancel={() => navigate('/')} />
    </div>
  );
}
