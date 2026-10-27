<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockAdjustment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Roles & Users
        $admin = User::updateOrCreate(
            ['email' => 'admin@apotek.test'],
            [
                'name' => 'Budi Santoso (Admin)',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '081234567890',
                'is_active' => true,
            ]
        );

        $operator = User::updateOrCreate(
            ['email' => 'operator@apotek.test'],
            [
                'name' => 'Dewi Lestari (Operator)',
                'password' => Hash::make('password'),
                'role' => 'operator',
                'phone' => '081234567891',
                'is_active' => true,
            ]
        );

        $kasir = User::updateOrCreate(
            ['email' => 'kasir@apotek.test'],
            [
                'name' => 'Rian Pratama (Kasir)',
                'password' => Hash::make('password'),
                'role' => 'kasir',
                'phone' => '081234567892',
                'is_active' => true,
            ]
        );

        // 2. Categories
        $categoriesData = [
            [
                'name' => 'Analgesik & Antipiretik',
                'description' => 'Obat pereda nyeri dan penurun demam',
            ],
            [
                'name' => 'Antibiotik',
                'description' => 'Obat untuk mengatasi infeksi bakteri',
            ],
            [
                'name' => 'Vitamin & Suplemen',
                'description' => 'Suplemen daya tahan tubuh dan nutrisi',
            ],
            [
                'name' => 'Obat Batuk & Flu',
                'description' => 'Pereda gejala flu, batuk berdahak, dan batuk kering',
            ],
            [
                'name' => 'Saluran Cerna & Lambung',
                'description' => 'Antasida, obat maag, antidiare, dan pencernaan',
            ],
            [
                'name' => 'Salep & Obat Luar',
                'description' => 'Antiseptik luka, salep gatal, dan analgesik oles',
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['name']] = Category::firstOrCreate(
                ['slug' => Str::slug($cat['name'])],
                ['name' => $cat['name'], 'description' => $cat['description']]
            );
        }

        // 3. Medicines
        $medicinesData = [
            [
                'category' => 'Analgesik & Antipiretik',
                'code' => 'OBT-001',
                'name' => 'Paracetamol 500mg',
                'generic_name' => 'Paracetamol',
                'unit' => 'Strip',
                'buy_price' => 3500,
                'sell_price' => 6000,
                'stock' => 85,
                'min_stock' => 20,
                'expiry_date' => Carbon::now()->addMonths(18)->format('Y-m-d'),
                'location' => 'Rak A-1',
                'description' => 'Meredakan sakit kepala, sakit gigi, dan demam.',
            ],
            [
                'category' => 'Analgesik & Antipiretik',
                'code' => 'OBT-002',
                'name' => 'Ibuprofen 400mg',
                'generic_name' => 'Ibuprofen',
                'unit' => 'Strip',
                'buy_price' => 5000,
                'sell_price' => 8500,
                'stock' => 50,
                'min_stock' => 15,
                'expiry_date' => Carbon::now()->addMonths(12)->format('Y-m-d'),
                'location' => 'Rak A-2',
                'description' => 'Antiinflamasi dan pereda nyeri sendi / otot.',
            ],
            [
                'category' => 'Antibiotik',
                'code' => 'OBT-003',
                'name' => 'Amoxicillin 500mg',
                'generic_name' => 'Amoxicillin Trihydrate',
                'unit' => 'Strip',
                'buy_price' => 6000,
                'sell_price' => 10000,
                'stock' => 35,
                'min_stock' => 15,
                'expiry_date' => Carbon::now()->addMonths(14)->format('Y-m-d'),
                'location' => 'Rak B-1',
                'description' => 'Antibiotik spektrum luas resep dokter.',
            ],
            [
                'category' => 'Vitamin & Suplemen',
                'code' => 'OBT-004',
                'name' => 'Vitamin C 500mg Enervon-C',
                'generic_name' => 'Ascorbic Acid + Vit B Complex',
                'unit' => 'Strip',
                'buy_price' => 7000,
                'sell_price' => 11000,
                'stock' => 60,
                'min_stock' => 20,
                'expiry_date' => Carbon::now()->addMonths(24)->format('Y-m-d'),
                'location' => 'Rak C-1',
                'description' => 'Menjaga daya tahan tubuh dan kebugaran harian.',
            ],
            [
                'category' => 'Obat Batuk & Flu',
                'code' => 'OBT-005',
                'name' => 'OBH Tropica Plus Anak 60ml',
                'generic_name' => 'Succus Liquiritiae, Paracetamol, Pseudoephedrine',
                'unit' => 'Botol',
                'buy_price' => 14000,
                'sell_price' => 20000,
                'stock' => 18,
                'min_stock' => 10,
                'expiry_date' => Carbon::now()->addMonths(10)->format('Y-m-d'),
                'location' => 'Rak D-1',
                'description' => 'Sirup batuk flu rasa jeruk untuk anak-anak.',
            ],
            [
                'category' => 'Saluran Cerna & Lambung',
                'code' => 'OBT-006',
                'name' => 'Mylanta Tablet Kunyah',
                'generic_name' => 'Aluminium Hidroksida, Magnesium Hidroksida',
                'unit' => 'Strip',
                'buy_price' => 8500,
                'sell_price' => 13500,
                'stock' => 25,
                'min_stock' => 15,
                'expiry_date' => Carbon::now()->addMonths(16)->format('Y-m-d'),
                'location' => 'Rak E-1',
                'description' => 'Meredakan sakit maag, asam lambung berlebih, dan kembung.',
            ],
            [
                'category' => 'Salep & Obat Luar',
                'code' => 'OBT-007',
                'name' => 'Betadine Antiseptic Solution 30ml',
                'generic_name' => 'Povidone Iodine 10%',
                'unit' => 'Botol',
                'buy_price' => 18000,
                'sell_price' => 25000,
                'stock' => 12,
                'min_stock' => 10,
                'expiry_date' => Carbon::now()->addMonths(30)->format('Y-m-d'),
                'location' => 'Rak F-1',
                'description' => 'Cairan antiseptik pembersih luka dan pencegah infeksi.',
            ],
            [
                'category' => 'Vitamin & Suplemen',
                'code' => 'OBT-008',
                'name' => 'Imboost Force Tablet',
                'generic_name' => 'Echinacea purpurea extract, Zinc Picolinate',
                'unit' => 'Strip',
                'buy_price' => 38000,
                'sell_price' => 48000,
                'stock' => 5, // sengaja dibuat menipis untuk visual alert
                'min_stock' => 10,
                'expiry_date' => Carbon::now()->addMonths(8)->format('Y-m-d'),
                'location' => 'Rak C-2',
                'description' => 'Suplemen peningkat imun tubuh dosis tinggi.',
            ],
        ];

        $createdMedicines = [];
        foreach ($medicinesData as $m) {
            $catId = $categories[$m['category']]->id;
            $createdMedicines[$m['code']] = Medicine::firstOrCreate(
                ['code' => $m['code']],
                [
                    'category_id' => $catId,
                    'name' => $m['name'],
                    'generic_name' => $m['generic_name'],
                    'unit' => $m['unit'],
                    'buy_price' => $m['buy_price'],
                    'sell_price' => $m['sell_price'],
                    'stock' => $m['stock'],
                    'min_stock' => $m['min_stock'],
                    'expiry_date' => $m['expiry_date'],
                    'location' => $m['location'],
                    'description' => $m['description'],
                ]
            );

            // Initial stock adjustment record
            StockAdjustment::firstOrCreate(
                [
                    'medicine_id' => $createdMedicines[$m['code']]->id,
                    'notes' => 'Stok awal sistem apotek',
                ],
                [
                    'user_id' => $operator->id,
                    'type' => 'in',
                    'quantity' => $m['stock'],
                    'stock_before' => 0,
                    'stock_after' => $m['stock'],
                ]
            );
        }

        // 4. Sample Sales (Transactions) for reporting
        $sampleSales = [
            [
                'invoice_number' => 'INV-20261025-0001',
                'user_id' => $kasir->id,
                'customer_name' => 'Ahmad Fauzi',
                'created_at' => Carbon::now()->subDays(2)->setHour(9)->setMinute(15),
                'payment_method' => 'cash',
                'items' => [
                    ['code' => 'OBT-001', 'qty' => 2], // Paracetamol
                    ['code' => 'OBT-004', 'qty' => 1], // Enervon-C
                ],
            ],
            [
                'invoice_number' => 'INV-20261026-0002',
                'user_id' => $kasir->id,
                'customer_name' => 'Siti Nurhaliza',
                'created_at' => Carbon::now()->subDays(1)->setHour(14)->setMinute(30),
                'payment_method' => 'qris',
                'items' => [
                    ['code' => 'OBT-006', 'qty' => 1], // Mylanta
                    ['code' => 'OBT-007', 'qty' => 1], // Betadine
                ],
            ],
            [
                'invoice_number' => 'INV-20261027-0003',
                'user_id' => $kasir->id,
                'customer_name' => 'Hendra Wijaya',
                'created_at' => Carbon::now()->setHour(10)->setMinute(5),
                'payment_method' => 'cash',
                'items' => [
                    ['code' => 'OBT-001', 'qty' => 3], // Paracetamol
                    ['code' => 'OBT-005', 'qty' => 1], // OBH Tropica
                ],
            ],
        ];

        foreach ($sampleSales as $saleData) {
            $subtotal = 0;
            $itemsToCreate = [];

            foreach ($saleData['items'] as $item) {
                $med = $createdMedicines[$item['code']];
                $itemSubtotal = $med->sell_price * $item['qty'];
                $subtotal += $itemSubtotal;
                $itemsToCreate[] = [
                    'medicine_id' => $med->id,
                    'medicine_name' => $med->name,
                    'medicine_code' => $med->code,
                    'unit' => $med->unit,
                    'price' => $med->sell_price,
                    'quantity' => $item['qty'],
                    'subtotal' => $itemSubtotal,
                ];
            }

            $discount = 0;
            $totalAmount = $subtotal - $discount;
            $cashPaid = $saleData['payment_method'] === 'cash' ? ceil($totalAmount / 10000) * 10000 : $totalAmount;
            $changeAmount = $cashPaid - $totalAmount;

            $sale = Sale::firstOrCreate(
                ['invoice_number' => $saleData['invoice_number']],
                [
                    'user_id' => $saleData['user_id'],
                    'customer_name' => $saleData['customer_name'],
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'total_amount' => $totalAmount,
                    'payment_method' => $saleData['payment_method'],
                    'cash_paid' => $cashPaid,
                    'change_amount' => $changeAmount,
                    'notes' => 'Pembelian langsung di apotek',
                    'created_at' => $saleData['created_at'],
                    'updated_at' => $saleData['created_at'],
                ]
            );

            foreach ($itemsToCreate as $it) {
                SaleItem::firstOrCreate(
                    [
                        'sale_id' => $sale->id,
                        'medicine_id' => $it['medicine_id'],
                    ],
                    $it
                );
            }
        }
    }
}
