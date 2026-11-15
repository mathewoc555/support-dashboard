import { Button, Card, PageHeader } from '@/Components/ui';
import DashboardLayout from '@/Layouts/DashboardLayout';
import axios from 'axios';
import { AlertCircle, CheckCircle2, FlaskConical, Loader2, Play, Trash2 } from 'lucide-react';
import { useState } from 'react';

let nextMessageId = 1;
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export default function ApiTests() {
    const [messages, setMessages] = useState([]);
    const [running, setRunning] = useState(false);
    const [typing, setTyping] = useState(null);

    const add = (message) => setMessages((current) => [...current, { id: nextMessageId++, ...message }]);

    const request = async (method, endpoint, data, expected) => {
        add({ type: 'request', endpoint, method, message: `Testing ${method} ${endpoint}` });
        setTyping({ method: method.toUpperCase(), endpoint });
        await wait(1000);
        try {
            const response = await axios({ method, url: endpoint, data, headers: { Accept: 'application/json' } });
            const ok = expected.includes(response.status);
            add({ type: ok ? 'success' : 'error', endpoint, method, status: response.status, message: ok ? (response.data?.message || 'Request completed successfully.') : `Expected ${expected.join(' or ')}, received ${response.status}.` });
            return response;
        } catch (error) {
            const status = error.response?.status || 0;
            const ok = expected.includes(status);
            const message = error.response?.data?.message || (status ? 'Request failed.' : 'Could not reach the API.');
            add({ type: ok ? 'success' : 'error', endpoint, method, status, message: ok ? `Expected error received: ${message}` : message });
            if (!ok) throw error;
            return error.response;
        } finally {
            setTyping(null);
        }
    };

    const run = async () => {
        setMessages([]);
        setRunning(true);
        let issueId = null;
        try {
            const created = await request('post', '/api/issues', {
                customer_name: 'API Test Customer',
                title: `Temporary API test ${Date.now()}`,
                description: 'Temporary row created by the dashboard API test console.',
                priority: 'high',
                category: 'Technical Issues',
            }, [202]);
            issueId = created.data.data.id;

            await request('post', '/api/issues', { priority: 'invalid' }, [422]);
            await request('get', '/api/issues?status=open&priority=high&per_page=10', null, [200]);
            await request('post', `/api/issues/${issueId}/comments`, { author_name: 'Authenticated user', body: 'Temporary API test comment.' }, [201]);
            await request('get', `/api/issues/${issueId}`, null, [200]);
            await request('patch', `/api/issues/${issueId}`, { status: 'in_progress' }, [200]);
            await request('get', `/dashboard/api/tests/issues/${issueId}/job`, null, [200]);
            await request('post', `/dashboard/api/tests/issues/${issueId}/run-summary`, null, [200]);
        } catch {
            add({ type: 'error', method: 'TEST', endpoint: 'Test sequence', message: 'The sequence stopped after an unexpected response.' });
        } finally {
            if (issueId) {
                try {
                    await request('delete', `/api/issues/${issueId}`, null, [204]);
                    add({ type: 'cleanup', method: 'CLEANUP', endpoint: `Issue #${issueId}`, status: 204, message: 'Temporary issue and its comment were deleted.' });
                } catch {
                    add({ type: 'error', method: 'CLEANUP', endpoint: `Issue #${issueId}`, message: 'Automatic cleanup failed. Delete this temporary issue manually.' });
                }
            }
            setRunning(false);
        }
    };

    return (
        <DashboardLayout title="API Tests">
            <PageHeader icon={FlaskConical} title="API test console" description="Run real authenticated requests and inspect every status code and message." actions={<Button onClick={run} disabled={running}>{running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}Test now</Button>} />

            <Card className="mx-auto max-w-4xl overflow-hidden">
                <div className="border-b border-white/10 px-6 py-4"><h2 className="font-semibold text-white">Test API Endpoints</h2><p className="mt-1 text-xs text-slate-400">The console creates one temporary issue and always attempts to delete it after testing.</p></div>
                <div className="min-h-[28rem] space-y-4 p-6">
                    {messages.length === 0 && <div className="flex min-h-[22rem] flex-col items-center justify-center text-center"><FlaskConical className="mb-4 h-10 w-10 text-[#cda749]" /><p className="font-medium text-white">Ready to test the Issue API</p><p className="mt-1 max-w-sm text-sm text-slate-400">Select Test now to run create, validation, filtering, comment, view, update, and cleanup requests.</p></div>}
                    {messages.map((item) => {
                        const success = item.type === 'success' || item.type === 'cleanup';
                        const requestBubble = item.type === 'request';
                        return <div key={item.id} className="flex justify-start"><div className={`max-w-[85%] rounded-2xl border px-4 py-3 ${requestBubble ? 'border-[#cda749]/20 bg-[#cda749]/10' : success ? 'border-emerald-400/20 bg-emerald-500/10' : 'border-rose-400/20 bg-rose-500/10'}`}><p className={`mb-2 text-[10px] font-bold uppercase tracking-[0.16em] ${requestBubble ? 'text-[#e8cd78]' : success ? 'text-emerald-300' : 'text-rose-300'}`}>{requestBubble ? 'Request' : 'Response'}</p><div className="flex items-center gap-2">{requestBubble ? <Play className="h-3.5 w-3.5 text-[#e8cd78]" /> : success ? (item.type === 'cleanup' ? <Trash2 className="h-4 w-4 text-emerald-300" /> : <CheckCircle2 className="h-4 w-4 text-emerald-300" />) : <AlertCircle className="h-4 w-4 text-rose-300" />}<span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-300">{item.method}</span><code className="break-all text-xs text-slate-300">{item.endpoint}</code></div>{item.status !== undefined && <p className={`mt-2 text-sm font-bold ${success ? 'text-emerald-300' : 'text-rose-300'}`}>HTTP {item.status || 'Network error'}</p>}<p className="mt-1 text-sm leading-6 text-slate-300">{item.message}</p></div></div>;
                    })}
                    {typing && <div className="flex justify-start"><div className="max-w-[85%] rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Response</p><div className="flex items-center gap-2"><span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">{typing.method}</span><code className="break-all text-xs text-slate-400">{typing.endpoint}</code></div><div className="mt-3 flex items-center gap-1.5" aria-label="Writing response"><span className="h-2 w-2 animate-bounce rounded-full bg-[#cda749]" /><span className="h-2 w-2 animate-bounce rounded-full bg-[#cda749] [animation-delay:150ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-[#cda749] [animation-delay:300ms]" /><span className="ml-2 text-xs text-slate-500">writing…</span></div></div></div>}
                    {running && !typing && <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin text-[#cda749]" />Preparing next test…</div>}
                </div>
            </Card>
        </DashboardLayout>
    );
}
