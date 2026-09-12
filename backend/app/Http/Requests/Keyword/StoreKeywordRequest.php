<?php

namespace App\Http\Requests\Keyword;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKeywordRequest extends FormRequest
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
            'keyword' => [
                'required',
                'string',
                'max:255',
                Rule::unique('keywords')->where('site_id', $this->route('site')?->id),
            ],
            'location' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'keyword.unique' => 'Bu anahtar kelime zaten bu site için takip ediliyor.',
        ];
    }
}
