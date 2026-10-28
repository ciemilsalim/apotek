<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'code',
        'name',
        'generic_name',
        'unit',
        'buy_price',
        'sell_price',
        'stock',
        'min_stock',
        'expiry_date',
        'location',
        'description',
        'image',
    ];

    protected $appends = [
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'buy_price' => 'decimal:2',
            'sell_price' => 'decimal:2',
            'stock' => 'integer',
            'min_stock' => 'integer',
            'expiry_date' => 'date',
        ];
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }

        return asset('storage/' . $this->image);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function stockAdjustments(): HasMany
    {
        return $this->hasMany(StockAdjustment::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function batches(): HasMany
    {
        return $this->hasMany(MedicineBatch::class)->orderBy('expiry_date', 'asc');
    }

    public function activeBatches(): HasMany
    {
        return $this->hasMany(MedicineBatch::class)->where('current_stock', '>', 0)->orderBy('expiry_date', 'asc');
    }

    public function saleableBatches(): HasMany
    {
        return $this->hasMany(MedicineBatch::class)
            ->where('current_stock', '>', 0)
            ->where('expiry_date', '>=', \Carbon\Carbon::today()->format('Y-m-d'))
            ->orderBy('expiry_date', 'asc');
    }

    public function expiredBatches(): HasMany
    {
        return $this->hasMany(MedicineBatch::class)
            ->where('current_stock', '>', 0)
            ->where('expiry_date', '<', \Carbon\Carbon::today()->format('Y-m-d'))
            ->orderBy('expiry_date', 'asc');
    }

    public function syncStockFromBatches(): void
    {
        $total = (int) $this->batches()->sum('current_stock');
        $earliestActiveExpiry = $this->activeBatches()->min('expiry_date');

        $updateData = ['stock' => $total];
        if ($earliestActiveExpiry) {
            $updateData['expiry_date'] = $earliestActiveExpiry;
        }

        $this->update($updateData);
    }

    public function isLowStock(): bool
    {
        return $this->stock <= $this->min_stock;
    }

    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }
}
