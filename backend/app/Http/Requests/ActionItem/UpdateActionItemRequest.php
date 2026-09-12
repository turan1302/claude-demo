<?php

namespace App\Http\Requests\ActionItem;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateActionItemRequest extends FormRequest
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
            'status' => ['sometimes', Rule::enum(\App\Enums\ActionItemStatus::class)],
            'priority' => ['sometimes', Rule::enum(\App\Enums\Priority::class)],
        ];
    }
}
