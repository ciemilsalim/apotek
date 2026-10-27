<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_number',
        'type',
        'category',
        'amount',
        'payment_method',
        'transaction_date',
        'reference_number',
        'description',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'transaction_date' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    public static function getCategories(): array
    {
        return [
            'expense' => [
                'pembelian_obat' => 'Pembelian Obat (PBF/Distributor)',
                'operasional' => 'Operasional & Perlengkapan Apotek',
                'gaji' => 'Gaji & Tunjangan Karyawan',
                'listrik_air' => 'Listrik, Air & Internet',
                'sewa' => 'Sewa Gedung & Pemeliharaan',
                'pajak_retribusi' => 'Pajak & Retribusi Resmi',
                'lainnya' => 'Pengeluaran Lainnya',
            ],
            'income' => [
                'modal_awal' => 'Kas Modal Awal / Tambahan Kas',
                'pendapatan_jasa' => 'Pendapatan Jasa / Layanan Medis',
                'refund_pbf' => 'Klaim Retur / Refund Dana PBF',
                'pendapatan_lain' => 'Pemasukan Lainnya',
            ],
        ];
    }

    public static function generateTransactionNumber(): string
    {
        $today = Carbon::today()->format('Ymd');
        $prefix = "TRX-{$today}-";

        $last = self::where('transaction_number', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        $seq = 1;
        if ($last) {
            $lastSeq = (int) substr($last->transaction_number, -4);
            $seq = $lastSeq + 1;
        }

        return $prefix . str_pad((string) $seq, 4, '0', STR_PAD_LEFT);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeIncome(Builder $query): Builder
    {
        return $query->where('type', 'income');
    }

    public function scopeExpense(Builder $query): Builder
    {
        return $query->where('type', 'expense');
    }

    public function getCategoryLabelAttribute(): string
    {
        $categories = self::getCategories()[$this->type] ?? [];
        return $categories[$this->category] ?? ucfirst(str_replace('_', ' ', $this->category));
    }
}
