"""Browser regression checks. Run: python3 tests/gallery_browser_check.py

Requires Playwright and its Chromium browser. A temporary local server is started.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread


def run_checks(base_url):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
     browser=p.chromium.launch(headless=True)
     for width in [1280,390]:
      context=browser.new_context(viewport={'width':width,'height':900},reduced_motion='reduce',permissions=['clipboard-read','clipboard-write'])
      page=context.new_page(); errors=[]
      page.on('pageerror',lambda e: errors.append(str(e)))
      page.route('https://www.googletagmanager.com/**',lambda r:r.abort())
      page.goto(base_url + '/gallery.html')
      page.wait_for_selector('#gallery-results')
      print(width,page.locator('#gallery-total').inner_text())
      assert page.locator('.portrait-triptych img').count()==3
      dimensions=page.locator('.portrait-triptych img').evaluate_all('(imgs)=>imgs.map(i=>({w:i.getBoundingClientRect().width,h:i.getBoundingClientRect().height}))')
      assert abs(dimensions[0]['w']-(343.0625 if width==1280 else 112.9375))<.1
      assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
      total=page.locator('.album-card').count()
      page.locator('#gallery-search').fill('pabna')
      assert page.locator('.album-card:visible').count()==1
      page.locator('#gallery-year').select_option('2022')
      assert page.locator('.album-card:visible').count()==0
      assert page.locator('#gallery-empty').is_visible()
      page.locator('.gallery-reset').click()
      page.wait_for_function("document.querySelector('#gallery-search').value==='' && document.querySelectorAll('.album-card:not([hidden])').length > 1")
      assert page.locator('.album-card:visible').count()==total
      page.locator('#gallery-sort').select_option('oldest')
      assert page.locator('.album-card').first.get_attribute('data-album')=='traditional-performing-arts'
      page.locator('#gallery-sort').select_option('newest')
      assert page.locator('.album-card').first.get_attribute('data-album')=='students-farewell-2026'
      page.locator('[data-album="mahmuda"]').click()
      assert page.locator('#slide-status').inner_text()=='1 / 5'
      assert page.locator('#slideshow-toggle').inner_text()=='Play slideshow'
      assert page.locator('.gallery-dialog').evaluate('(d)=>d.scrollTop')==0
      page.locator('#next-photo').click()
      assert page.locator('#slide-status').inner_text()=='2 / 5'
      page.keyboard.press('ArrowLeft')
      assert page.locator('#slide-status').inner_text()=='1 / 5'
      page.keyboard.press('End')
      assert page.locator('#slide-status').inner_text()=='5 / 5'
      page.locator('#next-photo').click()
      assert page.locator('#slide-status').inner_text()=='1 / 5'
      page.locator('#zoom-photo').click()
      assert page.locator('#zoom-photo').get_attribute('aria-pressed')=='true'
      page.keyboard.press('Escape')
      assert page.locator('.gallery-dialog').is_visible()
      assert page.locator('#zoom-photo').get_attribute('aria-pressed')=='false'
      page.locator('#slideshow-toggle').click()
      assert page.locator('#slideshow-toggle').inner_text()=='Pause slideshow'
      page.locator('#next-photo').click()
      assert page.locator('#slideshow-toggle').inner_text()=='Play slideshow'
      with page.expect_download() as download:
       page.locator('#download-photo').click()
      assert download.value.suggested_filename.endswith('.png')
      page.locator('#share-photo').click()
      page.wait_for_function("document.querySelector('#cover-status').textContent.includes('copied')")
      shared=page.evaluate('navigator.clipboard.readText()')
      assert 'album=mahmuda&photo=2' in shared
      page.locator('#set-cover').click()
      assert page.locator('#cover-status').inner_text()=='Album cover saved in this browser.'
      page.keyboard.press('Escape')
      assert not page.locator('.gallery-dialog').is_visible()
      page.wait_for_function("document.body.style.overflow === ''")
      assert page.evaluate("document.activeElement.dataset.album")=='mahmuda'
      page.reload()
      assert page.locator('[data-album="mahmuda"] img').get_attribute('src').endswith('seminar-reception.png')
      page.goto(shared)
      page.wait_for_selector('.gallery-dialog[open]')
      assert page.locator('#slide-status').inner_text()=='2 / 5'
      page.locator('.dialog-close').click()
      page.locator('[data-album="students-farewell-2026"]').click()
      assert page.locator('#next-photo').is_disabled()
      assert not page.locator('#slideshow-toggle').is_visible()
      page.locator('.dialog-close').click()
      assert not errors,errors
      print('PASS: filters, sorting, dimensions, navigation, zoom, playback, download, sharing, cover persistence, focus, deep link, single-photo album',width)
      context.close()
     browser.close()


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    handler = partial(SimpleHTTPRequestHandler, directory=str(root))
    server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        run_checks(f'http://127.0.0.1:{server.server_port}')
    finally:
        server.shutdown()
        server.server_close()
