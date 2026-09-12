<?php

namespace App\Models;

use App\Enums\IntegrationProvider;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Integration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'provider',
        'api_key',
        'is_active',
        'last_used_at',
    ];

    protected $hidden = [
        'api_key',
    ];

    protected $casts = [
        'provider' => IntegrationProvider::class,
        'api_key' => 'encrypted',
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Last 4 characters of the key, for display without ever exposing the full secret.
     */
    public function getMaskedKeyAttribute(): string
    {
        return '••••'.substr($this->api_key, -4);
    }
}
