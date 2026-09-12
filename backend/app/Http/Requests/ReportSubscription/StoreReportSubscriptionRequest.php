<?php

namespace App\Http\Requests\ReportSubscription;

use App\Enums\ReportFormat;
use App\Enums\ReportFrequency;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReportSubscriptionRequest extends FormRequest
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
            'site_id' => [
                'nullable',
                Rule::exists('sites', 'id')->where('user_id', $this->user()->id)->where('type', 'primary'),
            ],
            'frequency' => ['required', Rule::enum(ReportFrequency::class)],
            'format' => ['required', Rule::enum(ReportFormat::class)],
        ];
    }
}
