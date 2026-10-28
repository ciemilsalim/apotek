# PEMBARUAN FITUR APOTEK-HIBBATILLAH — Oktober 2026

**Periode Repository Audit**: 2026-10-01 s.d. 2026-10-28  
**Git Commit Cutoff**: `4e8b85a`  

---

## 1. Klasifikasi Perubahan Aplikasi vs. Infrastruktur Evidence

> [!IMPORTANT]  
> Sesuai ketentuan audit, perubahan repositori dipisahkan secara tegas antara **Fitur Aplikasi (Bisnis)** dengan **Infrastruktur Audit / Tooling Evidence**.

---

## 2. Tabel Pembaruan Fitur Aplikasi (Business Features)

| FEATURE | ROLE | CHANGE TYPE | GIT EVIDENCE (COMMIT/FILES) | LIVE STATUS | SCREENSHOT | NOTES |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| Point of Sale (POS) Penjualan & Kasir | Kasir / Admin | **ACTIVE** | routes/web.php (prefix: pos) | LIVE_OPERATIONAL | `bukti_01_pos.png` | Antarmuka kasir cepat pencarian obat, cetak struk nota, dan riwayat shift |
| Katalog Obat & Pemantauan Batch Kadaluarsa | Operator / Apoteker | **ACTIVE** | MedicineController.php / ExpiryController.php | LIVE_OPERATIONAL | `bukti_02_medicines.png` | Pencatatan nomor batch obat, peringatan dini kadaluarsa, dan karantina obat |
| Resep Dokter & Obat Racikan (Compounding) | Operator / Apoteker | **ACTIVE** | PrescriptionController.php | LIVE_OPERATIONAL | `bukti_03_prescriptions.png` | Penerimaan resep dokter, perhitungan obat racikan, dan cetak etiket aturan pakai |
| Laporan Arus Kas & Laba Rugi | Admin / Owner | **ACTIVE** | ProfitLossController.php / FinanceController.php | LIVE_OPERATIONAL | `bukti_04_reports.png` | Laporan penjualan harian, arus kas kasir, ekspor PDF/Excel, dan analisa laba rugi |
| Dashboard Eksekutif & Ringkasan Penjualan | Admin / Owner | **ACTIVE** | DashboardController.php | LIVE_OPERATIONAL | `bukti_05_dashboard.png` | Metrik pendapatan harian/bulanan, stok obat menipis, dan peringatan kedaluwarsa |


---

## 3. Tabel Pembaruan Infrastruktur Evidence & Tooling (Non-Business)

| ITEM / TOOLING | KATEGORI | GIT COMMIT / FILES | ALASAN & RISIKO |
| :--- | :--- | :--- | :--- |
| Multi-Role Authorization Middleware (Admin, Operator, Kasir) | APPLICATION SECURITY | `app/Http/Middleware/CheckRole.php` | Pemisahan wewenang transaksi kasir dan supervisi keuangan |
| Universal Evidence & Billing Generator Engine | EVIDENCE INFRASTRUCTURE | `scripts/generate_bosp_package.php` | Penyusunan otomatis laporan berkala & invoice layanan software |


