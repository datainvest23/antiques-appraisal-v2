
import os
from playwright.sync_api import sync_playwright

def simple_verify():
    print("Starting simple verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        base_url = "http://localhost:3001"

        try:
            print(f"Navigating to {base_url}/es")
            page.goto(f"{base_url}/es", timeout=60000)

            print("Taking screenshot...")
            page.screenshot(path="/home/jules/verification/simple_es_test.png")
            print("Screenshot taken.")

            print(f"Navigating to {base_url}/es/my-valuations")
            page.goto(f"{base_url}/es/my-valuations", timeout=60000)

            # Not waiting for selector, just sleep briefly to ensure render
            page.wait_for_timeout(5000)

            print("Taking screenshot 2...")
            page.screenshot(path="/home/jules/verification/es_my_valuations_final.png")
            print("Screenshot 2 taken.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    simple_verify()
