<?php

namespace App\Models;

use App\Enums\ReportFormat;
use App\Enums\ReportFrequency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'site_id',
        'frequency',
        'format',
        'is_active',
        'last_sent_at',
    ];

    protected $casts = [
        'frequency' => ReportFrequency::class,
        'format' => ReportFormat::class,
        'is_active' => 'boolean',
        'last_sent_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }
}
