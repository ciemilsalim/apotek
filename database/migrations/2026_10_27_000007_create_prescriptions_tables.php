<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Prescriptions Table
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->string('prescription_number', 50)->unique();
            $table->string('doctor_name', 150);
            $table->string('doctor_sip', 100)->nullable();
            $table->string('patient_name', 150);
            $table->string('patient_age', 50)->nullable();
            $table->string('patient_phone', 50)->nullable();
            $table->date('prescription_date');
            $table->enum('status', ['pending', 'processed', 'completed', 'cancelled'])->default('pending');
            $table->enum('type', ['racikan', 'non_racikan', 'campuran'])->default('racikan');
            $table->decimal('total_medicine_price', 12, 2)->default(0);
            $table->decimal('service_fee', 12, 2)->default(0); // Embalase / tuslah / jasa racik
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->text('notes')->nullable();

            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('processed_by')->nullable()->constrained('users');
            $table->foreignId('sale_id')->nullable()->constrained('sales')->nullOnDelete();
            $table->timestamps();
        });

        // 2. Prescription Items (Compound / Non-Compound Formula)
        Schema::create('prescription_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained('prescriptions')->cascadeOnDelete();
            $table->enum('item_type', ['racikan', 'obat_jadi'])->default('racikan');
            $table->string('racikan_name', 150)->nullable();
            $table->string('racikan_type', 50)->nullable(); // puyer, kapsul, salep, sirup
            $table->integer('quantity')->default(1); // misal 10 bungkus
            $table->string('unit', 50)->default('Bungkus');
            $table->string('signa', 150); // aturan pakai: 3x1 sehari sesudah makan
            $table->decimal('service_fee', 10, 2)->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->timestamps();
        });

        // 3. Prescription Item Medicines (Ingredients / Komposisi Obat)
        Schema::create('prescription_item_medicines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_item_id')->constrained('prescription_items')->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained('medicines');
            $table->string('medicine_name', 150);
            $table->string('dosage', 100)->nullable(); // dosis: misal 1/2 tablet, 250 mg
            $table->integer('quantity'); // kuantitas diambil dari stok obat
            $table->decimal('price', 10, 2);
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });

        // 4. Add nullable prescription_id to sales table
        Schema::table('sales', function (Blueprint $table) {
            $table->foreignId('prescription_id')->nullable()->after('notes')->constrained('prescriptions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['prescription_id']);
            $table->dropColumn('prescription_id');
        });

        Schema::dropIfExists('prescription_item_medicines');
        Schema::dropIfExists('prescription_items');
        Schema::dropIfExists('prescriptions');
    }
};
