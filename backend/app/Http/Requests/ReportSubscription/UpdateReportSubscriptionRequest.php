<?php

namespace App\Http\Requests\ReportSubscription;

use App\Enums\ReportFormat;
use App\Enums\ReportFrequency;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReportSubscriptionRequest extends FormRequest
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
            'frequency' => ['sometimes', Rule::enum(ReportFrequency::class)],
            'format' => ['sometimes', Rule::enum(ReportFormat::class)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
