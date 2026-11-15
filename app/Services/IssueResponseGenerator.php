<?php

namespace App\Services;

use App\Models\Issue;
use App\Models\KnowledgeBase;
use App\Models\KnowledgeBaseCategory;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class IssueResponseGenerator
{
    public function process(Issue $issue): array
    {
        $category = $this->categorize($issue);
        $articles = $this->knowledgeFor($category, $issue);
        $payload = $this->payload($issue, $category, $articles);

        if (filled(config('services.openai.key'))) {
            try {
                return ['category' => $category->name, ...$this->generateWithOpenAI($payload)];
            } catch (Throwable $exception) {
                Log::warning('Issue response generation fell back to local rules.', [
                    'issue_id' => $issue->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return ['category' => $category->name, ...$this->generateLocally($issue, $articles)];
    }

    private function categorize(Issue $issue): KnowledgeBaseCategory
    {
        $text = Str::lower($issue->title.' '.$issue->description);
        $categories = KnowledgeBaseCategory::with(['articles' => fn ($query) => $query->where('active', true)])->get();

        if ($categories->isEmpty()) {
            return new KnowledgeBaseCategory(['name' => $issue->category, 'slug' => Str::slug($issue->category)]);
        }

        return $categories->sortByDesc(function (KnowledgeBaseCategory $category) use ($text, $issue) {
            $score = $category->name === $issue->category ? 1 : 0;
            foreach ($category->articles as $article) {
                foreach ($article->keywords ?? [] as $keyword) {
                    if (str_contains($text, Str::lower($keyword))) {
                        $score += 3;
                    }
                }
            }
            return $score;
        })->first();
    }

    private function knowledgeFor(KnowledgeBaseCategory $category, Issue $issue): Collection
    {
        if (! $category->exists) {
            return collect();
        }

        $text = Str::lower($issue->title.' '.$issue->description);

        return KnowledgeBase::where('knowledge_base_category_id', $category->id)
            ->where('active', true)
            ->get()
            ->sortByDesc(fn (KnowledgeBase $article) => collect($article->keywords ?? [])->sum(
                fn ($keyword) => str_contains($text, Str::lower($keyword)) ? 1 : 0
            ))
            ->take(3)
            ->values();
    }

    private function payload(Issue $issue, KnowledgeBaseCategory $category, Collection $articles): array
    {
        return [
            'task' => 'Summarize the support issue and give the support agent a concrete next action grounded only in the supplied knowledge base.',
            'business' => 'The company independently sells tested enterprise server and storage hardware with documented testing, protective shipping, warranties, and an RMA process.',
            'issue' => [
                'customer_name' => $issue->customer_name,
                'title' => $issue->title,
                'description' => $issue->description,
                'priority' => $issue->priority,
                'submitted_category' => $issue->category,
                'classified_category' => $category->name,
            ],
            'knowledge_base' => $articles->map(fn (KnowledgeBase $article) => [
                'title' => $article->title,
                'problem' => $article->problem,
                'agent_steps' => $article->agent_steps,
                'approved_customer_response' => $article->customer_response,
            ])->all(),
            'output' => ['summary' => 'string', 'suggested_next_action' => 'string'],
        ];
    }

    private function generateWithOpenAI(array $payload): array
    {
        $response = Http::timeout(30)
            ->withToken(config('services.openai.key'))
            ->post('https://api.openai.com/v1/responses', [
                'model' => config('services.openai.model'),
                'instructions' => 'You are an enterprise hardware support operations assistant. Use only the supplied knowledge base. Return a concise one-to-two-sentence summary and exactly one concrete, imperative next-action sentence. Do not return a list. Do not invent policies, test results, compatibility guarantees, shipping dates, or warranty eligibility.',
                'input' => json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
                'max_output_tokens' => 700,
                'text' => [
                    'format' => [
                        'type' => 'json_schema',
                        'name' => 'issue_support_response',
                        'strict' => true,
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'summary' => ['type' => 'string'],
                                'suggested_next_action' => ['type' => 'string'],
                            ],
                            'required' => ['summary', 'suggested_next_action'],
                            'additionalProperties' => false,
                        ],
                    ],
                ],
            ])->throw();

        $text = collect($response->json('output', []))
            ->flatMap(fn ($item) => $item['content'] ?? [])
            ->firstWhere('type', 'output_text')['text'] ?? '';
        $decoded = json_decode($text, true, flags: JSON_THROW_ON_ERROR);

        return [
            'summary' => $this->summary($decoded['summary']),
            'suggested_next_action' => $this->nextAction($decoded['suggested_next_action']),
        ];
    }

    private function generateLocally(Issue $issue, Collection $articles): array
    {
        $article = $articles->first();
        return [
            'summary' => $this->summary($issue->description),
            'suggested_next_action' => $this->nextAction($article
                ? $article->agent_steps
                : 'Review the issue, verify the order and hardware details, and document the findings.'),
        ];
    }

    private function summary(string $value): string
    {
        $sentences = preg_split('/(?<=[.!?])\s+/', trim($value), -1, PREG_SPLIT_NO_EMPTY);
        $summary = Str::limit(implode(' ', array_slice($sentences ?: [], 0, 2)), 400, '');

        return preg_match('/[.!?]$/', $summary) ? $summary : $summary.'.';
    }

    private function nextAction(string $value): string
    {
        $line = collect(preg_split('/\R+/', trim($value)))->first(fn ($item) => filled(trim($item))) ?? '';
        $line = preg_replace('/^\s*(?:\d+[.)]|[-*])\s*/', '', trim($line));
        $sentence = preg_split('/(?<=[.!?])\s+/', $line, 2, PREG_SPLIT_NO_EMPTY)[0] ?? 'Review the issue and document the findings.';

        return preg_match('/[.!?]$/', $sentence) ? $sentence : $sentence.'.';
    }
}
