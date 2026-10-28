<?php

namespace App\Http\Controllers;

use App\Models\PharmacyProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PharmacyProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        abort_if($request->user()->role !== 'admin', 403, 'Hanya Administrator yang memiliki akses ke Pengaturan Profil Apotek.');

        $profile = PharmacyProfile::getSettings();

        return Inertia::render('Settings/PharmacyProfile', [
            'profile' => $profile,
            'pharmacy' => $profile,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_if($request->user()->role !== 'admin', 403, 'Hanya Administrator yang memiliki akses ke Pengaturan Profil Apotek.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'owner_name' => ['nullable', 'string', 'max:255'],
            'apa_name' => ['nullable', 'string', 'max:255'],
            'sipa_number' => ['nullable', 'string', 'max:255'],
            'sia_number' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:100'],
            'receipt_footer' => ['nullable', 'string', 'max:500'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:2048'],
        ], [
            'name.required' => 'Nama Apotek wajib diisi.',
            'logo.image' => 'File logo harus berupa gambar (JPEG, PNG, WEBP, atau SVG).',
            'logo.max' => 'Ukuran file logo maksimal 2MB.',
        ]);

        $profile = PharmacyProfile::getSettings();

        if ($request->hasFile('logo')) {
            if ($profile->logo_path && Storage::disk('public')->exists($profile->logo_path)) {
                Storage::disk('public')->delete($profile->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('pharmacy_logos', 'public');
        }

        unset($validated['logo']);

        $profile->update($validated);
        PharmacyProfile::syncPwaManifest($profile->fresh());

        return redirect()->back()->with('success', 'Profil Apotek berhasil diperbarui!');
    }
}
