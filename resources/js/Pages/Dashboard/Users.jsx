import { Badge, Button, Card, ConfirmDelete, Field, Input, Modal, PageHeader } from '@/Components/ui';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';

const empty = { name: '', email: '', phone: '', password: '' };

export default function Users({ users }) {
    const { auth } = usePage().props;
    const [editing, setEditing] = useState(null); // null | 'new' | user
    const [deleting, setDeleting] = useState(null);
    const form = useForm(empty);

    const open = (user) => {
        form.clearErrors();
        form.setData(user === 'new' ? empty : { name: user.name, email: user.email, phone: user.phone || '', password: '' });
        setEditing(user);
    };
    const close = () => setEditing(null);

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: close };
        editing === 'new'
            ? form.post(route('dashboard.users.store'), opts)
            : form.put(route('dashboard.users.update', editing.id), opts);
    };

    const destroy = () =>
        router.delete(route('dashboard.users.destroy', deleting.id), {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });

    return (
        <DashboardLayout title="Users">
            <PageHeader
                icon={UsersIcon}
                title="Users"
                description="Administrators who can sign in to this dashboard."
                actions={
                    <Button variant="primary" onClick={() => open('new')}>
                        <Plus className="h-4 w-4" /> Add user
                    </Button>
                }
            />

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-black/10 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {users.map((u) => (
                                <tr key={u.id} className="transition hover:bg-[#cda749]/5">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-[#0b1f33]">
                                                {u.name[0]?.toUpperCase()}
                                            </span>
                                            <div>
                                                <p className="font-medium text-white">
                                                    {u.name} {u.id === auth.user.id && <span className="text-xs text-[#9a7627]">(you)</span>}
                                                </p>
                                                <p className="text-xs text-slate-400">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{u.phone || '—'}</td>
                                    <td className="px-6 py-4">
                                        <Badge>{u.role}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" onClick={() => open(u)} title="Edit">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {u.id !== auth.user.id && (
                                                <Button size="icon" variant="ghost" className="hover:!bg-rose-50 hover:!text-rose-600" onClick={() => setDeleting(u)} title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal open={!!editing} onClose={close} size="md" title={editing === 'new' ? 'Add user' : 'Edit user'}>
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Name" error={form.errors.name}>
                        <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} autoFocus />
                    </Field>
                    <Field label="Email" error={form.errors.email}>
                        <Input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                    </Field>
                    <Field label="Phone" error={form.errors.phone}>
                        <Input value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                    </Field>
                    <Field
                        label="Password"
                        error={form.errors.password}
                        hint={editing !== 'new' ? 'Leave blank to keep the current password.' : 'Minimum 8 characters.'}
                    >
                        <Input type="password" autoComplete="new-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                    </Field>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" onClick={close}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>Save user</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDelete
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={destroy}
                title={`Delete ${deleting?.name}?`}
                message="This user will no longer be able to sign in."
            />
        </DashboardLayout>
    );
}
