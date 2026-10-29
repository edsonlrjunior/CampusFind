import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, navigate } from "../lib/router.jsx";
import { toast } from "../lib/toast.js";
import { hasErrors, validateLogin } from "../lib/validation.js";
import Field from "../components/Field.jsx";

const safeNext = (n) =>
	n && n.startsWith("/") && !n.startsWith("//") ? n : "/";

// HU02 — Entrar no sistema
export default function Login({ next }) {
	const { signIn } = useAuth();
	const [values, setValues] = useState({ email: "", senha: "" });
	const [errors, setErrors] = useState({});
	const [formError, setFormError] = useState("");
	const [busy, setBusy] = useState(false);

	async function onSubmit(e) {
		e.preventDefault();
		setFormError("");
		const errs = validateLogin(values);
		setErrors(errs);
		if (hasErrors(errs)) return;
		setBusy(true);
		try {
			const u = await signIn(values);
			toast(`Bem-vindo, ${u.nome.split(" ")[0]}!`);
			navigate(safeNext(next), { replace: true });
		} catch (err) {
			setFormError(err.message);
			setBusy(false);
		}
	}

	const set = (k) => (e) => setValues({ ...values, [k]: e.target.value });

	return (
		<div className="auth-card">
			<h1>Entrar</h1>
			<p className="lead">
				Entre para Publicar Objetos e ver o contato de quem publicou.
			</p>
			{formError && (
				<div className="alert alert-error" role="alert">
					{formError}
				</div>
			)}
			<form onSubmit={onSubmit} noValidate>
				<Field id="email" label="E-mail" error={errors.email}>
					{(a) => (
						<input
							{...a}
							type="email"
							autoComplete="email"
							className="input"
							value={values.email}
							onChange={set("email")}
						/>
					)}
				</Field>
				<Field id="senha" label="Senha" error={errors.senha}>
					{(a) => (
						<input
							{...a}
							type="password"
							autoComplete="current-password"
							className="input"
							value={values.senha}
							onChange={set("senha")}
						/>
					)}
				</Field>
				<button
					type="submit"
					className="btn btn-primary btn-block"
					disabled={busy}>
					{busy ? "Entrando…" : "Entrar"}
				</button>
			</form>
			<p className="auth-switch">
				Ainda não tem conta?{" "}
				<Link
					to={
						next ? `/cadastro?next=${encodeURIComponent(next)}` : "/cadastro"
					}>
					Criar conta
				</Link>
			</p>
		</div>
	);
}
