<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\SiteType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Kullanıcıya ait TÜM `sites` satırları (ana siteler + rakip siteler).
     * Sahiplik kontrolleri için; listeleme ekranlarında genelde
     * `primarySites()` kullanılmalı.
     */
    public function sites(): HasMany
    {
        return $this->hasMany(Site::class);
    }

    public function primarySites(): HasMany
    {
        return $this->sites()->where('type', SiteType::Primary);
    }

    public function integrations(): HasMany
    {
        return $this->hasMany(Integration::class);
    }

    public function reportSubscriptions(): HasMany
    {
        return $this->hasMany(ReportSubscription::class);
    }
}
