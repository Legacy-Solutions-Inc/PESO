from playwright.sync_api import Page, expect, sync_playwright

def test_tooltip(page: Page):
    # 1. Arrange: Go to the test page.
    page.goto("http://localhost:3000/test-tooltip")

    # 2. Act: Hover over the first "View details" button.
    # The button has aria-label="View details for John Doe"
    view_button = page.get_by_label("View details for John Doe")

    # Debug: Print the HTML of the button to verify
    try:
        print(f"Button HTML: {view_button.evaluate('el => el.outerHTML')}")
    except Exception as e:
        print(f"Could not evaluate button HTML: {e}")

    view_button.hover()

    # 3. Assert: Wait for tooltip to appear and verify text.
    # Tooltip content should be "View details".
    tooltip = page.get_by_role("tooltip")

    # Wait for it to appear
    try:
        expect(tooltip).to_be_visible(timeout=5000)
        expect(tooltip).to_have_text("View details")
    except AssertionError as e:
        print(f"Assertion failed: {e}")
        # Capture page source to see if tooltip is present but hidden
        # print(page.content())
        raise e

    # 4. Screenshot: Capture the tooltip.
    page.screenshot(path="verification/tooltip_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_tooltip(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
