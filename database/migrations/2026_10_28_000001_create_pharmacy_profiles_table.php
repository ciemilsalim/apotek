<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pharmacy_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Apotek Sehat');
            $table->string('tagline')->nullable()->default('Sistem Informasi Farmasi Terpadu');
            $table->string('owner_name')->nullable()->default('Pemilik Sarana Apotek');
            $table->string('apa_name')->nullable()->default('apt. Pengelola Apotek, S.Farm');
            $table->string('sipa_number')->nullable()->default('SIPA: 19900101/SIPA_32.04/2026/001');
            $table->string('sia_number')->nullable()->default('SIA: 503/001/SIA/DPMPTSP/2026');
            $table->text('address')->nullable();
            $table->string('phone', 50)->nullable()->default('0812-3456-7890');
            $table->string('email', 100)->nullable()->default('info@apoteksehat.id');
            $table->string('logo_path')->nullable();
            $table->text('receipt_footer')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pharmacy_profiles');
    }
};
