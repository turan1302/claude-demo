<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Keyword extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_id',
        'keyword',
        'location',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function rankings(): HasMany
    {
        return $this->hasMany(KeywordRanking::class);
    }

    public function latestRanking(): HasOne
    {
        return $this->hasOne(KeywordRanking::class)->latestOfMany('checked_at');
    }
}
