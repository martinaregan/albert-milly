"""Smoke tests for the Albert & Milly app.

Run from the repo root:
    node tools/build.js --dev        # makes dev.html (and index.html)
    pip install playwright && playwright install chromium
    python tests/smoke.py

Uses made-up sample data (tests/sample-data.json), never the real data,
and blocks api.github.com so nothing is ever synced.
"""
import asyncio, json, os, sys, tempfile, datetime
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(open(os.path.join(ROOT, "tests", "sample-data.json")))
TABS = ["today", "weight", "health", "calendar", "fights", "stock", "money", "info", "settings"]
fails = []

def check(ok, msg):
    print(("  ok   " if ok else "  FAIL ") + msg)
    if not ok:
        fails.append(msg)

def test_page():
    # dev.html with a test hook exposing the app's internals
    s = open(os.path.join(ROOT, "dev.html")).read()
    i = s.rindex("})();")
    s = s[:i] + "window.T={get S(){return S},ui:ui,render:render};\n" + s[i:]
    path = os.path.join(ROOT, "_test.html")
    open(path, "w").write(s)
    return path

async def open_app(browser, url, **ctx):
    ctx = await browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True, timezone_id="Europe/Amsterdam", **ctx)
    page = await ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    await page.clock.install(time=datetime.datetime(2026, 11, 16, 9, 30))
    await page.route("**/api.github.com/**", lambda r: r.abort())
    await page.goto(url)
    await page.evaluate("""d=>{localStorage.setItem('am-tracker-cache',JSON.stringify({S:d,BASE:d,SHA:'x',dirty:false}));
        localStorage.setItem('am-tracker-gh',JSON.stringify({owner:'x',repo:'y',token:'t',who:'Tester'}));localStorage.setItem('am-tracker-seenv','9999')}""", DATA)
    await page.reload()
    await page.clock.run_for(800)
    return page, errors

