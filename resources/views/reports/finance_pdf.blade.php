<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 10px;
            line-height: 1.4;
            margin: 0;
            padding: 10px;
        }
        .header {
            border-bottom: 2px solid #0284c7;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }
        .header-table {
            width: 100%;
        }
        .brand-title {
            font-size: 18px;
            font-weight: bold;
            color: #0284c7;
            letter-spacing: -0.5px;
        }
        .brand-subtitle {
            font-size: 9px;
            color: #64748b;
        }
        .report-title {
            font-size: 12px;
            font-weight: bold;
            color: #0f172a;
            margin-top: 4px;
        }
        .meta-text {
            font-size: 9px;
            color: #64748b;
            text-align: right;
        }
        .summary-box {
            width: 100%;
            margin-bottom: 14px;
            border-collapse: collapse;
        }
        .summary-box td {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 8px 10px;
            text-align: center;
        }
        .summary-label {
            font-size: 8px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: bold;
        }
        .summary-value {
            font-size: 12px;
            font-weight: bold;
            margin-top: 2px;
        }
        .val-income { color: #059669; }
        .val-expense { color: #dc2626; }
        .val-net { color: #0284c7; }

        .section-title {
            font-size: 11px;
            font-weight: bold;
            color: #334155;
            margin-bottom: 6px;
            text-transform: uppercase;
            border-left: 3px solid #0284c7;
            padding-left: 6px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }
        .data-table th {
            background-color: #0284c7;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 5px 6px;
            font-size: 8.5px;
            text-transform: uppercase;
        }
        .data-table td {
            padding: 5px 6px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 9px;
        }
        .data-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .badge-income {
            display: inline-block;
            padding: 2px 5px;
            font-size: 8px;
            font-weight: bold;
            border-radius: 3px;
            background-color: #dcfce7;
            color: #15803d;
        }
        .badge-expense {
            display: inline-block;
            padding: 2px 5px;
            font-size: 8px;
            font-weight: bold;
            border-radius: 3px;
            background-color: #fee2e2;
            color: #b91c1c;
        }

        .sign-table {
            width: 100%;
            margin-top: 24px;
        }
        .sign-table td {
            width: 50%;
            text-align: center;
            font-size: 9px;
        }
        .sign-space {
            height: 50px;
        }

        .footer {
            margin-top: 20px;
            padding-top: 8px;
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
                    <div class="brand-subtitle">Sistem Manajemen Keuangan & Arus Kas Farmasi</div>
                    <div class="report-title">{{ $title }}</div>
                </td>
                <td style="width: 40%;" class="meta-text">
                    <div>Periode: <strong>{{ $startDate }} - {{ $endDate }}</strong></div>
                    <div>Dicetak: <strong>{{ $generatedAt }}</strong></div>
                    <div>Oleh: <strong>{{ $generatedBy }}</strong></div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Summary Box -->
    <table class="summary-box">
        <tr>
            <td style="width: 25%;">
                <div class="summary-label">Penjualan Obat (POS)</div>
                <div class="summary-value val-income">Rp {{ number_format($totalSales, 0, ',', '.') }}</div>
                <div style="font-size: 7.5px; color: #64748b; margin-top: 2px;">
                    Tunai: Rp {{ number_format($salesCash, 0, ',', '.') }} | Non-Tunai: Rp {{ number_format($salesNonCash, 0, ',', '.') }}
                </div>
            </td>
            <td style="width: 25%;">
                <div class="summary-label">Pemasukan Lain</div>
                <div class="summary-value val-income">Rp {{ number_format($totalOtherIncome, 0, ',', '.') }}</div>
                <div style="font-size: 7.5px; color: #64748b; margin-top: 2px;">Modal & Pendapatan Lain</div>
            </td>
            <td style="width: 25%;">
                <div class="summary-label">Total Pengeluaran</div>
                <div class="summary-value val-expense">Rp {{ number_format($totalExpense, 0, ',', '.') }}</div>
                <div style="font-size: 7.5px; color: #64748b; margin-top: 2px;">PBF & Operasional</div>
            </td>
            <td style="width: 25%;">
                <div class="summary-label">Arus Kas Bersih (Surplus)</div>
                <div class="summary-value {{ $netCashFlow >= 0 ? 'val-net' : 'val-expense' }}">
                    Rp {{ number_format($netCashFlow, 0, ',', '.') }}
                </div>
                <div style="font-size: 7.5px; color: #64748b; margin-top: 2px;">Total Masuk - Total Keluar</div>
            </td>
        </tr>
    </table>

    <div class="section-title">Daftar Transaksi Arus Kas Operasional</div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 14%;">No. Bukti</th>
                <th style="width: 11%;">Tanggal</th>
                <th style="width: 12%;">Jenis</th>
                <th style="width: 18%;">Kategori</th>
                <th style="width: 14%;" class="text-right">Nominal (Rp)</th>
                <th style="width: 10%;" class="text-center">Metode</th>
                <th style="width: 16%;">Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($transactions as $index => $trx)
                @php
                    $typeCat = $categories[$trx->type] ?? [];
                    $catLabel = $typeCat[$trx->category] ?? $trx->category;
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td><strong>{{ $trx->transaction_number }}</strong></td>
                    <td>{{ $trx->transaction_date->format('d/m/Y') }}</td>
                    <td>
                        @if ($trx->type === 'income')
                            <span class="badge-income">Pemasukan</span>
                        @else
                            <span class="badge-expense">Pengeluaran</span>
                        @endif
                    </td>
                    <td>{{ $catLabel }}</td>
                    <td class="text-right"><strong>{{ number_format($trx->amount, 0, ',', '.') }}</strong></td>
                    <td class="text-center">{{ strtoupper($trx->payment_method) }}</td>
                    <td>{{ $trx->description ?? ($trx->reference_number ? 'Ref: ' . $trx->reference_number : '-') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="text-center" style="padding: 15px; color: #94a3b8;">
                        Tidak ada transaksi keuangan operasional tercatat pada periode ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Tanda Tangan -->
    <table class="sign-table">
        <tr>
            <td>
                <div>Mengetahui,</div>
                <div><strong>Apoteker Pengelola Apotek (APA)</strong></div>
                <div class="sign-space"></div>
                <div>( .................................................. )</div>
                <div style="color: #64748b; font-size: 8px;">SIPA: .......................................</div>
            </td>
            <td>
                <div>Dibuat Oleh,</div>
                <div><strong>Bagian Keuangan & Kasir</strong></div>
                <div class="sign-space"></div>
                <div>( <strong>{{ $generatedBy }}</strong> )</div>
                <div style="color: #64748b; font-size: 8px;">Apotek Sehat</div>
            </td>
        </tr>
    </table>

    <div class="footer">
        Dicetak secara otomatis oleh Sistem Apotek Sehat pada {{ $generatedAt }}. Dokumen ini merupakan rekapitulasi buku kas dan transaksi resmi.
    </div>
</body>
</html>
