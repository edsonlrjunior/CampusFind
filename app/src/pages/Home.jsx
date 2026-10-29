import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { Link } from "../lib/router.jsx";
import PostCard from "../components/PostCard.jsx";
import Loading from "../components/Loading.jsx";
import EmptyState from "../components/EmptyState.jsx";

// Mantém os filtros ao voltar dos detalhes para a listagem.
let lastFilters = { q: "", categoriaId: "", tipo: "" };

// HU05 (listagem de ativas) e HU06 (busca e filtros)
export default function Home() {
	const [draft, setDraft] = useState(lastFilters);
	const [filters, setFilters] = useState(lastFilters);
	const [categorias, setCategorias] = useState([]);
	const [items, setItems] = useState([]);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		api
			.listCategorias()
			.then(setCategorias)
			.catch(() => {});
	}, []);

	useEffect(() => {
		let alive = true;
		lastFilters = filters;
		setLoading(true);
		setError("");
		api
			.listPublicacoes({ ...filters, page })
			.then((r) => {
				if (!alive) return;
				setItems((prev) => (page === 0 ? r.items : [...prev, ...r.items]));
				setHasMore(r.hasMore);
			})
			.catch((e) => alive && setError(e.message))
			.finally(() => alive && setLoading(false));
		return () => {
			alive = false;
		};
	}, [filters, page]);

	function apply(next) {
		setPage(0);
		setFilters(next);
	}

	function onSubmit(e) {
		e.preventDefault();
		apply(draft);
	}

	function onSelect(name, value) {
		const next = { ...draft, [name]: value };
		setDraft(next);
		apply(next);
	}

	function clear() {
		const empty = { q: "", categoriaId: "", tipo: "" };
		setDraft(empty);
		apply(empty);
	}

	const filtered = filters.q || filters.categoriaId || filters.tipo;

	return (
		<>
			<section className="page-head">
				<div>
					<h1>Achados e Perdidos</h1>
					<p className="lead">
						Perdeu algo no campus ou encontrou um objeto? Procure aqui antes de
						desistir.
					</p>
				</div>
				<Link to="/nova" className="btn btn-primary">
					Publicar Objeto
				</Link>
			</section>

			<form className="filters" role="search" onSubmit={onSubmit}>
				<div className="filter-search">
					<label htmlFor="q" className="sr-only">
						Buscar por palavra
					</label>
					<input
						id="q"
						type="search"
						className="input"
						placeholder="Buscar por objeto, cor, marca…"
						value={draft.q}
						onChange={(e) => setDraft({ ...draft, q: e.target.value })}
					/>
					<button type="submit" className="btn btn-primary">
						Buscar
					</button>
				</div>
				<div className="filter-selects">
					<label htmlFor="f-tipo" className="sr-only">
						Tipo
					</label>
					<select
						id="f-tipo"
						className="input"
						value={draft.tipo}
						onChange={(e) => onSelect("tipo", e.target.value)}>
						<option value="">Perdidos e encontrados</option>
						<option value="PERDIDO">Só perdidos</option>
						<option value="ENCONTRADO">Só encontrados</option>
					</select>
					<label htmlFor="f-cat" className="sr-only">
						Categoria
					</label>
					<select
						id="f-cat"
						className="input"
						value={draft.categoriaId}
						onChange={(e) => onSelect("categoriaId", e.target.value)}>
						<option value="">Todas as categorias</option>
						{categorias.map((c) => (
							<option key={c.id} value={c.id}>
								{c.nome}
							</option>
						))}
					</select>
				</div>
			</form>

			{error && (
				<div className="alert alert-error" role="alert">
					{error}
				</div>
			)}

			{loading && page === 0 ? (
				<Loading label="Carregando publicações…" />
			) : items.length === 0 && !error ? (
				filtered ? (
					<EmptyState title="Nenhum resultado encontrado">
						<p>Tente outra palavra ou remova os filtros.</p>
						<button type="button" className="btn btn-secondary" onClick={clear}>
							Limpar filtros
						</button>
					</EmptyState>
				) : (
					<EmptyState title="Nenhuma publicação ativa">
						<p>Seja o primeiro a registrar um objeto perdido ou encontrado.</p>
						<Link to="/nova" className="btn btn-primary">
							Publicar Objeto
						</Link>
					</EmptyState>
				)
			) : (
				<>
					<p className="result-count" aria-live="polite">
						{filtered ? "Resultados da busca" : "Publicações mais recentes"}
						{filtered && (
							<button type="button" className="link-button" onClick={clear}>
								Limpar filtros
							</button>
						)}
					</p>
					<div className="post-grid">
						{items.map((p) => (
							<PostCard key={p.id} post={p} />
						))}
					</div>
					{hasMore && (
						<div className="load-more">
							<button
								type="button"
								className="btn btn-secondary"
								disabled={loading}
								onClick={() => setPage((n) => n + 1)}>
								{loading ? "Carregando…" : "Carregar mais"}
							</button>
						</div>
					)}
				</>
			)}
		</>
	);
}