async def main():
    url = "file://" + test_page()
    async with async_playwright() as p:
        browser = await p.chromium.launch(**({"executable_path": os.environ["CHROME"], "args": ["--no-sandbox"]} if os.environ.get("CHROME") else {}))
        for scheme in ["light", "dark"]:
            print(f"{scheme} mode")
            page, errors = await open_app(browser, url, color_scheme=scheme)
            for tab in TABS:
                same = await page.evaluate("""tab=>{T.ui.tab=tab;T.ui.modal=null;T.render();T.render();
                    var n=h=>h.replace(/ src="[^"]*"/g,'');var a=n(document.getElementById('root').innerHTML);
                    T.ui.lastTab=null;T.render();return a===n(document.getElementById('root').innerHTML)}""", tab)
                check(same, f"{tab}: renders, and a partial update matches a full rebuild")
            check(not errors, f"no page errors ({errors[:1]})")
            await page.context.close()

        print("actions")
        page, errors = await open_app(browser, url)
        await page.evaluate("T.ui.tab='today';T.render()")
        btn = await page.query_selector("[data-a=usual][data-v='both|dry']")
        check(btn is not None, "headline offers 'Log both' for breakfast")
        if btn:
            await btn.click(); await page.clock.run_for(300)
            n = await page.evaluate("Object.keys(T.S.cats.albert.days['2026-11-16'].f).length")
            check(n == 1, "one tap logs breakfast")
            await page.click("#toast button"); await page.clock.run_for(300)
            n = await page.evaluate("var d=T.S.cats.albert.days['2026-11-16'];d?Object.keys(d.f).length:0")
            check(n == 0, "undo removes it again")
        alt = await page.query_selector("[data-a=bopen][data-v=dry]")
        check(alt is not None, "headline offers 'Change' next to 'Log both'")
        if alt:
            await alt.click(); await page.clock.run_for(300)
            usual = await page.evaluate("T.S.cats.albert.dryAllowance")
            check(await page.input_value("#ba-albert") == str(usual), "amounts sheet starts from the usual")
            await page.click("[data-a=bstep][data-v='albert|-1']"); await page.clock.run_for(200)
            await page.click("[data-a=bstep][data-v='albert|-1']"); await page.clock.run_for(200)
            check(await page.input_value("#ba-albert") == str(usual - 10), "minus takes 5 g off each tap")
            await page.fill("#ba-milly", "33"); await page.clock.run_for(100)
            await page.click("[data-a=blog]"); await page.clock.run_for(300)
            got = await page.evaluate("""['albert','milly'].map(k=>{var c=T.S.cats[k],d=c.days['2026-11-16'],
                f=c.foods.filter(x=>x.main&&x.kind==='dry')[0];return [d.f[f.id],d.meals.length,d.meals[0].a]})""")
            check(got == [[usual - 10, 1, usual - 10], [33, 1, 33]], f"changed amounts are logged for both, once each ({got})")
            check(await page.query_selector("[data-a=bopen][data-v=dry]") is None, "breakfast is done afterwards")
            await page.click("#toast button"); await page.clock.run_for(300)
            n = await page.evaluate("""['albert','milly'].filter(k=>{var d=T.S.cats[k].days['2026-11-16'];
                return d&&(Object.keys(d.f).length||(d.meals||[]).length)}).length""")
            check(n == 0, "undo removes both again")
        await page.click(".fab"); await page.clock.run_for(200)
        check(await page.query_selector(".qsheet") is not None, "quick log opens")
        await page.click(".qsheet [data-a=close]"); await page.clock.run_for(200)
        await page.click("[data-a=srch]"); await page.clock.run_for(200)
        await page.type("#qsrch", "cough"); await page.clock.run_for(200)
        check(await page.evaluate("document.querySelectorAll('.sres').length") >= 2, "search finds the cough entries")
        await page.evaluate("T.ui.modal=null;T.ui.tab='health';T.render()"); await page.clock.run_for(200)
        await page.click("[data-a=vrep]"); await page.clock.run_for(200)
        txt = await page.evaluate("document.querySelector('.vrep').innerText")
        check("Ask about the cough" in txt and "breathing" in txt.lower(), "vet summary includes questions and breathing")
        await page.evaluate("T.ui.modal=null;T.ui.tab='today';T.ui.day='2026-11-15';T.ui.open={tmeals:true};T.render()")
        before = await page.evaluate("T.S.cats.albert.days['2026-11-15'].meals.length")
        await page.evaluate("""()=>{var r=document.querySelector('.swr[data-del=mdel]'),b=r.getBoundingClientRect(),x=b.left+b.width*.7,y=b.top+b.height/2;
          function ev(t,x2){var tt=new Touch({identifier:1,target:r,clientX:x2,clientY:y});r.dispatchEvent(new TouchEvent(t,{touches:t==='touchend'?[]:[tt],changedTouches:[tt],bubbles:true,cancelable:true}))}
          ev('touchstart',x);for(var i=1;i<=10;i++)ev('touchmove',x-i*15);ev('touchend',x-150)}""")
        await page.clock.run_for(500)
        after = await page.evaluate("T.S.cats.albert.days['2026-11-15'].meals.length")
        check(after == before - 1, "swipe left deletes a meal")
        check(not errors, f"no page errors during actions ({errors[:1]})")
        await page.context.close()

        print("shortcut links")
        for key, sel, what in [("fight", ".modal", "the fight form"), ("poo&cat=milly", ".modal", "the poo form"), ("quick", ".qsheet", "the quick log")]:
            page, errors = await open_app(browser, url)
            await page.goto(url + "?log=" + key); await page.clock.run_for(1500)
            check(await page.query_selector(sel) is not None, f"?log={key} opens {what}")
            check("log=" not in await page.evaluate("location.search"), f"?log={key} is cleared from the address")
            if "cat=" in key:
                check(await page.evaluate("T.ui.cat") == "milly", "&cat=milly picks Milly")
            check(not errors, f"no page errors for ?log={key} ({errors[:1]})")
            await page.context.close()
        page, errors = await open_app(browser, url)
        await page.goto(url + "?log=dinner"); await page.clock.run_for(1500)
        n = await page.evaluate("var d=T.S.cats.albert.days['2026-11-16'];d&&d.f?Object.keys(d.f).length:0")
        check(n == 1, "?log=dinner logs dinner in one go")
        await page.evaluate("T.ui.modal=null;T.ui.tab='settings';T.ui.sset='phone';T.render()"); await page.clock.run_for(200)
        check(await page.evaluate("document.querySelectorAll('[data-a=dlcopy]').length") >= 8, "Settings lists the shortcut links")
        check(not errors, f"no page errors for ?log=dinner ({errors[:1]})")
        await page.context.close()

        print("built app (index.html)")
        page, errors = await open_app(browser, "file://" + os.path.join(ROOT, "index.html"))
        for tab in ["weight", "health", "calendar", "fights", "stock", "money", "info", "today"]:
            await page.evaluate(f"document.querySelector('nav [data-v={tab}]').click()"); await page.clock.run_for(250)
        check(not errors, f"minified build runs every tab without errors ({errors[:1]})")
        await browser.close()
    os.remove(os.path.join(ROOT, "_test.html"))
    print(f"\n{'ALL PASSED' if not fails else str(len(fails)) + ' FAILED'}")
    sys.exit(1 if fails else 0)

asyncio.run(main())
