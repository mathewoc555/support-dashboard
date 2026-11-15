<?php

namespace App\Jobs;

use App\Models\Issue;
use App\Services\IssueResponseGenerator;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class GenerateIssueSummary implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $issueId) {}

    public function handle(IssueResponseGenerator $generator): void
    {
        $issue = Issue::find($this->issueId);
        if (! $issue) {
            return;
        }

        $result = $generator->process($issue);

        $issue->update([
            'category' => $result['category'],
            'summary' => $result['summary'],
            'suggested_next_action' => $result['suggested_next_action'],
            'summary_status' => 'ready',
        ]);
    }

    public function failed(Throwable $exception): void
    {
        Issue::whereKey($this->issueId)->update(['summary_status' => 'failed']);
    }
}
