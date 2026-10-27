<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 10px;
        }
        .header {
            border-bottom: 2px solid #059669;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }
        .header-table {
            width: 100%;
        }
        .brand-title {
            font-size: 20px;
            font-weight: bold;
            color: #059669;
            letter-spacing: -0.5px;
        }
        .brand-subtitle {
            font-size: 10px;
            color: #64748b;
        }
        .report-title {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            margin-top: 6px;
        }
        .meta-text {
            font-size: 9px;
            color: #64748b;
            text-align: right;
        }
        .summary-box {
            width: 100%;
            margin-bottom: 16px;
            border-collapse: collapse;
        }
        .summary-box td {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            text-align: center;
        }
        .summary-label {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: bold;
        }
        .summary-value {
            font-size: 14px;
            font-weight: bold;
            color: #059669;
            margin-top: 2px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .data-table th {
            background-color: #059669;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 6px 8px;
            font-size: 9px;
            text-transform: uppercase;
        }
        .data-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10px;
        }
        .data-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .badge {
            display: inline-block;
            padding: 2px 5px;
            font-size: 8px;
            font-weight: bold;
            border-radius: 3px;
            background-color: #e2e8f0;
            color: #334155;
            text-transform: uppercase;
        }
        .footer {
            margin-top: 24px;
            padding-top: 10px;
            border-top: 1px dashed #cbd5e1;
            font-size: 8px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="header">
        <table class="header-table">
            <tr>
                <td style="width: 60%;">
                    <div class="brand-title">APOTEK SEHAT</div>
                    <div class="brand-subtitle">Sistem Informasi Farmasi & Manajemen Obat Terpadu</div>
                    <div class="report-title">{{ $title }}</div>
                </td>
                <td style="width: 40%;" class="meta-text">
                    <div>Dicetak pada: <strong>{{ $generatedAt }}</strong></div>
                    <div>Oleh: <strong>{{ $generatedBy }}</strong></div>
                    <div>Status Dokumen: <strong>Resmi & Sah</strong></div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Summary cards -->
    <table class="summary-box">
        <tr>
            <td style="width: 33%;">
                <div class="summary-label">Total Transaksi</div>
                <div class="summary-value">{{ number_format($totalTransactions) }}</div>
            </td>
            <td style="width: 33%;">
                <div class="summary-label">Obat Terjual (Unit)</div>
                <div class="summary-value">{{ number_format($totalItemsSold) }}</div>
            </td>
            <td style="width: 34%;">
                <div class="summary-label">Total Pendapatan</div>
                <div class="summary-value">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</div>
            </td>
        </tr>
    </table>

    <!-- Detail table -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;" class="text-center">No</th>
                <th style="width: 20%;">No. Faktur</th>
                <th style="width: 14%;">Waktu</th>
                <th style="width: 16%;">Kasir</th>
                <th style="width: 18%;">Pelanggan</th>
                <th style="width: 10%;" class="text-center">Metode</th>
                <th style="width: 17%;" class="text-right">Total Akhir</th>
            </tr>
        </thead>
        <tbody>
            @forelse($sales as $index => $sale)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td><strong>{{ $sale->invoice_number }}</strong></td>
                    <td>{{ $sale->created_at->format('d/m/Y H:i') }}</td>
                    <td>{{ $sale->user->name ?? '-' }}</td>
                    <td>{{ $sale->customer_name }}</td>
                    <td class="text-center">
                        <span class="badge">{{ $sale->payment_method }}</span>
                    </td>
                    <td class="text-right"><strong>Rp {{ number_format($sale->total_amount, 0, ',', '.') }}</strong></td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center" style="padding: 16px; color: #64748b;">
                        Tidak ada data transaksi penjualan pada periode ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
        @if($sales->count() > 0)
        <tfoot>
            <tr style="background-color: #f1f5f9; font-weight: bold;">
                <td colspan="6" class="text-right" style="padding: 8px;">TOTAL KESELURUHAN:</td>
                <td class="text-right" style="padding: 8px; color: #059669; font-size: 11px;">
                    Rp {{ number_format($totalRevenue, 0, ',', '.') }}
                </td>
            </tr>
        </tfoot>
        @endif
    </table>

    <div class="footer">
        <table style="width: 100%;">
            <tr>
                <td>Laporan ini di-generate otomatis oleh Sistem Apotek Sehat.</td>
                <td class="text-right">Halaman 1 / 1</td>
            </tr>
        </table>
    </div>
</body>
</html>
