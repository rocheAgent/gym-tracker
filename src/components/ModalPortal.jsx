import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

let openModalCount = 0;
let previousBodyOverflow = '';

export default function ModalPortal({ children }) {
  const previousActiveElement = useRef(document.activeElement);

  useEffect(() => {
    if (openModalCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    openModalCount += 1;

    const releaseModal = () => {
      openModalCount -= 1;
      if (openModalCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
      }
    };

    const dialogs = [...document.querySelectorAll('[role="dialog"]')];
    const dialog = dialogs[dialogs.length - 1];
    if (!dialog) return releaseModal;

    const initialFocus = dialog.querySelector('[data-modal-initial-focus]')
      || dialog.querySelector('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
    initialFocus?.focus();

    const handleKeyDown = event => {
      if (event.key !== 'Tab' || !dialog.contains(document.activeElement)) return;

      const focusableElements = [...dialog.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )];
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      releaseModal();
      if (previousActiveElement.current?.isConnected) previousActiveElement.current.focus();
    };
  }, []);

  return createPortal(children, document.body);
}
