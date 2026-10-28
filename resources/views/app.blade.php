<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">

        <title inertia>{{ config('app.name', 'Apotek Sehat') }}</title>
        <meta name="csrf-token" content="{{ csrf_token() }}">

        @php
            $pharmacyProfile = \App\Models\PharmacyProfile::getSettings();
            $dynamicLogoUrl = $pharmacyProfile->logo_url ?: asset('icons/icon-192x192.svg');
            $dynamicPharmacyName = $pharmacyProfile->name ?: config('app.name', 'Apotek Sehat');
        @endphp

        <!-- Dynamic Favicon & Icons -->
        <link rel="icon" type="image/png" href="{{ $dynamicLogoUrl }}">
        <link rel="shortcut icon" href="{{ $dynamicLogoUrl }}">
        <link rel="apple-touch-icon" href="{{ $dynamicLogoUrl }}">

        <!-- PWA Manifest & App Meta -->
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#059669">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="{{ $dynamicPharmacyName }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
