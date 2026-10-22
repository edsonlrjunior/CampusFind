import { STATUS_LABEL, TIPO_LABEL } from '../lib/validation.js';

/** Etiqueta em formato de "tag de achados e perdidos". */
export function TipoBadge({ tipo }) {
  return <span className={`tag-badge tag-${tipo === 'PERDIDO' ? 'lost' : 'found'}`}>{TIPO_LABEL[tipo]}</span>;
}

export function StatusBadge({ status }) {
  return <span className={`status-badge status-${status === 'ATIVA' ? 'active' : 'done'}`}>{STATUS_LABEL[status]}</span>;
}
