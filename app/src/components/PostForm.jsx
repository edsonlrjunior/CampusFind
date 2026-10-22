import { useEffect, useRef, useState } from 'react';
import Field from './Field.jsx';
import { api } from '../services/api.js';
import { resizeImage } from '../lib/image.js';
import { LIMITS, TIPO_LABEL, hasErrors, todayISO, validateImage, validatePublicacao } from '../lib/validation.js';

const EMPTY = { tipo: '', titulo: '', categoriaId: '', descricao: '', dataOcorrido: '', local: '' };

/**
 * Formulário usado em Nova publicação (HU03/HU04) e Editar publicação (HU08).
 * Na edição o tipo fica bloqueado (RN09).
 */
export default function PostForm({ initial, isEdit = false, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => ({ ...EMPTY, ...initial }));
  const [errors, setErrors] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.imagemUrl || null);
  const [removerImagem, setRemoverImagem] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const formRef = useRef(null);
  const fileRef = useRef(null);
  const today = todayISO();

  useEffect(() => {
    api.listCategorias().then(setCategorias).catch((e) => setFormError(e.message));
  }, []);

  useEffect(() => () => { if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  function set(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _, ...rest }) => rest);
  }

  function onFile(e) {
    const f = e.target.files?.[0] || null;
    const err = validateImage(f); // RNF12: rejeita antes do envio
    if (err) {
      setErrors((x) => ({ ...x, imagem: err }));
      setFile(null);
      e.target.value = '';
      return;
    }
    setErrors(({ imagem: _, ...rest }) => rest);
    setFile(f);
    setRemoverImagem(false);
    setPreview(f ? URL.createObjectURL(f) : initial?.imagemUrl || null);
  }

  function clearImage() {
    setFile(null);
    setPreview(null);
    setRemoverImagem(true);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    const errs = validatePublicacao(values, { isEdit, file, today });
    setErrors(errs);
    if (hasErrors(errs)) {
      // Destaca e leva o foco ao primeiro campo pendente (HU03).
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    setSaving(true);
    try {
      const upload = file ? await resizeImage(file) : null;
      await onSubmit(values, upload, { removerImagem });
    } catch (err) {
      setFormError(err.message);
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="post-form">
      {formError && <div className="alert alert-error" role="alert">{formError}</div>}

      <fieldset className={errors.tipo ? 'field has-error' : 'field'} aria-describedby={errors.tipo ? 'tipo-error' : isEdit ? 'tipo-hint' : undefined}>
        <legend>O que aconteceu?{!isEdit && <span className="req" aria-hidden="true"> *</span>}</legend>
        <div className="tipo-options">
          {['PERDIDO', 'ENCONTRADO'].map((t) => (
            <label key={t} className={`tipo-option tipo-${t === 'PERDIDO' ? 'lost' : 'found'} ${values.tipo === t ? 'checked' : ''}`}>
              <input
                type="radio"
                name="tipo"
                value={t}
                checked={values.tipo === t}
                disabled={isEdit}
                onChange={() => set('tipo', t)}
                aria-invalid={errors.tipo ? 'true' : undefined}
              />
              <span className="tipo-title">{TIPO_LABEL[t]}</span>
              <span className="tipo-desc">{t === 'PERDIDO' ? 'Perdi um objeto e estou procurando' : 'Achei um objeto e quero devolver'}</span>
            </label>
          ))}
        </div>
        {isEdit && <p className="hint" id="tipo-hint">O tipo não pode ser alterado. Se estiver errado, crie uma nova publicação.</p>}
        {errors.tipo && <p className="error-text" id="tipo-error">{errors.tipo}</p>}
      </fieldset>

      <div className="grid-2">
        <Field id="titulo" label="Título" required error={errors.titulo}>
          {(a) => <input {...a} className="input" maxLength={LIMITS.titulo} placeholder="Ex.: Mochila preta" value={values.titulo} onChange={(e) => set('titulo', e.target.value)} />}
        </Field>
        <Field id="categoriaId" label="Categoria" required error={errors.categoriaId}>
          {(a) => (
            <select {...a} className="input" value={values.categoriaId} onChange={(e) => set('categoriaId', e.target.value)}>
              <option value="">Selecione…</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          )}
        </Field>
        <Field id="dataOcorrido" label={values.tipo === 'ENCONTRADO' ? 'Quando encontrou' : 'Quando perdeu'} required error={errors.dataOcorrido}>
          {(a) => <input {...a} type="date" className="input" max={today} value={values.dataOcorrido} onChange={(e) => set('dataOcorrido', e.target.value)} />}
        </Field>
        <Field id="local" label="Local" required error={errors.local}>
          {(a) => <input {...a} className="input" maxLength={LIMITS.local} placeholder="Ex.: Bloco B, sala 204" value={values.local} onChange={(e) => set('local', e.target.value)} />}
        </Field>
      </div>

      <Field id="descricao" label="Descrição" required error={errors.descricao} hint="Cor, marca, detalhes e marcas de uso ajudam a identificar o objeto.">
        {(a) => <textarea {...a} rows={5} className="input" maxLength={LIMITS.descricao} value={values.descricao} onChange={(e) => set('descricao', e.target.value)} />}
      </Field>

      <Field id="imagem" label="Foto (opcional)" error={errors.imagem} hint="JPG, JPEG ou PNG de até 5 MB.">
        {(a) => (
          <div className="image-picker">
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Pré-visualização da foto" />
                <button type="button" className="btn btn-ghost btn-sm" onClick={clearImage}>Remover foto</button>
              </div>
            )}
            <input {...a} ref={fileRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="input input-file" onChange={onFile} />
          </div>
        )}
      </Field>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando…' : submitLabel}</button>
      </div>
    </form>
  );
}
