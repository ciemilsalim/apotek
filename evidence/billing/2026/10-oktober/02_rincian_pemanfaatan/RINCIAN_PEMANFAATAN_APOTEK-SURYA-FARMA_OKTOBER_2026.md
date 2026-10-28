# RINCIAN PEMANFAATAN LAYANAN APOTEK-SURYA-FARMA — Oktober 2026

**Nama Layanan**: Pembelian Lisensi Perangkat Lunak Sistem Informasi Apotek (One-Time Purchase)  
**Aplikasi**: Sistem Informasi Manajemen Apotek (Apotek Sehat)  
**URL Live**: http://localhost  
**Periode Audit**: 2026-10-01 s.d. 2026-10-28 (Evidence Cutoff: 2026-10-28)  
**Pelanggan**: Apotek Surya Farma  

---

## 1. Ringkasan Pemanfaatan Layanan

Aplikasi Sistem Informasi Apotek (Apotek Sehat) dimanfaatkan oleh pengelola dan apoteker untuk pencatatan katalog obat, pemantauan tanggal kadaluarsa (batch expiry tracking), peracikan resep obat ber-etiket, transaksi kasir Point of Sale (POS), dan laporan laba-rugi keuangan secara real-time.

---

## 2. Rincian Pemanfaatan Berdasarkan Role Pengguna

| Role Pengguna | Workflow Utama | Fitur Teruji | Status Verification | Live Evidence Ref |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator / Owner** | Supervisi Bisnis & Keuangan | Pengaturan Profil Apotek, Kelola User, Laba Rugi | **OPERATIONAL VERIFIED** | `/dashboard`, `/reports` |
| **Operator / Apoteker** | Pengelolaan Stok & Kadaluarsa | Master Obat, Batch Expiry, Resep Racikan, Etiket | **OPERATIONAL VERIFIED** | `/medicines`, `/prescriptions` |
| **Kasir** | Pelayanan Transaksi Penjualan | Kasir POS, Cetak Struk/Nota, Riwayat Transaksi | **OPERATIONAL VERIFIED** | `/pos` |

---

## 3. Privasi & Keamanan Data

Sistem telah menerapkan standar keamanan data transaksi ritel farmasi dan kerahasiaan resep pasien. Hak akses kasir dibatasi pada penjualan POS, sedangkan laporan keuangan dan data profil apotek dikunci di bawah otorisasi administrator.

