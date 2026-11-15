import { Badge, Button, Card, Field, Input, Modal, PageHeader, Select, Textarea } from '@/Components/ui';
import DashboardLayout from '@/Layouts/DashboardLayout';
import axios from 'axios';
import { AlertCircle, ChevronLeft, ChevronRight, LifeBuoy, Loader2, Pencil, Plus, RefreshCw, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const blankIssue = { customer_name: '', title: '', description: '', priority: 'medium', category: '', status: 'open' };
const labels = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved' };

function apiError(error) {
    if (error.response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (error.response?.status === 404) return 'This issue no longer exists. Refresh the list and try again.';
    if (error.response?.status === 422) return error.response.data?.message || 'Please correct the highlighted fields.';
    if (error.response?.status >= 500) return 'The server could not complete the request. Please try again.';
    if (!error.response) return 'Unable to reach the server. Check your connection and try again.';
    return error.response.data?.message || 'Something went wrong. Please try again.';
}

function formatDate(value) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

function shorten(value, maxLength) {
    return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

export default function Support({ categories, priorities, statuses }) {
    const [issues, setIssues] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [filters, setFilters] = useState({ status: '', priority: '', category: '' });
    const [page, setPage] = useState(1);
    const [reload, setReload] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(blankIssue);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const params = useMemo(() => Object.fromEntries(
        Object.entries({ ...filters, page, per_page: 10 }).filter(([, value]) => value !== ''),
    ), [filters, page]);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        axios.get('/api/issues', { params, signal: controller.signal, headers: { Accept: 'application/json' } })
            .then(({ data }) => {
                setIssues(data.data);
                setMeta(data.meta);
            })
            .catch((requestError) => {
                if (requestError.code !== 'ERR_CANCELED') setError(apiError(requestError));
            })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, [params, reload]);

    const updateFilter = (key, value) => {
        setFilters((current) => ({ ...current, [key]: value }));
        setPage(1);
    };

    const openCreate = () => {
        setForm({ ...blankIssue, category: categories[0] });
        setErrors({});
        setEditing('new');
    };


    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        setErrors({});
        setError('');
        try {
            const { status, ...payload } = form;
            await axios.post('/api/issues', payload, { headers: { Accept: 'application/json' } });
            setEditing(null);
            setPage(1);
            setReload((value) => value + 1);
        } catch (requestError) {
            setError(apiError(requestError));
            setErrors(requestError.response?.data?.errors || {});
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout title="Support">
            <PageHeader
                icon={LifeBuoy}
                title="Support issues"
                description="Submit, filter, and manage customer and operational support requests."
                actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add issue</Button>}
            />

            {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span className="flex-1">{error}</span>
                    <button onClick={() => setError('')}><X className="h-4 w-4" /></button>
                </div>
            )}

            <Card className="mb-6 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                    <label className="relative">
                        <span className="sr-only">Filter by status</span>
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Select className="pl-10" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
                            <option value="">All statuses</option>
                            {statuses.map((status) => <option key={status} value={status}>{labels[status]}</option>)}
                        </Select>
                    </label>
                    <Select value={filters.priority} onChange={(event) => updateFilter('priority', event.target.value)}>
                        <option value="">All priorities</option>
                        {priorities.map((priority) => <option key={priority} value={priority}>{priority[0].toUpperCase() + priority.slice(1)}</option>)}
                    </Select>
                    <Select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
                        <option value="">All categories</option>
                        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </Select>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <div><h2 className="font-semibold text-white">Issues</h2><p className="text-xs text-slate-400">{meta.total || 0} total</p></div>
                    <button onClick={() => setReload((value) => value + 1)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" title="Refresh"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
                </div>
                <div className="dark-scrollbar overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-black/15 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <tr><th className="px-6 py-3">Customer</th><th className="px-4 py-3">Issue</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Start date</th><th className="px-4 py-3">Last updated</th><th className="px-6 py-3" /></tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {loading && issues.length === 0 && <tr><td colSpan="8" className="px-6 py-16 text-center text-slate-400"><Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-[#cda749]" />Loading issues…</td></tr>}
                            {!loading && issues.length === 0 && <tr><td colSpan="8" className="px-6 py-16 text-center text-slate-400">No issues match these filters.</td></tr>}
                            {issues.map((issue) => (
                                <tr key={issue.id} className={`transition hover:bg-white/[0.035] ${issue.needs_attention ? 'bg-[#cda749]/[0.035]' : ''}`}>
                                    <td className="max-w-xs px-6 py-4"><div className="flex items-center gap-3">{issue.needs_attention && <span className="h-2 w-2 shrink-0 rounded-full bg-[#e8cd78] shadow-[0_0_12px_#cda749]" />}<div className="min-w-0"><p className="truncate font-medium text-white">{issue.customer_name}</p><p className="truncate text-xs text-slate-500">#{issue.id}</p></div></div></td>
                                    <td className="px-4 py-4"><p className="whitespace-nowrap text-slate-300" title={issue.title}>{shorten(issue.title, 28)}</p></td>
                                    <td className="whitespace-nowrap px-4 py-4 text-slate-300" title={issue.category}>{shorten(issue.category, 16)}</td>
                                    <td className="px-4 py-4"><Badge color={issue.priority}>{issue.priority}</Badge></td>
                                    <td className="whitespace-nowrap px-4 py-4 text-slate-300">{labels[issue.status]}</td>
                                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-400">{formatDate(issue.created_at)}</td>
                                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-400">{formatDate(issue.updated_at)}</td>
                                    <td className="px-6 py-4 text-right"><Button size="sm" variant="secondary" href={route('dashboard.support.show', issue.id)}><Pencil className="h-3.5 w-3.5" /> Update</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {meta.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 text-sm text-slate-400">
                        <span>Page {meta.current_page} of {meta.last_page}</span>
                        <div className="flex gap-2"><Button size="icon" variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="h-4 w-4" /></Button><Button size="icon" variant="secondary" disabled={page >= meta.last_page || loading} onClick={() => setPage((value) => value + 1)}><ChevronRight className="h-4 w-4" /></Button></div>
                    </div>
                )}
            </Card>

            <Modal open={editing === 'new'} onClose={() => !saving && setEditing(null)} title="Add issue" size="lg">
                <form onSubmit={save} className="space-y-4">
                    <Field label="Customer name" error={errors.customer_name?.[0]}><Input autoFocus value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} /></Field>
                    <Field label="Title" error={errors.title?.[0]}><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
                    <Field label="Description" error={errors.description?.[0]}><Textarea rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Priority" error={errors.priority?.[0]}><Select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>{priorities.map((priority) => <option key={priority} value={priority}>{priority[0].toUpperCase() + priority.slice(1)}</option>)}</Select></Field>
                        <Field label="Category" error={errors.category?.[0]}><Select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</Select></Field>
                    </div>
                    <div className="flex justify-end gap-2 pt-2"><Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Create issue</Button></div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
