<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'prescription_number',
        'doctor_name',
        'doctor_sip',
        'patient_name',
        'patient_age',
        'patient_phone',
        'prescription_date',
        'status',
        'type',
        'total_medicine_price',
        'service_fee',
        'grand_total',
        'notes',
        'created_by',
        'processed_by',
        'sale_id',
    ];

    protected function casts(): array
    {
        return [
            'prescription_date' => 'date',
            'total_medicine_price' => 'decimal:2',
            'service_fee' => 'decimal:2',
            'grand_total' => 'decimal:2',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PrescriptionItem::class);
    }

    public function calculateTotals(): void
    {
        $this->loadMissing('items.ingredients');
        $medTotal = 0;
        $serviceTotal = 0;

        foreach ($this->items as $item) {
            $itemMedSubtotal = 0;
            foreach ($item->ingredients as $ing) {
                $itemMedSubtotal += (float) $ing->subtotal;
            }
            $item->update([
                'subtotal' => $itemMedSubtotal + (float) $item->service_fee,
            ]);

            $medTotal += $itemMedSubtotal;
            $serviceTotal += (float) $item->service_fee;
        }

        $this->update([
            'total_medicine_price' => $medTotal,
            'service_fee' => $serviceTotal,
            'grand_total' => $medTotal + $serviceTotal,
        ]);
    }
}
