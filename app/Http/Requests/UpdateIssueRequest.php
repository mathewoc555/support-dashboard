<?php

namespace App\Http\Requests;

use App\Models\Issue;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $fields = ['customer_name', 'title', 'description', 'priority', 'category', 'status'];
        $this->merge(collect($this->only($fields))
            ->map(fn ($value) => is_string($value) ? trim($value) : $value)->all());
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['sometimes', 'required', 'string', 'max:255'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'priority' => ['sometimes', 'required', Rule::in(Issue::PRIORITIES)],
            'category' => ['sometimes', 'required', Rule::in(Issue::CATEGORIES)],
            'status' => ['sometimes', 'required', Rule::in(Issue::STATUSES)],
        ];
    }
}
