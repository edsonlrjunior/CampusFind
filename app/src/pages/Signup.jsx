import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from '../lib/router.jsx';
import { loginPath } from '../lib/authRedirect.js';
import { toast } from '../lib/toast.js';
import { LIMITS, SENHA_MIN, formatTelefone, hasErrors, validateSignup } from '../lib/validation.js';
import Field from '../components/Field.jsx';

// HU01 — Criar conta (RF01, RN11, RN12)
export default function Signup({ next }) {
  const { signUp } = useAuth();
  const [values, setValues] = useState({ nome: '', telefone: '', email: '', senha: '', confirmacao: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const formRef = useRef(null);

  const set = (k, transform = (x) => x) => (e) => {
    setValues({ ...values, [k]: transform(e.target.value) });
    if (errors[k]) setErrors(({ [k]: _, ...rest }) => rest);
  };

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    const errs = validateSignup(values);
    setErrors(errs);
    if (hasErrors(errs)) {
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    setBusy(true);
    try {
      const result = await signUp(values);
      if (result.needsConfirmation) {
        setConfirmEmail(values.email);
        return;
      }
      toast('Conta criada. Você já pode publicar.');
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message });
      else setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (confirmEmail) {
    return (
      <div className="auth-card">
        <h1>Confirme seu e-mail</h1>
        <p>Enviamos um link de confirmação para <strong>{confirmEmail}</strong>. Depois de confirmar, volte e entre com sua senha.</p>
        <Link to={loginPath(next)} className="btn btn-primary btn-block">Ir para Entrar</Link>
      </div>
    );
  }

  return (
    <div className="auth-card auth-card-wide">
      <h1>Criar conta</h1>
      <p className="lead">Seu telefone e e-mail aparecem para usuários cadastrados nas suas publicações, para que possam falar com você.</p>
      {formError && <div className="alert alert-error" role="alert">{formError}</div>}
      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <div className="grid-2">
          <Field id="nome" label="Nome" required error={errors.nome}>
            {(a) => <input {...a} autoComplete="name" className="input" maxLength={LIMITS.nome} value={values.nome} onChange={set('nome')} />}
          </Field>
          <Field id="telefone" label="Telefone / WhatsApp" required error={errors.telefone}>
            {(a) => <input {...a} type="tel" inputMode="tel" autoComplete="tel" className="input" placeholder="(47) 99999-9999" value={values.telefone} onChange={set('telefone', formatTelefone)} />}
          </Field>
        </div>
        <Field id="email" label="E-mail" required error={errors.email}>
          {(a) => <input {...a} type="email" autoComplete="email" className="input" maxLength={LIMITS.email} value={values.email} onChange={set('email')} />}
        </Field>
        <div className="grid-2">
          <Field id="senha" label="Senha" required error={errors.senha} hint={`Mínimo de ${SENHA_MIN} caracteres.`}>
            {(a) => <input {...a} type="password" autoComplete="new-password" className="input" value={values.senha} onChange={set('senha')} />}
          </Field>
          <Field id="confirmacao" label="Confirmar senha" required error={errors.confirmacao}>
            {(a) => <input {...a} type="password" autoComplete="new-password" className="input" value={values.confirmacao} onChange={set('confirmacao')} />}
          </Field>
        </div>
        <div className="form-actions">
          <Link to={loginPath(next)} className="btn btn-secondary">Cancelar</Link>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Criando conta…' : 'Criar conta'}</button>
        </div>
      </form>
    </div>
  );
}
