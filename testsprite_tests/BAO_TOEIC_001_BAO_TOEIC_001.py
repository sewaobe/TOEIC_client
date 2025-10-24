import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:5173", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Click on 'Đăng nhập' button to open login form
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/header/div/div[2]/button[5]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Input username and password, then click the Login button to proceed
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/div/form/div[2]/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('thanha17')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/div/form/div[2]/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Thanha17@')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click on the 'Đề thi online' button to navigate to the online test section
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/header/div/div[2]/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click the 'Làm bài ngay' button on the first test to start the TOEIC test
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/div[2]/div/div/div/div[4]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click the 'Làm full test' button to start the full TOEIC test
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div/div/div/div/div/div/div[4]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click the 'BẮT ĐẦU FULL TEST' button to begin the full TOEIC test
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div/div/div/div/div/div/div[5]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click the 'Bắt đầu' button to start the TOEIC test
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click the 'Next' button on the modal to close it and start answering questions
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div[2]/div/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Try to click the 'Nộp bài' button by its visible text or try to close the modal popup first to enable interaction with the 'Nộp bài' button
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div[3]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click the 'Close' button (index 3) on the instruction modal to close it and enable interaction with the 'Nộp bài' button
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div[3]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click the 'Nộp bài' button to submit the test and trigger the confirmation modal
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/header/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click the 'Xác nhận' button to confirm test submission and proceed to the result modal
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div[2]/div[3]/div/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Assert the confirmation modal with the expected text is visible
        confirmation_modal = frame.locator('xpath=//div[contains(@class, "modal") and contains(., "Bạn có chắc chắn muốn nộp bài không?")]')
        assert await confirmation_modal.is_visible(), "Confirmation modal is not visible or text does not match"
        
        # Click the 'Xác nhận' button to confirm submission
        confirm_button = frame.locator('xpath=//button[contains(text(), "Xác nhận")]')
        assert await confirm_button.is_visible(), "Confirm button is not visible"
        await confirm_button.click()
        
        # Assert the result modal for TOEIC test is visible
        result_modal = frame.locator('xpath=//div[contains(@class, "modal") and contains(., "Kết quả bài thi TOEIC")]')
        assert await result_modal.is_visible(), "Result modal is not visible or text does not match"
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    