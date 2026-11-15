import { Badge, Button, Card } from '@/Components/ui';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Link } from '@inertiajs/react';
import { ArrowRight, MessageSquareText, Pencil, Ticket } from 'lucide-react';

const statusLabels = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved' };

function date(value) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function Index({ issues, comments }) {
    return (
        <DashboardLayout title="Dashboard">
            <div className="mb-8 pt-6 sm:pt-10">
                <div><p className="text-sm font-medium text-[#e8cd78]">Support overview</p><h1 className="mt-1 text-3xl font-bold text-white">Latest activity</h1><p className="mt-1 text-sm text-slate-400">Recent tickets and team conversations at a glance.</p></div>
            </div>

            <div className="grid gap-6 xl:grid-cols-5">
                <Card className="overflow-hidden xl:col-span-3">
                    <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                        <div className="flex items-center gap-3"><div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-[#0b1f33]"><Ticket className="h-4 w-4" /></div><div><h2 className="font-semibold text-white">Latest support issues</h2><p className="text-xs text-slate-400">The 10 most recently created tickets</p></div></div>
                        <Link href={route('dashboard.support.index')} className="inline-flex items-center gap-1 text-sm font-medium text-[#e8cd78] hover:text-white">View all <ArrowRight className="h-4 w-4" /></Link>
                    </div>
                    {issues.length === 0 ? <p className="px-6 py-14 text-center text-sm text-slate-400">No support issues yet.</p> : (
                        <div className="divide-y divide-white/10">
                            {issues.map((issue) => (
                                <div key={issue.id} className="flex flex-col gap-4 px-6 py-4 transition hover:bg-white/[0.025] sm:flex-row sm:items-center">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">{issue.needs_attention && <span className="h-2 w-2 shrink-0 rounded-full bg-[#e8cd78] shadow-[0_0_10px_#cda749]" />}<p className="truncate text-sm font-semibold text-white">{issue.customer_name}</p><span className="text-xs text-slate-600">#{issue.id}</span></div>
                                        <p className="mt-1 truncate text-sm text-slate-300">{issue.title}</p>
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>{issue.category}</span><span>•</span><span>{date(issue.created_at)}</span></div>
                                    </div>
                                    <div className="flex items-center gap-2"><Badge color={issue.priority}>{issue.priority}</Badge><span className="min-w-20 text-xs text-slate-400">{statusLabels[issue.status]}</span><Button size="sm" variant="secondary" href={route('dashboard.support.show', issue.id)}><Pencil className="h-3.5 w-3.5" /> Update</Button></div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card className="overflow-hidden xl:col-span-2">
                    <div className="border-b border-white/10 px-6 py-5"><div className="flex items-center gap-3"><div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-[#0b1f33]"><MessageSquareText className="h-4 w-4" /></div><div><h2 className="font-semibold text-white">Recent comments</h2><p className="text-xs text-slate-400">Latest team responses</p></div></div></div>
                    {comments.length === 0 ? <p className="px-6 py-14 text-center text-sm text-slate-400">No comments yet.</p> : (
                        <div className="divide-y divide-white/10">
                            {comments.map((comment) => (
                                <div key={comment.id} className="px-6 py-4 transition hover:bg-white/[0.025]">
                                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{comment.issue.customer_name}</p><p className="truncate text-xs text-[#e8cd78]">{comment.issue.title}</p></div><span className="shrink-0 text-[11px] text-slate-500">{date(comment.created_at)}</span></div>
                                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{comment.body}</p>
                                    <div className="mt-3 flex items-center justify-between"><p className="text-xs text-slate-500">By <span className="font-medium text-slate-300">{comment.author_name}</span></p><Link href={route('dashboard.support.show', comment.issue_id)} className="text-xs font-medium text-[#e8cd78] hover:text-white">Update ticket</Link></div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
