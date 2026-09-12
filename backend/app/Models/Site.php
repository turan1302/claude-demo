<?php

namespace App\Models;

use App\Enums\SiteStatus;
use App\Enums\SiteType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Site extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'parent_site_id',
        'url',
        'name',
        'status',
        'last_analyzed_at',
    ];

    protected $casts = [
        'type' => SiteType::class,
        'status' => SiteStatus::class,
        'last_analyzed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parentSite(): BelongsTo
    {
        return $this->belongsTo(Site::class, 'parent_site_id');
    }

    /**
     * Bu siteye karşı takip edilen rakip siteler (kendisi de bir `sites`
     * satırıdır — analiz motoru dahil hiçbir şey tekrar yazılmaz).
     */
    public function competitors(): HasMany
    {
        return $this->hasMany(Site::class, 'parent_site_id');
    }

    public function analyses(): HasMany
    {
        return $this->hasMany(SiteAnalysis::class);
    }

    public function latestAnalysis(): HasOne
    {
        return $this->hasOne(SiteAnalysis::class)->latestOfMany('version');
    }

    public function keywords(): HasMany
    {
        return $this->hasMany(Keyword::class);
    }
}
