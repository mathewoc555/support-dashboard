import { Button, Field, Input } from '@/Components/ui';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Login({ status }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <div className="navy-gradient relative flex min-h-screen items-center justify-center overflow-hidden px-4">
            <Head title="Log in" />

            {/* Gradient backdrop */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#cda749]/20 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-[#1f557d]/45 blur-[120px]" />
            <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-[#cda749]/10 blur-[100px]" />

            <div className="relative w-full max-w-md">
                <div className="mb-8 flex flex-col items-center text-center">
                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl brand-gradient shadow-xl shadow-[#cda749]/30">
                        <Sparkles className="h-7 w-7 text-[#0b1f33]" />
                    </span>
                    <h1 className="text-2xl font-bold text-white">Support Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-300">Sign in to continue</p>
                </div>

                <form
                    onSubmit={submit}
                    className="glass-panel relative space-y-5 overflow-hidden rounded-3xl border border-[#cda749]/15 p-8 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#e8cd78]/70 before:to-transparent"
                >
                    {status && (
                        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{status}</div>
                    )}

                    <Field label="Email" error={errors.email}>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#cda749]" />
                            <Input
                                type="email"
                                autoComplete="username"
                                autoFocus
                                className="pl-10"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                    </Field>

                    <Field label="Password" error={errors.password}>
                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#cda749]" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                className="pl-10 pr-11"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((visible) => !visible)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-[#e8cd78] focus:outline-none focus:ring-2 focus:ring-[#cda749]/50"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showPassword}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </Field>

                    <label className="flex items-center gap-2 text-sm text-slate-300">
                        <input
                            type="checkbox"
                            className="rounded border-slate-300 text-[#cda749] focus:ring-[#cda749]"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        Remember me
                    </label>

                    <Button as="button" type="submit" className="w-full py-3" disabled={processing}>
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Sign in
                    </Button>
                </form>
            </div>
        </div>
    );
}
