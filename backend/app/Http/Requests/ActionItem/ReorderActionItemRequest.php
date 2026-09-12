<?php

namespace App\Http\Requests\ActionItem;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReorderActionItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'position' => ['required', 'numeric'],
            'status' => ['sometimes', Rule::enum(\App\Enums\ActionItemStatus::class)],
        ];
    }
}
