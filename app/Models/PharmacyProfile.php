<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PharmacyProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'tagline',
        'owner_name',
        'apa_name',
        'sipa_number',
        'sia_number',
        'address',
        'phone',
        'email',
        'logo_path',
        'receipt_footer',
    ];

    protected $appends = [
        'logo_url',
    ];

    public static function getSettings(): self
    {
        return self::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Apotek Sehat',
                'tagline' => 'Sistem Informasi Farmasi Terpadu',
                'owner_name' => 'Pemilik Sarana Apotek',
                'apa_name' => 'apt. Pengelola Apotek, S.Farm',
                'sipa_number' => 'SIPA: 19900101/SIPA_32.04/2026/001',
                'sia_number' => 'SIA: 503/001/SIA/DPMPTSP/2026',
                'address' => 'Jl. Farmasi Sehat No. 88, Kota Sehat',
                'phone' => '0812-3456-7890',
                'email' => 'info@apoteksehat.id',
                'receipt_footer' => 'Terima kasih atas kunjungan Anda. Semoga lekas sembuh!',
            ]
        );
    }

    public function getLogoUrlAttribute(): ?string
    {
        if ($this->logo_path && Storage::disk('public')->exists($this->logo_path)) {
            return Storage::disk('public')->url($this->logo_path);
        }
        return null;
    }
}
