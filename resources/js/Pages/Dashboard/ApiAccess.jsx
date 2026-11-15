import { Button, Card, Field, Input, PageHeader } from '@/Components/ui';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { router, useForm } from '@inertiajs/react';
import { Check, Clipboard, Code2, KeyRound, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const examples = [
    ['Create issue', 'POST', '/issues', '202 Accepted'],
    ['List issues', 'GET', '/issues?status=open&priority=high&category=Billing', '200 OK'],
    ['View issue + comments', 'GET', '/issues/{id}', '200 OK'],
    ['Update issue', 'PATCH', '/issues/{id}', '200 OK'],
    ['Delete issue', 'DELETE', '/issues/{id}', '204 No Content'],
    ['Add comment', 'POST', '/issues/{id}/comments', '201 Created'],
];

function CodeBlock({ children }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };
    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35">
            <button onClick={copy} className="absolute right-3 top-3 rounded-lg bg-white/10 p-2 text-slate-300 hover:bg-white/15 hover:text-white" title="Copy">
                {copied ? <Check className="h-4 w-4 text-[#e8cd78]" /> : <Clipboard className="h-4 w-4" />}
            </button>
            <pre className="overflow-x-auto p-5 pr-14 text-xs leading-6 text-slate-300"><code>{children}</code></pre>
        </div>
    );
}

export default function ApiAccess({ tokens, newToken, baseUrl }) {
    const form = useForm({ name: '' });
    const token = newToken || 'YOUR_ACCESS_TOKEN';
    const curl = `curl -X POST "${baseUrl}/issues" \\
  -H "Accept: application/json" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{
    "customer_name": "Acme Ltd",
    "title": "Customer cannot access invoices",
    "description": "The billing page returns an authorization error.",
    "priority": "high",
    "category": "Billing"
  }'`;

    const create = (event) => {
        event.preventDefault();
        form.post(route('dashboard.api.tokens.store'), { preserveScroll: true, onSuccess: () => form.reset() });
    };

    return (
        <DashboardLayout title="API">
            <PageHeader icon={Code2} title="Issue API" description="Create issues, track status, and add comments from any authenticated client." />

            <div className="grid gap-6 xl:grid-cols-5">
                <div className="space-y-6 xl:col-span-3">
                    {newToken && (
                        <Card className="border-[#cda749]/30 p-6">
                            <p className="text-sm font-semibold text-[#e8cd78]">New access token</p>
                            <p className="mt-1 text-xs text-slate-400">Copy this token now. It will not be shown again.</p>
                            <div className="mt-4"><CodeBlock>{newToken}</CodeBlock></div>
                        </Card>
                    )}

                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-white">Quick start</h2>
                        <p className="mt-1 text-sm text-slate-400">Use a bearer token, or call the same endpoints from an authenticated browser session.</p>
                        <p className="mt-3 text-xs leading-5 text-slate-500">Categories: Account &amp; Access Management, Billing, Technical Issues, Service Requests, and Feature Requests &amp; Feedback.</p>
                        <div className="mt-5"><CodeBlock>{curl}</CodeBlock></div>
                    </Card>

                    <Card className="overflow-hidden">
                        <div className="border-b border-white/10 px-6 py-5"><h2 className="font-semibold text-white">Endpoints</h2></div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <tbody className="divide-y divide-white/10">
                                    {examples.map(([action, method, path, response]) => (
                                        <tr key={`${method}-${path}`} className="hover:bg-white/[0.025]">
                                            <td className="px-6 py-4 text-slate-300">{action}</td>
                                            <td className="px-3 py-4"><span className="rounded-md bg-[#cda749]/10 px-2 py-1 text-xs font-bold text-[#e8cd78]">{method}</span></td>
                                            <td className="whitespace-nowrap px-3 py-4 font-mono text-xs text-slate-300">{path}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-400">{response}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-white">Responses</h2>
                        <div className="mt-4 space-y-4">
                            <CodeBlock>{`// 202 Accepted — issue queued for summary generation
{
  "data": {
    "id": 42,
    "status": "open",
    "summary_status": "pending",
    "needs_attention": true
  }
}`}</CodeBlock>
                            <CodeBlock>{`// 422 Unprocessable Content — validation error
{
  "message": "The title field is required.",
  "errors": {
    "title": ["The title field is required."]
  }
}`}</CodeBlock>
                            <CodeBlock>{`// Other errors
400 Bad Request       Malformed request
401 Unauthorized      Missing or invalid authentication
404 Not Found         Issue or token does not exist
422 Unprocessable     Validation failed
500 Server Error      Unexpected server failure`}</CodeBlock>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6 xl:col-span-2">
                    <Card className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-[#0b1f33]"><KeyRound className="h-5 w-5" /></div>
                            <div><h2 className="font-semibold text-white">Access tokens</h2><p className="text-xs text-slate-400">Tokens grant read and write API access.</p></div>
                        </div>
                        <form onSubmit={create} className="mt-5 space-y-3">
                            <Field label="Token name" error={form.errors.name}>
                                <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Helpdesk integration" />
                            </Field>
                            <Button type="submit" className="w-full" disabled={form.processing}><Plus className="h-4 w-4" /> Create token</Button>
                        </form>
                        <div className="mt-6 space-y-2 border-t border-white/10 pt-5">
                            {tokens.length === 0 && <p className="text-sm text-slate-400">No access tokens yet.</p>}
                            {tokens.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/15 p-3">
                                    <KeyRound className="h-4 w-4 shrink-0 text-[#cda749]" />
                                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-white">{item.name}</p><p className="text-xs text-slate-500">Created {new Date(item.created_at).toLocaleDateString()}</p></div>
                                    <button onClick={() => router.delete(route('dashboard.api.tokens.destroy', item.id), { preserveScroll: true })} className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400" title="Revoke token"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
