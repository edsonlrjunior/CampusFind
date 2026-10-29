import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "../lib/router.jsx";
import { authDestination } from "../lib/authRedirect.js";
import { useAuthCooldown } from "../lib/useAuthCooldown.js";
import { toast } from "../lib/toast.js";
import { hasErrors, validateLogin } from "../lib/validation.js";
import Field from "../components/Field.jsx";

// HU02 — Entrar no sistema
export default function Login({ next }) {
	const { signIn } = useAuth();
	const [values, setValues] = useState({ email: "", senha: "" });
	const [errors, setErrors] = useState({});
	const [formError, setFormError] = useState("");
	const [busy, setBusy] = useState(false);
	const submitting = useRef(false);
	const { remaining, startCooldown } = useAuthCooldown('login');

	async function onSubmit(e) {
		e.preventDefault();
		if (busy || submitting.current || remaining > 0) return;
		setFormError("");
		const errs = validateLogin(values);
		setErrors(errs);
		if (hasErrors(errs)) return;
		submitting.current = true;
		setBusy(true);
		try {
			const u = await signIn(values);
			toast(`Bem-vindo, ${u.nome.split(" ")[0]}!`);
		} catch (err) {
			startCooldown(err.cooldownSeconds);
			setFormError(err.message);
			setBusy(false);
		} finally {
			submitting.current = false;
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
			{remaining > 0 && <p className="hint" role="status">Aguarde {remaining} segundos antes de tentar novamente.</p>}
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
					disabled={busy || remaining > 0}>
					{busy ? "Entrando…" : remaining > 0 ? `Tentar novamente em ${remaining} s` : "Entrar"}
				</button>
			</form>
			<p className="auth-switch">
				Ainda não tem conta?{" "}
				<Link
					to={
						next ? `/cadastro?next=${encodeURIComponent(authDestination(next))}` : "/cadastro"
					}>
					Criar conta
				</Link>
			</p>
		</div>
	);
}
