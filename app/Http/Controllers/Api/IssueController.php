<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreIssueRequest;
use App\Http\Requests\UpdateIssueRequest;
use App\Http\Resources\IssueResource;
use App\Jobs\GenerateIssueSummary;
use App\Models\Issue;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class IssueController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'status' => ['sometimes', Rule::in(Issue::STATUSES)],
            'priority' => ['sometimes', Rule::in(Issue::PRIORITIES)],
            'category' => ['sometimes', Rule::in(Issue::CATEGORIES)],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $issues = Issue::query()
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['priority']), fn ($query) => $query->where('priority', $filters['priority']))
            ->when(isset($filters['category']), fn ($query) => $query->where('category', trim($filters['category'])))
            ->latest()
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();

        return IssueResource::collection($issues);
    }

    public function store(StoreIssueRequest $request)
    {
        $data = $request->validated();
        $issue = new Issue($data);
        $issue->status = $data['status'] ?? 'open';
        $issue->summary_status = 'pending';
        $issue->recomputeNeedsAttention();
        $issue->save();

        GenerateIssueSummary::dispatch($issue->id);

        return (new IssueResource($issue))->response()->setStatusCode(202);
    }

    public function show(Issue $issue): IssueResource
    {
        return new IssueResource($issue->load('comments'));
    }

    public function update(UpdateIssueRequest $request, Issue $issue): IssueResource
    {
        $issue->fill($request->validated());
        $shouldRegenerate = $issue->isDirty(['description', 'priority']);

        if ($issue->isDirty('priority')) {
            $issue->recomputeNeedsAttention();
        }

        if ($shouldRegenerate) {
            $issue->summary = null;
            $issue->suggested_next_action = null;
            $issue->summary_status = 'pending';
        }

        $issue->save();

        if ($shouldRegenerate) {
            GenerateIssueSummary::dispatch($issue->id);
        }

        return new IssueResource($issue->fresh()->load('comments'));
    }

    public function destroy(Issue $issue): Response
    {
        $issue->delete();

        return response()->noContent();
    }
}
