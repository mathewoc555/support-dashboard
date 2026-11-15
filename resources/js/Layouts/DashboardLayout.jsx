import { cx } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Code2,
    FlaskConical,
    LayoutDashboard,
    LogOut,
    Menu,
    Sparkles,
    LifeBuoy,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const nav = [
    {
        label: 'Overview',
        items: [
            { name: 'Dashboard', route: 'dashboard', match: 'dashboard', icon: LayoutDashboard },
            { name: 'Support Issue', route: 'dashboard.support.index', match: 'dashboard.support.*', icon: LifeBuoy },
        ],
    },
    {
        label: 'Admin',
        items: [
            { name: 'Users', route: 'dashboard.users.index', match: 'dashboard.users.*', icon: Users },
            { name: 'API', route: 'dashboard.api.index', match: 'dashboard.api.index', icon: Code2 },
            { name: 'API Tests', route: 'dashboard.api.tests', match: 'dashboard.api.tests', icon: FlaskConical },
        ],
    },
];

function Sidebar({ onNavigate }) {
    const { auth } = usePage().props;
    return (
        <div className="navy-gradient flex h-full flex-col text-slate-300">
            <div className="relative overflow-hidden px-6 py-6">
                <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#cda749]/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-[#2b648d]/30 blur-3xl" />
                <Link href={route('dashboard')} className="relative flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient shadow-lg shadow-[#cda749]/25">
                        <Sparkles className="h-5 w-5 text-[#0b1f33]" />
                    </span>
                    <span>
                        <span className="block text-sm font-bold text-white">Support Dashboard</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-6">
                {nav.map((group) => (
                    <div key={group.label}>
                        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            {group.label}
                        </p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const active = route().current(item.match);
                                return (
                                    <Link
                                        key={item.name}
                                        href={route(item.route)}
                                        onClick={onNavigate}
                                        className={cx(
                                            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                                            active
                                                ? 'brand-gradient text-[#0b1f33] shadow-lg shadow-black/25'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white',
                                        )}
                                    >
                                        <item.icon
                                            className={cx('h-[18px] w-[18px]', active ? 'text-[#0b1f33]' : 'text-slate-500 group-hover:text-[#e4c66f]')}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                    <span className="brand-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#0b1f33]">
                        {auth.user?.name?.[0]?.toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{auth.user?.name}</p>
                        <p className="truncate text-xs text-slate-400">{auth.user?.email}</p>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        title="Log out"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                        <LogOut className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Flash() {
    const { flash } = usePage().props;
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        if (flash?.success) setMsg({ type: 'success', text: flash.success });
        else if (flash?.error) setMsg({ type: 'error', text: flash.error });
    }, [flash]);

    useEffect(() => {
        if (!msg) return;
        const t = setTimeout(() => setMsg(null), 3500);
        return () => clearTimeout(t);
    }, [msg]);

    if (!msg) return null;
    const ok = msg.type === 'success';
    return (
        <div className="fixed bottom-6 right-6 z-[60]">
            <div
                className={cx(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-2xl',
                    ok ? 'brand-gradient !text-[#0b1f33] shadow-[#cda749]/30' : 'bg-rose-600 shadow-rose-500/30',
                )}
            >
                {ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                {msg.text}
                <button onClick={() => setMsg(null)} className="ml-2 rounded-md p-0.5 hover:bg-white/20">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default function DashboardLayout({ title, children, fullWidth = false }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="dashboard-gradient min-h-screen">
            <Head title={title} />

            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
                <Sidebar />
            </aside>

            {/* Mobile sidebar */}
            {open && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-[#0b1f33]/75 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-72 shadow-2xl">
                        <Sidebar onNavigate={() => setOpen(false)} />
                    </aside>
                </div>
            )}

            <div className="lg:pl-72">
                <header className="glass-panel sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-white/10 bg-[#0b1f33]/70 px-4 backdrop-blur-2xl sm:px-8">
                    <button
                        onClick={() => setOpen(true)}
                        className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <p className="text-sm font-semibold text-white">{title}</p>
                </header>

                <main className={cx('px-4 py-8 sm:px-8', fullWidth ? 'w-full' : 'mx-auto max-w-7xl')}>{children}</main>
            </div>

            <Flash />
        </div>
    );
}
