import { X } from 'lucide-react';
import ModalPortal from './ModalPortal';
import './ConfirmDialog.css';

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <ModalPortal>
      <div className="confirm-overlay" onClick={onCancel}>
        <div
          className="confirm-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="confirm-header">
            <h3 id="confirm-dialog-title">{title}</h3>
            <button className="btn-ghost confirm-close" onClick={onCancel} aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>
          {message && <p className="confirm-message">{message}</p>}
          <div className="confirm-actions">
            <button className="btn btn-secondary" data-modal-initial-focus="true" onClick={onCancel}>Cancelar</button>
            <button className="btn btn-danger" onClick={onConfirm}>Eliminar</button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
