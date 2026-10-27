<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProfileController;
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

    // 3. Admin Only: User Management
    Route::middleware(['role:admin'])->prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::put('/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
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
            Route::post('/', [MedicineController::class, 'store'])->name('store');
            Route::put('/{medicine}', [MedicineController::class, 'update'])->name('update');
            Route::delete('/{medicine}', [MedicineController::class, 'destroy'])->name('destroy');
            Route::post('/{medicine}/adjust-stock', [MedicineController::class, 'adjustStock'])->name('adjust-stock');
            Route::get('/adjustments/history', [MedicineController::class, 'adjustmentsHistory'])->name('adjustments');
        });

        // Reports (Daily, Monthly, PDF, Excel)
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('index');
            Route::get('/export/pdf', [ReportController::class, 'exportPdf'])->name('export.pdf');
            Route::get('/export/excel', [ReportController::class, 'exportExcel'])->name('export.excel');
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
