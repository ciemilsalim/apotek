<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpiryController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PharmacyProfileController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfitLossController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth'])->group(function () {
    // 1. Dashboard (All roles)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // 2. Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // 3. Admin Only: User Management & Pharmacy Profile Settings
    Route::middleware(['role:admin'])->group(function () {
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('index');
            Route::post('/', [UserController::class, 'store'])->name('store');
            Route::put('/{user}', [UserController::class, 'update'])->name('update');
            Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/pharmacy', [PharmacyProfileController::class, 'edit'])->name('pharmacy.edit');
            Route::post('/pharmacy', [PharmacyProfileController::class, 'update'])->name('pharmacy.update');
        });
    });

    // 4. Admin & Operator: Medicine Stock Management (CRUD) & Categories
    Route::middleware(['role:admin,operator'])->group(function () {
        // Categories
        Route::prefix('categories')->name('categories.')->group(function () {
            Route::get('/', [CategoryController::class, 'index'])->name('index');
            Route::post('/', [CategoryController::class, 'store'])->name('store');
            Route::put('/{category}', [CategoryController::class, 'update'])->name('update');
            Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('destroy');
        });

        // Medicines & Stock Adjustments
        Route::prefix('medicines')->name('medicines.')->group(function () {
            Route::get('/', [MedicineController::class, 'index'])->name('index');
            Route::get('/import/template', [MedicineController::class, 'downloadTemplate'])->name('import.template');
            Route::post('/import', [MedicineController::class, 'import'])->name('import');
            Route::post('/', [MedicineController::class, 'store'])->name('store');
            Route::put('/{medicine}', [MedicineController::class, 'update'])->name('update');
            Route::delete('/{medicine}', [MedicineController::class, 'destroy'])->name('destroy');
            Route::post('/{medicine}/adjust-stock', [MedicineController::class, 'adjustStock'])->name('adjust-stock');
            Route::post('/{medicine}/batches', [MedicineController::class, 'storeBatch'])->name('batches.store');
            Route::get('/adjustments/history', [MedicineController::class, 'adjustmentsHistory'])->name('adjustments');
        });

        // Expiry Monitoring & Alerts (Peringatan & Karantina Obat Kadaluarsa)
        Route::prefix('expiries')->name('expiries.')->group(function () {
            Route::get('/', [ExpiryController::class, 'index'])->name('index');
            Route::post('/{batch}/quarantine', [ExpiryController::class, 'quarantine'])->name('quarantine');
            Route::get('/export', [ExpiryController::class, 'export'])->name('export');
        });

        // Prescriptions & Compounding (Resep Dokter & Obat Racikan)
        Route::prefix('prescriptions')->name('prescriptions.')->group(function () {
            Route::get('/', [PrescriptionController::class, 'index'])->name('index');
            Route::get('/create', [PrescriptionController::class, 'create'])->name('create');
            Route::post('/', [PrescriptionController::class, 'store'])->name('store');
            Route::get('/{prescription}', [PrescriptionController::class, 'show'])->name('show');
            Route::patch('/{prescription}/status', [PrescriptionController::class, 'updateStatus'])->name('update-status');
            Route::get('/{prescription}/etiket', [PrescriptionController::class, 'etiket'])->name('etiket');
            Route::delete('/{prescription}', [PrescriptionController::class, 'destroy'])->name('destroy');
        });

        // Reports (Daily, Monthly, PDF, Excel)
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('index');
            Route::get('/export/pdf', [ReportController::class, 'exportPdf'])->name('export.pdf');
            Route::get('/export/excel', [ReportController::class, 'exportExcel'])->name('export.excel');

            // Laporan Laba Rugi (Profit & Loss / Income Statement)
            Route::get('/profit-loss', [ProfitLossController::class, 'index'])->name('profit-loss');
            Route::get('/profit-loss/export/pdf', [ProfitLossController::class, 'exportPdf'])->name('profit-loss.export.pdf');
            Route::get('/profit-loss/export/excel', [ProfitLossController::class, 'exportExcel'])->name('profit-loss.export.excel');
        });

        // Finance & Cash Flow (Manajemen Keuangan & Arus Kas)
        Route::prefix('finance')->name('finance.')->group(function () {
            Route::get('/', [FinanceController::class, 'index'])->name('index');
            Route::post('/', [FinanceController::class, 'store'])->name('store');
            Route::delete('/{transaction}', [FinanceController::class, 'destroy'])->name('destroy');
            Route::get('/export/pdf', [FinanceController::class, 'exportPdf'])->name('export.pdf');
            Route::get('/export/excel', [FinanceController::class, 'exportExcel'])->name('export.excel');
        });
    });

    // 5. Admin & Kasir: POS / Penjualan
    Route::middleware(['role:admin,kasir'])->prefix('pos')->name('pos.')->group(function () {
        Route::get('/', [PosController::class, 'index'])->name('index');
        Route::post('/', [PosController::class, 'store'])->name('store');
        Route::get('/history', [PosController::class, 'history'])->name('history');
        Route::get('/receipt/{sale}', [PosController::class, 'show'])->name('receipt');
    });
});

require __DIR__.'/auth.php';
