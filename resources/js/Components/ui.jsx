import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { AlertTriangle, X } from 'lucide-react';
import { forwardRef } from 'react';

export const cx = (...c) => c.filter(Boolean).join(' ');

/* ───────── Buttons ───────── */

const variants = {
    primary:
        'brand-gradient text-[#0b1f33] shadow-lg shadow-[#cda749]/25 hover:shadow-[#cda749]/45 hover:brightness-105',
    secondary: 'bg-white/10 text-white ring-1 ring-white/15 backdrop-blur hover:bg-white/15',
    ghost: 'text-slate-300 hover:bg-white/10 hover:text-white',
    danger: 'bg-rose-600 text-white shadow-lg shadow-rose-500/25 hover:bg-rose-500',
    soft: 'bg-[#cda749]/10 text-[#8a681f] hover:bg-[#cda749]/20',
};

export function Button({ as, href, variant = 'primary', size = 'md', className, children, ...props }) {
    const classes = cx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'icon' ? 'h-9 w-9 text-sm' : 'px-4 py-2.5 text-sm',
        variants[variant],
        className,
    );
    if (href) {
        return (
            <Link href={href} className={classes} {...props}>
                {children}
            </Link>
        );
    }
    const Comp = as || 'button';
    return (
        <Comp type={Comp === 'button' ? 'button' : undefined} className={classes} {...props}>
            {children}
        </Comp>
    );
}

/* ───────── Form fields ───────── */

export function Field({ label, error, hint, children, className }) {
    return (
        <label className={cx('block', className)}>
            {label && <span className="mb-1.5 block text-sm font-medium text-slate-200">{label}</span>}
            {children}
            {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
            {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
        </label>
    );
}

export const Input = forwardRef(function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cx('input', className)} {...props} />;
});

export function Textarea({ className, ...props }) {
    return <textarea className={cx('input', className)} {...props} />;
}

export function Select({ className, children, ...props }) {
    return (
        <select className={cx('input pr-8 [color-scheme:dark]', className)} {...props}>
            {children}
        </select>
    );
}

export function Toggle({ checked, onChange, label }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className="inline-flex items-center gap-3 text-sm font-medium text-slate-200"
        >
            <span
                className={cx(
                    'relative inline-flex h-6 w-11 rounded-full transition',
                    checked ? 'brand-gradient' : 'bg-slate-200',
                )}
            >
                <span
                    className={cx(
                        'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                        checked ? 'left-[22px]' : 'left-0.5',
                    )}
                />
            </span>
            {label}
        </button>
    );
}

/* ───────── Layout bits ───────── */

export function Card({ className, children, ...props }) {
    return (
        <div className={cx('card', className)} {...props}>
            {children}
        </div>
    );
}

export function Badge({ color = 'violet', children, className }) {
    const colors = {
        violet: 'bg-[#cda749]/10 text-[#80601d] ring-[#cda749]/30',
        blue: 'bg-blue-50 text-blue-700 ring-blue-200',
        slate: 'bg-slate-100 text-slate-600 ring-slate-200',
        green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        low: 'bg-blue-500/10 text-blue-300 ring-blue-400/30',
        medium: 'bg-orange-500/10 text-orange-300 ring-orange-400/30',
        high: 'bg-red-500/10 text-red-300 ring-red-400/30',
    };
    return (
        <span
            className={cx(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                colors[color],
                className,
            )}
        >
            {children}
        </span>
    );
}

export function PageHeader({ title, description, icon: Icon, actions }) {
    return (
        <div className="relative mb-8 overflow-hidden rounded-3xl navy-gradient p-6 text-white shadow-xl shadow-[#0b1f33]/20 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#cda749]/25 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#cda749]/15 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    {Icon && (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl brand-gradient text-[#0b1f33] shadow-lg shadow-black/20">
                            <Icon className="h-6 w-6" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
                        {description && <p className="mt-1 text-sm text-white/80">{description}</p>}
                    </div>
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
        </div>
    );
}

export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            {Icon && (
                <div className="brand-gradient mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-[#0b1f33]">
                    <Icon className="h-7 w-7" />
                </div>
            )}
            <h3 className="text-base font-semibold text-white">{title}</h3>
            {description && <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

export function Pagination({ links }) {
    if (!links || links.length <= 3) return null;
    return (
        <nav className="flex flex-wrap items-center justify-center gap-1 pt-6">
            {links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url || '#'}
                    preserveScroll
                    preserveState
                    disabled={!link.url}
                    className={cx(
                        'min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium transition',
                        link.active
                            ? 'brand-gradient text-white shadow'
                            : link.url
                              ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                              : 'pointer-events-none text-slate-300',
                    )}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </nav>
    );
}

/* ───────── Modals ───────── */

export function Modal({ open, onClose, title, size = 'lg', children, footer }) {
    const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl', '2xl': 'max-w-6xl' };
    return (
        <Transition show={open} appear>
            <Dialog onClose={onClose} className="relative z-50">
                <TransitionChild
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-[#0b1f33]/70 backdrop-blur-sm" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
                        <TransitionChild
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 translate-y-4 scale-95"
                            enterTo="opacity-100 translate-y-0 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel
                                className={cx('glass-panel w-full overflow-hidden rounded-3xl border border-[#cda749]/15 text-white shadow-2xl backdrop-blur-2xl', widths[size])}
                            >
                                {title && (
                                    <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                                        <h2 className="text-lg font-semibold text-white">{title}</h2>
                                        <button
                                            onClick={onClose}
                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                                <div className="px-6 py-5">{children}</div>
                                {footer && (
                                    <div className="flex justify-end gap-2 border-t border-white/10 bg-black/10 px-6 py-4">
                                        {footer}
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export function ConfirmDelete({ open, onClose, onConfirm, title = 'Delete item?', message, processing }) {
    return (
        <Modal open={open} onClose={onClose} size="sm">
            <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                        {message || 'This action cannot be undone.'}
                    </p>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm} disabled={processing}>
                    Delete
                </Button>
            </div>
        </Modal>
    );
}
