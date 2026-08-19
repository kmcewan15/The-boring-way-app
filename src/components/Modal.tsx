import { useEffect, type ReactNode } from 'react';
import { IconChevronLeft } from './Icons';

/** Detail sheet that covers the main stage, leaving the sidebar in place. */
export default function Modal({
  children,
  onClose,
  label,
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={label}>
      <div className="modal__cap">
        <button type="button" className="modal__back" onClick={onClose}>
          <IconChevronLeft size={26} />
          Back
        </button>
        <span className="modal__title">{label}</span>
      </div>
      <div className="modal__scroll">
        <div className="wrap">{children}</div>
      </div>
    </div>
  );
}
