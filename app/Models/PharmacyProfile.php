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
            return '/storage/' . ltrim($this->logo_path, '/');
        }
        return null;
    }

    public static function syncPwaManifest(?self $profile = null): void
    {
        $profile = $profile ?? self::getSettings();
        $manifestPath = public_path('manifest.json');
        
        $name = $profile->name ?: 'Apotek Sehat';
        $shortName = \Illuminate\Support\Str::limit(preg_replace('/[^a-zA-Z0-9\s]/', '', $name), 12, '');
        $logoUrl = $profile->logo_url ?: '/icons/icon-192x192.svg';

        $mime = 'image/svg+xml';
        if ($profile->logo_path) {
            $ext = strtolower(pathinfo($profile->logo_path, PATHINFO_EXTENSION));
            if (in_array($ext, ['png', 'jpg', 'jpeg', 'webp', 'svg'])) {
                $mime = ($ext === 'svg') ? 'image/svg+xml' : "image/{$ext}";
            }
        }

        $manifestData = [
            'name' => "{$name} - Sistem Manajemen & Kasir",
            'short_name' => $shortName ?: 'Apotek',
            'start_url' => '/',
            'display' => 'standalone',
            'background_color' => '#ffffff',
            'theme_color' => '#059669',
            'description' => "Sistem Informasi Manajemen {$name} & Kasir Penjualan Obat",
            'orientation' => 'portrait-primary',
            'icons' => [
                [
                    'src' => $logoUrl,
                    'sizes' => '192x192',
                    'type' => $mime,
                    'purpose' => 'any',
                ],
                [
                    'src' => $logoUrl,
                    'sizes' => '512x512',
                    'type' => $mime,
                    'purpose' => 'any maskable',
                ],
            ],
        ];

        @file_put_contents($manifestPath, json_encode($manifestData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }
}
