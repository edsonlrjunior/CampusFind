import { useState } from 'react';
import { api, isDemo } from '../services/api.js';
import { DEMO_LOGIN } from '../services/localBackend.js';
import { navigate } from '../lib/router.jsx';
import { toast } from '../lib/toast.js';
import ConfirmDialog from './ConfirmDialog.jsx';

export default function DemoBanner() {
  const [confirm, setConfirm] = useState(false);
  if (!isDemo) return null;

  async function reset() {
    await api.reset();
    setConfirm(false);
    toast('Dados de demonstração restaurados.');
    navigate('/');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }

  return (
    <div className="demo-banner" role="note">
      <p>
        <strong>Modo demonstração.</strong> <span className="demo-extra">Os dados ficam só neste navegador. </span>Conta de teste:{' '}
        <code>{DEMO_LOGIN.email}</code> / <code>{DEMO_LOGIN.senha}</code>
      </p>
      <button type="button" className="link-button" onClick={() => setConfirm(true)}>Restaurar dados</button>
      <ConfirmDialog
        open={confirm}
        title="Restaurar dados de demonstração?"
        message="Contas e publicações criadas neste navegador serão apagadas e os exemplos voltarão ao estado inicial."
        confirmLabel="Restaurar dados"
        onConfirm={reset}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
