"""Optional local smoke test for standalone HTML (requires Python playwright & Chromium)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root = Path(__file__).resolve().parent.parent
html = (root / 'standalone' / 'daa-final-prep.html').read_text(encoding='utf-8')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1365,'height':900})
    errors=[]
    page.on('pageerror', lambda e:errors.append(str(e)))
    page.evaluate('''() => {const mem={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>mem[k]||null,setItem:(k,v)=>mem[k]=v,removeItem:k=>delete mem[k]}});}''')
    page.set_content(html,wait_until='load')
    assert page.locator('.lesson-tile').count()==10
    page.locator('button.nav-link').filter(has_text='Lessons').click()
    assert page.locator('.term-row').count()>=4
    page.locator('.actions-panel .btn').filter(has_text='Mark complete').click()
    assert '1' in page.evaluate('localStorage.getItem("daa-final-prep-progress-v1")')
    page.locator('.actions-panel .btn').filter(has_text='Take lesson quiz').click()
    assert page.locator('.quiz-option').count()==4
    page.locator('.quiz-option').first.click()
    assert page.locator('.explain').count()==1
    page.locator('button.nav-link').filter(has_text='Flashcards').click()
    page.locator('.flash-card').click()
    page.locator('.flash-buttons .btn').filter(has_text='Знаю').click()
    page.locator('button.nav-link').filter(has_text='Practice Lab').click()
    labs=page.locator('.lab-picker')
    assert labs.count()==9
    page.locator('input.inline-code-input').nth(0).fill('l >= r')
    page.locator('input.inline-code-input').nth(1).fill('l + (r - l) / 2')
    page.locator('input.inline-code-input').nth(2).fill('merge(a, l, mid, r)')
    page.locator('.lab-buttons .btn').filter(has_text='Check my code').click()
    assert 'совпали' in page.locator('.lab-feedback').inner_text()
    page.locator('button.nav-link').filter(has_text='Previous questions').click()
    assert page.locator('.bank-row').count()==24
    page.get_by_role('button',name='Start practice').click()
    page.locator('.quiz-option').last.click()
    assert page.locator('.explain').count()==1
    page.locator('button.nav-link').filter(has_text='Mock final').click()
    page.get_by_role('button',name='Start mock final').click()
    assert page.locator('.qnav button').count()==25
    page.locator('.quiz-option').first.click()
    page.get_by_role('button',name='Submit exam').click()
    assert '25' in page.locator('.result-top h2').inner_text()
    page.locator('button.nav-link').filter(has_text='Mistake review').click()
    assert page.locator('.review-item').count()>=1
    page.locator('button.nav-link').filter(has_text='Progress').click()
    assert page.locator('.history-row').count()>=1
    page.locator('button.theme-switch').click()
    assert page.get_attribute('html','data-theme')=='light'
    assert not errors, errors
    print('PASS: desktop navigation, lessons, quiz feedback, flashcards, code lab, sample bank, timed mock, mistakes, progress, theme')
    mobile=browser.new_page(viewport={'width':390,'height':844})
    mobile.set_content(html,wait_until='load')
    mobile.locator('.mobile-menu').click()
    mobile.locator('button.nav-link').filter(has_text='Lessons').click()
    assert mobile.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    mobile.locator('.mobile-menu').click()
    mobile.locator('button.nav-link').filter(has_text='Practice Lab').click()
    assert mobile.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    print('PASS: responsive mobile lessons and Java lab, no horizontal page overflow')
    browser.close()
