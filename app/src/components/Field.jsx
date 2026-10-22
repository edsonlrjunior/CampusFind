// Campo de formulário acessível: rótulo, dica e erro ligados ao controle.
export default function Field({ id, label, required, hint, error, children }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const control = typeof children === 'function'
    ? children({ id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': describedBy })
    : children;
  return (
    <div className={error ? 'field has-error' : 'field'}>
      <label htmlFor={id}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
      </label>
      {control}
      {hint && <p className="hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="error-text" id={`${id}-error`}>{error}</p>}
    </div>
  );
}
