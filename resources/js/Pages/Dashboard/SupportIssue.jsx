import { Badge, Button, Card, Field, Input, PageHeader, Select, Textarea } from '@/Components/ui';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, MessageSquare, MessageSquarePlus, RefreshCw, Save, Ticket, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const labels = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved' };

function apiError(error) {
    if (error.response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (error.response?.status === 404) return 'This issue no longer exists.';
    if (error.response?.status === 422) return error.response.data?.message || 'Please correct the highlighted fields.';
    if (error.response?.status >= 500) return 'The server could not complete the request. Please try again.';
    if (!error.response) return 'Unable to reach the server. Check your connection and try again.';
    return error.response.data?.message || 'Something went wrong. Please try again.';
}

function dateTime(value) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function SupportIssue({ issueId, categories, priorities, statuses }) {
    const { auth } = usePage().props;
    const [issue, setIssue] = useState(null);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [comment, setComment] = useState({ author_name: auth.user.name, body: '' });
    const [commentErrors, setCommentErrors] = useState({});
    const [commenting, setCommenting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        axios.get(`/api/issues/${issueId}`, { headers: { Accept: 'application/json' } })
            .then(({ data }) => {
                setIssue(data.data);
                setForm({
                    customer_name: data.data.customer_name,
                    title: data.data.title,
                    description: data.data.description,
                    priority: data.data.priority,
                    category: data.data.category,
                    status: data.data.status,
                });
            })
            .catch((requestError) => setError(apiError(requestError)))
            .finally(() => setLoading(false));
    }, [issueId]);

    const update = async (event) => {
        event.preventDefault();
        setSaving(true);
        setErrors({});
        setError('');
        setSuccess('');
        try {
            const { data } = await axios.patch(`/api/issues/${issueId}`, form, { headers: { Accept: 'application/json' } });
            setIssue(data.data);
            setSuccess('Issue updated successfully.');
        } catch (requestError) {
            setError(apiError(requestError));
            setErrors(requestError.response?.data?.errors || {});
        } finally {
            setSaving(false);
        }
    };

    const addComment = async (event) => {
        event.preventDefault();
        setCommenting(true);
        setCommentErrors({});
        setError('');
        setSuccess('');
        try {
            const { data } = await axios.post(`/api/issues/${issueId}/comments`, comment, { headers: { Accept: 'application/json' } });
            setIssue((current) => ({ ...current, comments: [...current.comments, data.data] }));
            setComment({ author_name: auth.user.name, body: '' });
            setSuccess('Comment added successfully.');
        } catch (requestError) {
            setError(apiError(requestError));
            setCommentErrors(requestError.response?.data?.errors || {});
        } finally {
            setCommenting(false);
        }
    };

    const refreshIssue = async () => {
        setRefreshing(true);
        setError('');
        setSuccess('');
        try {
            const { data } = await axios.get(`/api/issues/${issueId}`, { headers: { Accept: 'application/json' } });
            setIssue(data.data);
            setSuccess(data.data.summary_status === 'pending' ? 'Guidance is still being generated.' : 'Generated guidance refreshed.');
        } catch (requestError) {
            setError(apiError(requestError));
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <DashboardLayout title="Support issue">
            <PageHeader
                icon={Ticket}
                title={issue ? `Issue #${issue.id}` : 'Support issue'}
                description={issue ? `${issue.customer_name} · ${issue.title}` : 'Loading issue details…'}
                actions={<Button variant="secondary" href={route('dashboard.support.index')}><ArrowLeft className="h-4 w-4" /> Back to issues</Button>}
            />

            {error && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span className="flex-1">{error}</span><button onClick={() => setError('')}><X className="h-4 w-4" /></button></div>}
            {success && <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"><CheckCircle2 className="h-4 w-4" />{success}</div>}

            {loading && <Card className="flex min-h-72 items-center justify-center"><div className="text-center text-slate-400"><Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-[#cda749]" />Loading issue…</div></Card>}

            {!loading && form && issue && (
                <div className="grid gap-6 xl:grid-cols-5">
                    <div className="space-y-6 xl:col-span-3">
                        <Card className="p-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5"><div><h2 className="text-lg font-semibold text-white">Issue details</h2><p className="mt-1 text-xs text-slate-400">Created {dateTime(issue.created_at)} · Updated {dateTime(issue.updated_at)}</p></div><div className="flex gap-2"><Badge color={issue.priority}>{issue.priority}</Badge><Badge color="slate">{labels[issue.status]}</Badge></div></div>
                            <form onSubmit={update} className="space-y-4">
                                <Field label="Customer name" error={errors.customer_name?.[0]}><Input value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} /></Field>
                                <Field label="Title" error={errors.title?.[0]}><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
                                <Field label="Description" error={errors.description?.[0]}><Textarea rows="6" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <Field label="Priority" error={errors.priority?.[0]}><Select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>{priorities.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</Select></Field>
                                    <Field label="Category" error={errors.category?.[0]}><Select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</Select></Field>
                                    <Field label="Status" error={errors.status?.[0]}><Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{statuses.map((value) => <option key={value} value={value}>{labels[value]}</option>)}</Select></Field>
                                </div>
                                <div className="flex justify-end pt-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save changes</Button></div>
                            </form>
                        </Card>

                        <Card className="p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-white">Generated support guidance</h2>{issue.summary_status === 'pending' && <p className="mt-1 text-xs text-slate-400">Refresh after the queue worker has processed this issue.</p>}</div>{issue.summary_status === 'pending' && <Button size="sm" variant="secondary" onClick={refreshIssue} disabled={refreshing}>{refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Refresh</Button>}</div>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#e8cd78]">Summary · {issue.summary_status}</p><p className="mt-2 text-sm leading-6 text-slate-300">{issue.summary || 'Summary generation is pending.'}</p></div><div className="rounded-2xl border border-white/10 bg-black/15 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#e8cd78]">Suggested next action</p><p className="mt-2 text-sm leading-6 text-slate-300">{issue.suggested_next_action || 'A suggested action will appear when the summary is ready.'}</p></div></div>
                        </Card>
                    </div>

                    <div className="space-y-6 xl:col-span-2">
                        <Card className="p-6">
                            <div className="mb-5 flex items-center gap-3"><div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-[#0b1f33]"><MessageSquarePlus className="h-5 w-5" /></div><div><h2 className="font-semibold text-white">Add comment</h2><p className="text-xs text-slate-400">Leave an update for this ticket.</p></div></div>
                            <form onSubmit={addComment} className="space-y-4">
                                <div><p className="mb-1.5 text-sm font-medium text-slate-200">Author</p><div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"><span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-[#0b1f33]">{auth.user.name[0]?.toUpperCase()}</span><div><p className="text-sm font-medium text-white">{auth.user.name}</p><p className="text-xs text-slate-500">Signed-in user</p></div></div></div>
                                <Field label="Comment" error={commentErrors.body?.[0]}><Textarea rows="4" value={comment.body} onChange={(event) => setComment({ ...comment, body: event.target.value })} /></Field>
                                <Button type="submit" className="w-full" disabled={commenting}>{commenting && <Loader2 className="h-4 w-4 animate-spin" />}Add comment</Button>
                            </form>
                        </Card>

                        <Card className="overflow-hidden">
                            <div className="border-b border-white/10 px-6 py-5"><h2 className="font-semibold text-white">Comments</h2><p className="text-xs text-slate-400">{issue.comments.length} total</p></div>
                            {issue.comments.length === 0 ? <p className="px-6 py-12 text-center text-sm text-slate-400">No comments yet.</p> : <div className="max-h-[36rem] divide-y divide-white/10 overflow-y-auto">{issue.comments.map((item) => <div key={item.id} className="px-6 py-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="brand-gradient flex h-7 w-7 items-center justify-center rounded-full text-[#0b1f33]"><UserRound className="h-3.5 w-3.5" /></span><p className="text-sm font-semibold text-white">{item.author_name}</p></div><span className="text-[11px] text-slate-500">{dateTime(item.created_at)}</span></div><div className="mt-3 flex items-start gap-2.5"><MessageSquare className="mt-1 h-4 w-4 shrink-0 text-[#cda749]" /><p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{item.body}</p></div></div>)}</div>}
                        </Card>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
