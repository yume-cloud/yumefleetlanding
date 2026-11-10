"""Скрипт проверки формы лендинга и Meta CAPI (Playwright)."""

import json
import subprocess
import time
import urllib.parse
from pathlib import Path

from playwright.sync_api import sync_playwright

LANDING_DIR = Path("/Users/sungat01/yumefleetlanding-wt/lead-utm")
PORT = 4199


def main():
    # 1. Запуск http.server
    srv = subprocess.Popen(
        ["python3", "-m", "http.server", str(PORT)],
        cwd=str(LANDING_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    time.sleep(1)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()

            # Добавляем cookie _fbp
            context.add_cookies(
                [
                    {
                        "name": "_fbp",
                        "value": "fb.1.1710000000.999888777",
                        "domain": "localhost",
                        "path": "/",
                    }
                ]
            )

            page = context.new_page()

            captured_payload = {}
            fbq_calls = []

            # Перехват и логирование вызовов fbq
            page.add_init_script(
                """
                window._fbqCalls = [];
                window.fbq = function(...args) {
                    console.log('[fbq called]', JSON.stringify(args));
                    window._fbqCalls.push(args);
                };
            """
            )

            def handle_route(route):
                req = route.request
                post_data = req.post_data
                parsed = urllib.parse.parse_qs(post_data)
                # parse_qs возвращает списки, разворачиваем в одиночные строки
                for k, v in parsed.items():
                    captured_payload[k] = v[0] if len(v) == 1 else v
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    headers={"Access-Control-Allow-Origin": "*"},
                    body=json.dumps({"ok": True}),
                )

            def on_console(msg):
                txt = msg.text
                print(f"[CONSOLE {msg.type}] {txt}")
                if txt.startswith("[fbq called] "):
                    try:
                        args = json.loads(txt[len("[fbq called] "):])
                        fbq_calls.append(args)
                    except Exception:
                        pass

            page.on("console", on_console)
            page.on("pageerror", lambda err: print(f"[PAGE ERROR] {err}"))
            page.route("**/api/lead/", handle_route)

            url = f"http://localhost:{PORT}/?fbclid=IwAR123456789TestFbclid&utm_source=meta&utm_campaign=winter2026"
            print(f"Открытие страницы: {url}")
            page.goto(url, wait_until="domcontentloaded")

            # Заполнение формы
            page.fill("#name", "Тестовый Водитель")
            page.fill("#phone", "77015551234")
            page.wait_for_timeout(300)

            print("Нажатие кнопки 'Отправить'...")
            page.click("button[type=submit]")

            # Ждём завершения запроса и вызова fbq
            page.wait_for_timeout(1000)

            if not fbq_calls:
                try:
                    fbq_calls = page.evaluate("() => window._fbqCalls || []")
                except Exception:
                    pass

            print("\n=== ПЕРЕХВАЧЕННЫЙ ЗАПРОС В /api/lead/ ===")
            print(json.dumps(captured_payload, indent=2, ensure_ascii=False))

            print("\n=== ПЕРЕХВАЧЕННЫЕ ВЫЗОВЫ fbq ===")
            print(json.dumps(fbq_calls, indent=2, ensure_ascii=False))

            # Проверки
            event_id = captured_payload.get("event_id", "")
            fbp = captured_payload.get("fbp", "")
            fbc = captured_payload.get("fbc", "")

            print("\n=== ПРОВЕРКИ ===")
            print(f"1. event_id присутствует: {bool(event_id)} (значение: {event_id})")
            print(f"2. fbp совпадает с cookie: {fbp == 'fb.1.1710000000.999888777'} (fbp: {fbp})")
            fbc_ok = fbc.startswith("fb.1.") and fbc.endswith(".IwAR123456789TestFbclid")
            print(f"3. fbc сформирован из fbclid: {fbc_ok} (fbc: {fbc})")

            lead_call = next((c for c in fbq_calls if len(c) >= 2 and c[0] == "track" and c[1] == "Lead"), None)
            print(f"4. Вызов fbq('track', 'Lead', ...): {lead_call is not None}")
            if lead_call:
                fbq_event_id = lead_call[3].get("eventID") if len(lead_call) > 3 and isinstance(lead_call[3], dict) else None
                print(f"5. fbq eventID совпадает с payload event_id: {fbq_event_id == event_id} (fbq eventID: {fbq_event_id})")

            # Скриншот
            screenshot_path = "/tmp/landing_capi_proof.png"
            page.screenshot(path=screenshot_path)
            print(f"\nСкриншот сохранён: {screenshot_path}")

            browser.close()
    finally:
        srv.terminate()
        srv.wait()
        print("http.server остановлен.")


if __name__ == "__main__":
    main()
