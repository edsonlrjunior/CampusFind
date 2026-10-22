const ICONS = {
  Documentos: 'M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6 M10 17h6',
  'Eletrônicos': 'M5 5h14v10H5z M3 19h18 M10 15v4 M14 15v4',
  'Acessórios': 'M6 9h12l-1 11H7z M9 9V7a3 3 0 0 1 6 0v2',
  'Material Escolar': 'M4 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4z M20 5h-7 M20 5v13h-7',
  Roupas: 'M8 3l-5 4 3 3 2-1v12h8V9l2 1 3-3-5-4a4 4 0 0 1-8 0z',
  Outros: 'M12 3a5 5 0 0 0-5 5v2h10V8a5 5 0 0 0-5-5z M5 10h14v10H5z',
};

export default function Thumb({ post, large = false }) {
  if (post.imagemUrl) {
    return (
      <div className={large ? 'thumb thumb-lg' : 'thumb'}>
        <img src={post.imagemUrl} alt={`Foto: ${post.titulo}`} loading="lazy" />
      </div>
    );
  }
  return (
    <div className={`${large ? 'thumb thumb-lg' : 'thumb'} thumb-empty`} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={large ? 56 : 32} height={large ? 56 : 32} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        <path d={ICONS[post.categoria] || ICONS.Outros} />
      </svg>
      {large && <span>Sem foto</span>}
    </div>
  );
}
