<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Sanctum\PersonalAccessToken;
use App\Jobs\GenerateIssueSummary;
use App\Models\Issue;
use App\Services\IssueResponseGenerator;

class ApiAccessController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Dashboard/ApiAccess', [
            'tokens' => $request->user()->tokens()->latest()->get(['id', 'name', 'last_used_at', 'created_at']),
            'newToken' => fn () => $request->session()->pull('new_api_token'),
            'baseUrl' => rtrim(config('app.url'), '/').'/api',
        ]);
    }

    public function tests(): Response
    {
        return Inertia::render('Dashboard/ApiTests');
    }

    public function jobStatus(Issue $issue): JsonResponse
    {
        $dispatched = DB::table('jobs')
            ->where('payload', 'like', '%GenerateIssueSummary%')
            ->get(['payload'])
            ->contains(function ($row) use ($issue) {
                $command = json_decode($row->payload, true)['data']['command'] ?? null;
                if (! is_string($command)) return false;
                $job = @unserialize($command);

                return $job instanceof GenerateIssueSummary && $job->issueId === $issue->id;
            });

        return response()->json([
            'message' => $dispatched
                ? 'GenerateIssueSummary is queued for this issue.'
                : 'No queued summary job was found for this issue.',
            'dispatched' => $dispatched,
        ], $dispatched ? 200 : 404);
    }

    public function runSummary(Issue $issue, IssueResponseGenerator $generator): JsonResponse
    {
        (new GenerateIssueSummary($issue->id))->handle($generator);
        $issue->refresh();
        $complete = filled($issue->summary)
            && filled($issue->suggested_next_action)
            && $issue->summary_status === 'ready';

        return response()->json([
            'message' => $complete
                ? 'Summary job populated summary, suggested_next_action, and summary_status.'
                : 'The summary job did not populate every required field.',
            'complete' => $complete,
            'data' => $issue->only(['summary', 'suggested_next_action', 'summary_status']),
        ], $complete ? 200 : 500);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:100']]);
        $name = trim($data['name']);

        if ($name === '') {
            return back()->withErrors(['name' => 'The token name is required.']);
        }

        $token = $request->user()->createToken($name, ['issues:read', 'issues:write']);

        return back()->with('new_api_token', $token->plainTextToken)->with('success', 'Access token created. Copy it now.');
    }

    public function destroy(Request $request, PersonalAccessToken $token): RedirectResponse
    {
        abort_unless($token->tokenable?->is($request->user()), 404);
        $token->delete();

        return back()->with('success', 'Access token revoked.');
    }
}
