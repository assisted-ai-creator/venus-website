"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* --------------------------------------------------------------- toasts --- */

interface Toast {
  id: number;
  tone: "ok" | "error";
  message: string;
}

const ToastContext = createContext<{
  notify: (message: string, tone?: "ok" | "error") => void;
}>({ notify: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(1);

  const notify = useCallback((message: string, tone: "ok" | "error" = "ok") => {
    const id = next.current++;
    setToasts((t) => [...t, { id, tone, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 7000 : 3500);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Announced politely so a save is confirmed to a screen reader too. */}
      <div className="adm-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast adm-toast-${t.tone}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* -------------------------------------------------------------- controls --- */

export function Button({
  children,
  variant = "default",
  size,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "danger";
  size?: "sm";
}) {
  const cls = [
    "adm-btn",
    variant === "primary" ? "adm-btn-primary" : "",
    variant === "danger" ? "adm-btn-danger" : "",
    size === "sm" ? "adm-btn-sm" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Field({
  label,
  help,
  children,
  className = "",
}: {
  label?: string;
  help?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label ? <span className="adm-label">{label}</span> : null}
      {children}
      {help ? <p className="adm-help">{help}</p> : null}
    </div>
  );
}

export function TextInput({
  label,
  help,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; help?: string }) {
  const id = useId();
  return (
    <div className={className}>
      {label ? (
        <label className="adm-label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input id={id} className="adm-input" {...rest} />
      {help ? <p className="adm-help">{help}</p> : null}
    </div>
  );
}

export function TextArea({
  label,
  help,
  className = "",
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; help?: string }) {
  const id = useId();
  return (
    <div className={className}>
      {label ? (
        <label className="adm-label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <textarea id={id} className="adm-textarea" {...rest} />
      {help ? <p className="adm-help">{help}</p> : null}
    </div>
  );
}

export function Select({
  label,
  help,
  options,
  className = "",
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  help?: string;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <div className={className}>
      {label ? (
        <label className="adm-label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <select id={id} className="adm-select" {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {help ? <p className="adm-help">{help}</p> : null}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  help,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  help?: string;
}) {
  return (
    <div>
      <label className="adm-switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="adm-switch-track" aria-hidden="true" />
        <span className="adm-label !mb-0">{label}</span>
      </label>
      {help ? <p className="adm-help">{help}</p> : null}
    </div>
  );
}

/* ----------------------------------------------------------------- cards --- */

export function Card({
  title,
  actions,
  children,
  className = "",
  bodyClassName = "p-4",
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`adm-card ${className}`}>
      {title || actions ? (
        <header className="adm-card-head">
          <h2 className="chart-label text-saffron">{title}</h2>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="border-2 border-dashed border-navy-700 px-4 py-8 text-center text-sm text-navy-300">
      {children}
    </p>
  );
}

export function Note({ tone = "warn", children }: { tone?: "error" | "ok" | "warn"; children: ReactNode }) {
  return <p className={`adm-note adm-note-${tone}`}>{children}</p>;
}

/* ---------------------------------------------------------------- dialog --- */

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  size = "lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "lg" | "sm";
}) {
  const panel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panel.current) return;

      // Focus stays inside the dialog while it is open.
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("button, input, [tabindex]")?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="adm-dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`adm-dialog ${size === "sm" ? "adm-dialog-sm" : ""}`}
      >
        <header className="adm-card-head flex-none">
          <h2 className="chart-label text-saffron">{title}</h2>
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        {footer ? (
          <footer className="flex flex-none flex-wrap justify-end gap-2 border-t-2 border-navy-700 p-3">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

/**
 * A destructive action that asks first. Two clicks rather than a browser
 * confirm(), so the wording can name what is about to be deleted.
 */
export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = "Really delete?",
  size,
}: {
  onConfirm: () => void;
  children: ReactNode;
  confirmLabel?: string;
  size?: "sm";
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <Button
      variant="danger"
      size={size}
      onClick={() => {
        if (armed) {
          onConfirm();
          setArmed(false);
        } else {
          setArmed(true);
        }
      }}
    >
      {armed ? confirmLabel : children}
    </Button>
  );
}

/* -------------------------------------------------------------- sortable --- */

/**
 * A re-orderable list.
 *
 * Native drag-and-drop for a mouse, and Move up / Move down buttons that do
 * the same job from the keyboard — the second is not a fallback, it is how
 * this is operated without a pointer.
 */
export function Sortable<T>({
  items,
  getKey,
  onReorder,
  renderItem,
  className = "space-y-2",
}: {
  items: T[];
  getKey: (item: T) => string;
  onReorder: (nextOrder: string[]) => void;
  renderItem: (item: T, controls: { index: number; moveUp: () => void; moveDown: () => void; dragHandle: React.HTMLAttributes<HTMLElement> }) => ReactNode;
  className?: string;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const keys = items.map(getKey);
    const [pulled] = keys.splice(from, 1);
    keys.splice(to, 0, pulled);
    onReorder(keys);
  };

  return (
    <ul className={className}>
      {items.map((item, index) => {
        const key = getKey(item);
        return (
          <li
            key={key}
            draggable={dragging === key}
            data-dragging={dragging === key}
            data-dropbefore={over === key && dragging !== key}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(key);
            }}
            onDragLeave={() => setOver((v) => (v === key ? null : v))}
            onDrop={(e) => {
              e.preventDefault();
              setOver(null);
              if (!dragging || dragging === key) return;
              move(items.findIndex((i) => getKey(i) === dragging), index);
              setDragging(null);
            }}
            onDragEnd={() => {
              setDragging(null);
              setOver(null);
            }}
          >
            {renderItem(item, {
              index,
              moveUp: () => move(index, index - 1),
              moveDown: () => move(index, index + 1),
              dragHandle: {
                onPointerDown: () => setDragging(key),
                onPointerUp: () => setDragging(null),
                title: "Drag to reorder",
              },
            })}
          </li>
        );
      })}
    </ul>
  );
}

/** Move up / move down, the keyboard path through a Sortable. */
export function MoveButtons({
  index,
  total,
  moveUp,
  moveDown,
  label,
}: {
  index: number;
  total: number;
  moveUp: () => void;
  moveDown: () => void;
  label: string;
}) {
  return (
    <span className="flex flex-none gap-1">
      <Button size="sm" onClick={moveUp} disabled={index === 0} aria-label={`Move ${label} up`}>
        ↑
      </Button>
      <Button size="sm" onClick={moveDown} disabled={index === total - 1} aria-label={`Move ${label} down`}>
        ↓
      </Button>
    </span>
  );
}
