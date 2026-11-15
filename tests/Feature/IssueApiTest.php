<?php

use App\Jobs\GenerateIssueSummary;
use App\Models\Issue;
use App\Models\User;
use Database\Seeders\KnowledgeBaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.openai.key' => null]);
    Sanctum::actingAs(User::factory()->create(['name' => 'Support Admin']));
});

function issuePayload(array $overrides = []): array
{
    return array_merge([
        'customer_name' => 'Acme Ltd',
        'title' => 'Customer cannot access invoices',
        'description' => 'The billing page returns an authorization error.',
        'priority' => 'high',
        'category' => 'Billing',
    ], $overrides);
}

function storedIssue(array $overrides = []): Issue
{
    return Issue::create(issuePayload($overrides));
}

it('creates an issue successfully', function () {
    Queue::fake();

    $this->postJson('/api/issues', issuePayload())
        ->assertAccepted()
        ->assertJsonPath('data.customer_name', 'Acme Ltd')
        ->assertJsonPath('data.status', 'open')
        ->assertJsonPath('data.summary_status', 'pending')
        ->assertJsonPath('data.needs_attention', true);

    $this->assertDatabaseHas('issues', ['title' => 'Customer cannot access invoices']);
});

it('rejects a missing or invalid issue field', function () {
    $payload = issuePayload(['title' => ' ', 'priority' => 'urgent', 'status' => 'invalid']);

    $this->postJson('/api/issues', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['title', 'priority', 'status']);
});

it('combines status and priority filters', function () {
    storedIssue(['title' => 'Matching', 'status' => 'open', 'priority' => 'high']);
    storedIssue(['title' => 'Wrong priority', 'status' => 'open', 'priority' => 'low']);
    storedIssue(['title' => 'Wrong status', 'status' => 'resolved', 'priority' => 'high']);

    $this->getJson('/api/issues?status=open&priority=high')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.title', 'Matching');
});

it('adds a comment to an existing issue', function () {
    $issue = storedIssue();

    $this->postJson("/api/issues/{$issue->id}/comments", ['author_name' => 'Attempted alias', 'body' => 'We are investigating this issue.'])
        ->assertCreated()
        ->assertJsonPath('data.author_name', 'Support Admin')
        ->assertJsonPath('data.body', 'We are investigating this issue.');

    $this->assertDatabaseHas('comments', ['issue_id' => $issue->id]);

    $this->postJson("/api/issues/{$issue->id}/comments", ['author_name' => ' ', 'body' => 'Missing author'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('author_name');
});

it('loads comments on the single issue endpoint without n plus one queries', function () {
    $issue = storedIssue();
    $issue->comments()->createMany([
        ['author_name' => 'One', 'body' => 'First'],
        ['author_name' => 'Two', 'body' => 'Second'],
        ['author_name' => 'Three', 'body' => 'Third'],
    ]);

    DB::flushQueryLog();
    DB::enableQueryLog();

    $this->getJson("/api/issues/{$issue->id}")
        ->assertOk()
        ->assertJsonCount(3, 'data.comments');

    $contentQueries = collect(DB::getQueryLog())->filter(fn ($query) =>
        str_contains(strtolower($query['query']), 'issues') || str_contains(strtolower($query['query']), 'comments')
    );

    expect($contentQueries->count())->toBeLessThanOrEqual(2);
});

it('dispatches the summary job when creating an issue', function () {
    Queue::fake();

    $response = $this->postJson('/api/issues', issuePayload())->assertAccepted();
    $issueId = $response->json('data.id');

    Queue::assertPushed(GenerateIssueSummary::class, fn ($job) => $job->issueId === $issueId);
});

it('populates summary fields when the summary job runs', function () {
    $this->seed(KnowledgeBaseSeeder::class);
    $issue = storedIssue([
        'title' => 'Need compatibility help',
        'description' => 'Will this SAS drive work with my server controller and backplane?',
        'priority' => 'medium',
        'category' => 'Billing',
        'summary_status' => 'pending',
    ]);

    app()->call([new GenerateIssueSummary($issue->id), 'handle']);
    $issue->refresh();

    expect($issue->summary)->not->toBeNull()
        ->and($issue->suggested_next_action)->not->toBeNull()
        ->and($issue->suggested_next_action)->toContain('server/enclosure model')
        ->and($issue->category)->toBe('Technical Issues')
        ->and($issue->summary_status)->toBe('ready');
});

it('authenticates the endpoints with a real bearer token', function () {
    \Illuminate\Support\Facades\Auth::forgetGuards();
    $user = User::factory()->create();
    $token = $user->createToken('Test client')->plainTextToken;

    $this->withToken($token)->getJson('/api/issues')->assertOk();
});
