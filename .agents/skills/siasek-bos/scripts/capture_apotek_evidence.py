import sys
import os
import argparse
import time
from playwright.sync_api import sync_playwright

def capture_apotek(year=2026, month_num="10", month_slug="oktober", app_url="http://apotek.test", email="admin@apotek.test", password="password", custom_output_dir=None):
    project_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
    if custom_output_dir:
        target_ss_dir = os.path.abspath(custom_output_dir)
    else:
        target_ss_dir = os.path.join(project_dir, f"evidence/billing/{year}/{month_num}-{month_slug}/04_screenshots")
    global_ss_dir = os.path.join(project_dir, "evidence/screenshots")
    
    os.makedirs(target_ss_dir, exist_ok=True)
    os.makedirs(global_ss_dir, exist_ok=True)

    evidence_routes = [
        {"file": "bukti_01_pos.png", "route": "/pos", "title": "Kasir Point of Sale (POS)"},
        {"file": "bukti_02_medicines.png", "route": "/medicines", "title": "Katalog Obat & Batch Kadaluarsa"},
        {"file": "bukti_03_prescriptions.png", "route": "/prescriptions", "title": "Resep Dokter & Obat Racikan"},
        {"file": "bukti_04_reports.png", "route": "/reports/profit-loss", "title": "Laporan Arus Kas & Laba Rugi"},
        {"file": "bukti_05_dashboard.png", "route": "/dashboard", "title": "Dashboard Eksekutif & Ringkasan Penjualan"}
    ]

    print(f"[CAPTURE] Starting screenshot capture for Apotek ({app_url})...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            device_scale_factor=1
        )
        context.add_init_script("""
            try {
                localStorage.setItem('apotek_tour_pos', 'true');
                localStorage.setItem('apotek_tour_medicines', 'true');
                localStorage.setItem('apotek_tour_dashboard', 'true');
                localStorage.setItem('apotek_tour_default', 'true');
            } catch(e) {}
        """)
        page = context.new_page()

        # Login
        login_url = f"{app_url.rstrip('/')}/login"
        print(f"[CAPTURE] Navigating to {login_url}")
        page.goto(login_url, wait_until="networkidle")
        
        # Click Admin role card or fill inputs
        try:
            admin_btn = page.get_by_text("Admin Apotek")
            if admin_btn.count() > 0:
                admin_btn.first.click()
                time.sleep(0.3)
            else:
                page.fill('input[name="email"]', email)
                page.fill('input[name="password"]', password)
        except Exception:
            page.fill('input[name="email"]', email)
            page.fill('input[name="password"]', password)

        submit_btn = page.get_by_role("button", name="Masuk ke Sistem Apotek")
        if submit_btn.count() > 0:
            submit_btn.click()
        else:
            page.click('button[type="submit"]')

        # Wait for redirect to dashboard
        try:
            page.wait_for_url("**/dashboard", timeout=10000)
        except Exception:
            page.wait_for_load_state("networkidle")
            time.sleep(2)

        print(f"[CAPTURE] Login verified. Current URL: {page.url}")

        captured = []
        for ev in evidence_routes:
            url = f"{app_url.rstrip('/')}{ev['route']}"
            print(f"[CAPTURE] Visiting {url}...")
            page.goto(url, wait_until="networkidle")
            time.sleep(1.2) # Wait for cards, tables, charts to render

            target_path = os.path.join(target_ss_dir, ev["file"])
            global_path = os.path.join(global_ss_dir, ev["file"])

            page.screenshot(path=target_path, full_page=False)
            page.screenshot(path=global_path, full_page=False)

            if os.path.exists(target_path) and os.path.getsize(target_path) > 0:
                print(f"[OK] Saved: {ev['file']} ({os.path.getsize(target_path)} bytes)")
                captured.append(ev["file"])
            else:
                print(f"[FAIL] Could not capture {ev['file']}")

        browser.close()
        print(f"[CAPTURE] Completed. Total {len(captured)}/{len(evidence_routes)} screenshots saved.")
        return len(captured) == len(evidence_routes)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--year", default=2026, type=int)
    parser.add_argument("--month-num", default="10")
    parser.add_argument("--month-slug", default="oktober")
    parser.add_argument("--app-url", default="http://apotek.test")
    parser.add_argument("--email", default="admin@apotek.test")
    parser.add_argument("--password", default="password")
    parser.add_argument("--output-dir", default=None)
    args = parser.parse_args()

    success = capture_apotek(
        year=args.year,
        month_num=args.month_num,
        month_slug=args.month_slug,
        app_url=args.app_url,
        email=args.email,
        password=args.password,
        custom_output_dir=args.output_dir
    )
    sys.exit(0 if success else 1)
