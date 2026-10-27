<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('medicine_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicine_id')->constrained()->cascadeOnDelete();
            $table->string('batch_number', 100);
            $table->date('expiry_date');
            $table->integer('initial_stock')->default(0);
            $table->integer('current_stock')->default(0);
            $table->decimal('buy_price', 12, 2)->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->index(['medicine_id', 'expiry_date']);
            $table->index('batch_number');
        });

        // Add batch tracking fields to stock_adjustments and sale_items
        Schema::table('stock_adjustments', function (Blueprint $table) {
            $table->foreignId('batch_id')->nullable()->after('medicine_id')->constrained('medicine_batches')->nullOnDelete();
            $table->string('batch_number')->nullable()->after('batch_id');
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->foreignId('batch_id')->nullable()->after('medicine_id')->constrained('medicine_batches')->nullOnDelete();
            $table->string('batch_number')->nullable()->after('batch_id');
        });

        // Seed initial batches for existing medicines that already have stock > 0
        if (Schema::hasTable('medicines')) {
            $medicines = DB::table('medicines')->get();
            foreach ($medicines as $med) {
                if ($med->stock > 0) {
                    $cleanCode = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $med->code), 0, 4));
                    DB::table('medicine_batches')->insert([
                        'medicine_id' => $med->id,
                        'batch_number' => 'B' . ($cleanCode ?: 'MED') . '-' . date('y') . '01',
                        'expiry_date' => $med->expiry_date ?: date('Y-m-d', strtotime('+1 year')),
                        'initial_stock' => $med->stock,
                        'current_stock' => $med->stock,
                        'buy_price' => $med->buy_price,
                        'notes' => 'Batch awal inisialisasi sistem',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropForeign(['batch_id']);
            $table->dropColumn(['batch_id', 'batch_number']);
        });

        Schema::table('stock_adjustments', function (Blueprint $table) {
            $table->dropForeign(['batch_id']);
            $table->dropColumn(['batch_id', 'batch_number']);
        });

        Schema::dropIfExists('medicine_batches');
    }
};
