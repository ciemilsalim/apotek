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
            border-bottom: 2px solid #059669;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }
        .header-table {
            width: 100%;
        }
        .brand-title {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
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
            font-size: 13px;
            font-weight: bold;
            margin-top: 2px;
        }
        .val-income { color: #059669; }
        .val-cogs { color: #d97706; }
        .val-profit { color: #0284c7; }
        .val-net { color: #16a34a; }
        .val-expense { color: #dc2626; }

        .section-title {
            font-size: 10.5px;
            font-weight: bold;
            color: #1e293b;
            margin-top: 14px;
            margin-bottom: 6px;
            text-transform: uppercase;
            border-left: 3px solid #059669;
            padding-left: 6px;
        }

        .statement-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }
        .statement-table th {
            background-color: #059669;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 5px 8px;
            font-size: 8.5px;
            text-transform: uppercase;
        }
        .statement-table td {
            padding: 5px 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 9px;
        }
        .row-header {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #334155;
        }
        .row-subtotal {
            font-weight: bold;
            background-color: #f8fafc;
        }
        .row-grandtotal {
            font-weight: bold;
            background-color: #e0f2fe;
            border-top: 2px solid #0284c7;
            border-bottom: 2px solid #0284c7;
            font-size: 10px;
        }
        .pl-indent {
            padding-left: 20px !important;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .sign-table {
            width: 100%;
            margin-top: 20px;
        }
        .sign-table td {
            width: 50%;
            text-align: center;
            font-size: 9px;
        }
        .sign-space {
            height: 48px;
        }

        .footer {
            margin-top: 18px;
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
                    <div class="brand-subtitle">Sistem Informasi Farmasi & Laporan Keuangan Terpadu</div>
                    <div class="report-title">{{ $title }}</div>
                </td>
                <td style="width: 40%;" class="meta-text">
                    <div>Periode: <strong>{{ $startDate }} - {{ $endDate }}</strong></div>
                    <div>Dicetak: <strong>{{ $generatedAt }}</strong></div>
                    <div>Oleh: <strong>{{ $generatedBy }}</strong></div>
                    <div>Sifat: <strong>Laporan Keuangan Resmi</strong></div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Summary Box -->
    <table class="summary-box">
        <tr>
            <td style="width: 25%;">
                <div class="summary-label">Pendapatan Penjualan</div>
                <div class="summary-value val-income">Rp {{ number_format($netSales, 0, ',', '.') }}</div>
                <div style="font-size: 7.5px; color: #64748b; margin-top: 2px;">{{ number_format($totalTransactions) }} Transaksi ({{ number_format($totalQtySold) }} Unit)</div>
            </td>
            <td style="width: 25%;">
                <div class="summary-label">HPP (Modal Obat Terjual)</div>
                <div class="summary-value val-cogs">Rp {{ number_format($cogs, 0, ',', '.') }}</div>
                <div style="font-size: 7.5px; color: #64748b; margin-top: 2px;">Biaya Pokok Perolehan</div>
            </td>
            <td style="width: 25%;">
                <div class="summary-label">Laba Kotor (Gross Profit)</div>
                <div class="summary-value val-profit">Rp {{ number_format($grossProfit, 0, ',', '.') }}</div>
                <div style="font-size: 7.5px; color: #0284c7; font-weight: bold; margin-top: 2px;">Margin: {{ $grossProfitMargin }}%</div>
            </td>
            <td style="width: 25%;">
                <div class="summary-label">Laba Bersih (Net Income)</div>
                <div class="summary-value {{ $netOperatingProfit >= 0 ? 'val-net' : 'val-expense' }}">
                    Rp {{ number_format($netOperatingProfit, 0, ',', '.') }}
                </div>
                <div style="font-size: 7.5px; font-weight: bold; color: {{ $netOperatingProfit >= 0 ? '#16a34a' : '#dc2626' }}; margin-top: 2px;">
                    Margin: {{ $netProfitMargin }}%
                </div>
            </td>
        </tr>
    </table>

    <div class="section-title">Laporan Laba Rugi Komprehensif (Income Statement)</div>

    <table class="statement-table">
        <thead>
            <tr>
                <th style="width: 70%;">Pos Akun / Keterangan</th>
                <th style="width: 30%;" class="text-right">Jumlah (Rp)</th>
            </tr>
        </thead>
        <tbody>
            <!-- I. PENDAPATAN -->
            <tr class="row-header">
                <td colspan="2">I. PENDAPATAN PENJUALAN</td>
            </tr>
            <tr>
                <td class="pl-indent">Penjualan Kotor Obat (Gross Sales)</td>
                <td class="text-right">{{ number_format($grossSales, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="pl-indent">Potongan & Diskon Penjualan</td>
                <td class="text-right" style="color: #dc2626;">({{ number_format($totalDiscount, 0, ',', '.') }})</td>
            </tr>
            <tr class="row-subtotal">
                <td><strong>TOTAL PENDAPATAN PENJUALAN BERSIH</strong></td>
                <td class="text-right" style="color: #059669;"><strong>{{ number_format($netSales, 0, ',', '.') }}</strong></td>
            </tr>
            @if ($otherIncome > 0)
                <tr>
                    <td class="pl-indent">Pendapatan Operasional Lainnya (Jasa Racik / Medis)</td>
                    <td class="text-right">{{ number_format($otherIncome, 0, ',', '.') }}</td>
                </tr>
                <tr class="row-subtotal">
                    <td><strong>TOTAL PENDAPATAN OPERASIONAL</strong></td>
                    <td class="text-right" style="color: #059669;"><strong>{{ number_format($totalRevenue, 0, ',', '.') }}</strong></td>
                </tr>
            @endif

            <!-- II. HPP -->
            <tr class="row-header">
                <td colspan="2">II. HARGA POKOK PENJUALAN (HPP / COGS)</td>
            </tr>
            <tr>
                <td class="pl-indent">Beban Pokok Obat Terjual (Modal Pembelian Obat)</td>
                <td class="text-right" style="color: #d97706;">({{ number_format($cogs, 0, ',', '.') }})</td>
            </tr>
            <tr class="row-subtotal" style="background-color: #f0fdf4;">
                <td><strong>LABA KOTOR (GROSS PROFIT) [Margin: {{ $grossProfitMargin }}%]</strong></td>
                <td class="text-right" style="color: #0284c7;"><strong>{{ number_format($grossProfit, 0, ',', '.') }}</strong></td>
            </tr>

            <!-- III. BEBAN OPERASIONAL -->
            <tr class="row-header">
                <td colspan="2">III. BEBAN OPERASIONAL (OPERATING EXPENSES / OPEX)</td>
            </tr>
            @forelse ($opexDetails as $opex)
                <tr>
                    <td class="pl-indent">Beban {{ $opex['label'] }}</td>
                    <td class="text-right" style="color: #dc2626;">({{ number_format($opex['amount'], 0, ',', '.') }})</td>
                </tr>
            @empty
                <tr>
                    <td class="pl-indent" style="color: #94a3b8; font-style: italic;">Tidak ada beban operasional tercatat pada periode ini.</td>
                    <td class="text-right">0</td>
                </tr>
            @endforelse
            <tr class="row-subtotal">
                <td><strong>TOTAL BEBAN OPERASIONAL</strong></td>
                <td class="text-right" style="color: #dc2626;"><strong>({{ number_format($totalOpex, 0, ',', '.') }})</strong></td>
            </tr>

            <!-- IV. LABA BERSIH -->
            <tr class="row-grandtotal">
                <td><strong>LABA OPERASIONAL BERSIH (NET INCOME) [Margin: {{ $netProfitMargin }}%]</strong></td>
                <td class="text-right" style="color: {{ $netOperatingProfit >= 0 ? '#15803d' : '#b91c1c' }};">
                    <strong>{{ number_format($netOperatingProfit, 0, ',', '.') }}</strong>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Top 5 Medicines -->
    @if (count($topMedicines) > 0)
        <div class="section-title">5 Obat Penyumbang Laba Kotor Terbesar</div>
        <table class="statement-table">
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 35%;">Nama Obat</th>
                    <th style="width: 12%;" class="text-center">Qty Terjual</th>
                    <th style="width: 16%;" class="text-right">Pendapatan (Rp)</th>
                    <th style="width: 16%;" class="text-right">HPP Modal (Rp)</th>
                    <th style="width: 16%;" class="text-right">Laba Kotor (Rp)</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($topMedicines as $index => $item)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td><strong>{{ $item->medicine_name }}</strong> <span style="color: #64748b; font-size: 8px;">({{ $item->category_name ?? '-' }})</span></td>
                        <td class="text-center">{{ number_format($item->qty_sold) }}</td>
                        <td class="text-right">{{ number_format($item->revenue, 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($item->cogs, 0, ',', '.') }}</td>
                        <td class="text-right" style="color: #0284c7; font-weight: bold;">{{ number_format($item->profit, 0, ',', '.') }} ({{ $item->margin }}%)</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

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
                <div><strong>Bagian Keuangan & Administrasi</strong></div>
                <div class="sign-space"></div>
                <div>( <strong>{{ $generatedBy }}</strong> )</div>
                <div style="color: #64748b; font-size: 8px;">Apotek Sehat</div>
            </td>
        </tr>
    </table>

    <div class="footer">
        Dokumen Laporan Laba Rugi dihasilkan otomatis oleh Sistem Informasi Farmasi Apotek Sehat pada {{ $generatedAt }}.
    </div>
</body>
</html>
