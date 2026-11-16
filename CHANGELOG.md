# Changelog

The version number is at the bottom of Settings › Data & sync.

## 16 November 2026, night (version 55)

- **Shortcuts & widget** (Settings › This phone): copyable links that log breakfast or dinner in one tap, or open the poo, pee, play, fight, calm moment, weigh-in, note or quick log form. Put them in iPhone Shortcuts and add the Shortcuts widget to your home screen. Replaces the lock screen shortcut card (the old `?log=breakfast` and `?log=dinner` links still work).
- **Android**: hold the app icon for Breakfast, Dinner, Fight and Quick log.

## 16 November 2026, evening (version 54)

- **App icon badge can be turned off** again per phone (Settings › This phone). It used to only turn on.
- **Weight**: a gap between "Both cats on one chart" and the first cat's card.

## 16 November 2026, afternoon (versions 33 to 48)

- **Easier to read**: grey text, the calendar's today and future days, and coloured pills now meet the WCAG AA contrast level; every button has a screen-reader name.
- **Settings as a short menu**: Cats, This phone, Sharing & notifications, Data, Help.
- **Calmer Today**: only what needs you now; the week and who did what fold away.
- **Languages**: Dutch, with a system for adding more. **Appearance**: Automatic, Light or Dark. **kg or lb**. **Tabs** can be switched off.
- **Start without an account**, connect GitHub later; easier GitHub setup with pre-filled links and clear error messages; restore from a backup; erasing needs a code.
- **Notes and reminders for each other**, with phone notifications sent by the data repository's workflow.
- **Your cats, your colours**: editable names, coats, breeds, tap-the-fur colours from a photo, app colours that follow each cat. **First-run setup** for new people.
- **Care sheet** for a sitter or cat hotel, and **holiday mode** during stays.
- **Help**: first-time intro, What's new, when to call a vet (🚨 Urgent? on Health), report a problem, log by chatting with Claude (with risks and costs), calendar file.
- **Fight-time heads-up** before the hours most fights happen.

## 16 November 2026 (versions 16 to 32)

- **Birthdays**: a birthday per cat, age on the Info tab, 🎂 on the calendar, "turns 3" in Coming up and a birthday headline. Rough birth dates give an age only.
- **Demo mode**: try the app with made-up cats (`?demo`), with nothing saved.
- **Setup QR code**: connect another phone in one scan (Settings › This phone).
- **New data repositories** start from empty starter data automatically.
- **Privacy note** in the app and the README. No hard-coded repository: it's worked out from the site address.
- **Faster**: only the parts of the screen that changed are redrawn, small photo previews, minified build, font stored with the app, sections built only when opened.
- **Smoother scrolling**: native iPhone bounce, no redraws while scrolling, lighter shadows.
- **Tidier code**: split into `src/` by area, Prettier formatting, buttons routed through `ACT`, one stylesheet, inline styles moved to classes, automated tests on every push.
- **New features**: headline card on Today, quick log (+), undo, swipe to delete, week strip, search, who did what (and no double feeding), app icon badge, vet summary, vet questions, poo vs food, breathing counter, bedtime routine, backup, weekly weigh-in check-in, Sunday summary, weight projections, longest calm stretch, lock screen shortcut links, monthly repeating costs, order-by dates that know about cat hotel stays, claim status, booking countdown.
- **Look**: Albert and Milly redrawn to match their real markings, line icons, calmer warning colours, gentler dark mode, Health split into Today, Trends and Vet.

## 13 to 15 November 2026 (versions 1 to 15)

- First version: food, weight, health, fights, stock, costs and info for both cats, synced through a private GitHub repository.
- Meals logged by tapping Dry and Wet tiles, with supplements ticked off automatically.
- One-question-at-a-time forms for fights, symptoms, calm moments, costs and poo and pee.
- Calendar with icons, a monthly recap, and to-dos grouped by when they're due.
- Weight page for both cats with a countdown to Saturday's weigh-in.
- Stock page with "buy soon", and photos and videos that open inside the app.
- Bottom bar that scrolls, with all tabs in one row, and a feeding plan card.
