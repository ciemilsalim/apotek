<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MedicineBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicine_id',
        'batch_number',
        'expiry_date',
        'initial_stock',
        'current_stock',
        'buy_price',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'expiry_date' => 'date',
            'initial_stock' => 'integer',
            'current_stock' => 'integer',
            'buy_price' => 'decimal:2',
        ];
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function stockAdjustments(): HasMany
    {
        return $this->hasMany(StockAdjustment::class, 'batch_id');
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class, 'batch_id');
    }

    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function isExpiringSoon(int $months = 3): bool
    {
        return $this->expiry_date && $this->expiry_date->isFuture() && $this->expiry_date->lte(Carbon::now()->addMonths($months));
    }

    public function scopeActive($query)
    {
        return $query->where('current_stock', '>', 0);
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', Carbon::today()->format('Y-m-d'));
    }

    public function scopeCritical($query, int $days = 30)
    {
        $today = Carbon::today()->format('Y-m-d');
        $limit = Carbon::today()->addDays($days)->format('Y-m-d');
        return $query->where('expiry_date', '>=', $today)->where('expiry_date', '<=', $limit);
    }

    public function scopeExpiringSoon($query, int $days = 90)
    {
        $today = Carbon::today()->format('Y-m-d');
        $limit = Carbon::today()->addDays($days)->format('Y-m-d');
        return $query->where('expiry_date', '>=', $today)->where('expiry_date', '<=', $limit);
    }
}
