/* 04b-notes: Notes and reminders for each other, and turning on phone notifications. Notifications are sent by the data repo's notify workflow (push/notify.js). */
  var notifyNext = false; // the next save asks the workflow to send notifications

  function myName() {
    return whoAmI() || "Me";
  }

  function people() {
    var seen = {},
      out = [];
    function add(n) {
      if (n && !seen[n]) {
        seen[n] = 1;
        out.push(n);
      }
    }
    add(myName());
    Object.keys(S.push || {}).forEach(add);
    (S.msgs || []).forEach(function (m) {
      add(m.from);
      (m.to || []).forEach(add);
    });
    return out;
  }

  function whenText(ms) {
    var d = new Date(ms),
      ds = iso(d),
      hm = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2),
      t = today();
    return (ds === t ? "today" : ds === addDays(t, 1) ? "tomorrow" : short(ds)) + " " + hm;
  }

  function notesCard() {
    var me = myName(),
      now = Date.now(),
      cut = now - 14 * 864e5,
      M = (S.msgs || []).filter(function (m) {
        return !m.done || (m.doneAt || 0) > now - 864e5;
      }),
      mine = M.filter(function (m) {
        return (m.to || []).indexOf(me) >= 0 && (!m.at || m.at <= now + 3 * 36e5);
      }),
      sent = M.filter(function (m) {
        return m.from === me && !m.done && (m.created || 0) > cut && (m.to || []).indexOf(me) < 0;
      });
    if (!mine.length && !sent.length)
      return '<button class="b ghost w notesbtn" data-a="noteNew">✉️ Leave a note or reminder</button>';
    function row(m, forMe) {
      return (
        '<div class="note1' +
        (m.done ? " done" : "") +
        '"><div class="n1t">' +
        esc(m.text) +
        '<div class="small mute">' +
        (forMe
          ? m.from === me
            ? "Your reminder"
            : "From " + esc(m.from)
          : "To " + esc((m.to || []).join(" & "))) +
        (m.at ? " · ⏰ " + whenText(m.at) : "") +
        (m.done ? " · ✓ " + esc(m.doneBy || "") : !forMe ? " · not done yet" : "") +
        "</div></div>" +
        (m.done
          ? ""
          : forMe
            ? '<button class="b s p" data-a="noteDone" data-v="' + m.id + '">✓ Done</button>'
            : '<button class="x" data-a="noteDel" data-v="' + m.id + '" aria-label="Delete">✕</button>') +
        "</div>"
      );
    }
    return (
      '<div class="card notes"><div class="row between u-mb8"><h2 class="u-m0">✉️ Notes</h2><button class="b s" data-a="noteNew">+ New</button></div>' +
      mine
        .map(function (m) {
          return row(m, true);
        })
        .join("") +
      sent
        .map(function (m) {
          return row(m, false);
        })
        .join("") +
      "</div>"
    );
  }

  function noteSheet() {
    var f = ui.nf,
      P = people();
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><div class="row between u-nowrap"><h2 class="u-m0">New note</h2><button class="x" data-a="close">✕</button></div>' +
      '<textarea id="ntext" rows="3" placeholder="e.g. Can you give Albert his worm tablet tonight?">' +
      esc(f.text || "") +
      "</textarea>" +
      '<label class="l">For</label><div class="chips">' +
      P.map(function (n) {
        return (
          '<button class="chip' +
          (f.to.indexOf(n) >= 0 ? " on" : "") +
          '" data-a="noteTo" data-v="' +
          esc(n) +
          '">' +
          esc(n === myName() ? n + " (me)" : n) +
          "</button>"
        );
      }).join("") +
      "</div>" +
      (P.length < 2
        ? '<div class="note">Only you so far. Others show up here once they\'ve connected and turned on notifications.</div>'
        : "") +
      '<label class="l">When</label><div class="seg u-cols1fr-1fr"><button class="' +
      (f.later ? "" : "on") +
      '" data-a="noteWhen" data-v="0">Now</button><button class="' +
      (f.later ? "on" : "") +
      '" data-a="noteWhen" data-v="1">Remind at…</button></div>' +
      (f.later
        ? '<input type="datetime-local" id="nat" class="u-mt8" value="' + esc(f.at || "") + '">'
        : "") +
      '<div class="note">' +
      (f.later
        ? "Reminders can arrive up to about 30 minutes late."
        : "They get a notification within a minute or so, if they've turned notifications on.") +
      '</div><button class="b p w u-mt10" data-a="noteSend">Send</button></div></div>'
    );
  }

  // Notifications on this phone
  function standalone() {
    return !!(navigator.standalone || (window.matchMedia && matchMedia("(display-mode: standalone)").matches));
  }

  function b64u(s) {
    var p = "=".repeat((4 - (s.length % 4)) % 4),
      raw = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")),
      a = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) a[i] = raw.charCodeAt(i);
    return a;
  }

  function pushCard() {
    var me = myName(),
      on = ((S.push || {})[me] || []).some(function (s) {
        return s.id === localStorage.getItem(LS + "-pushid");
      }),
      ok = "PushManager" in window && "serviceWorker" in navigator;
    return (
      '<div class="card"><h2>🔔 Notifications</h2><div class="note u-m0-0-10">' +
      (!S.pushPub
        ? "Notifications aren't set up for this data yet."
        : !ok
          ? "This browser can't show notifications."
          : !standalone() && /iPhone|iPad/.test(navigator.userAgent)
            ? "On iPhone, add the app to your home screen first (Share › Add to Home Screen), then turn them on from there."
            : on
              ? "On for " + esc(me) + " on this phone. You'll get notes and reminders sent to you."
              : "Get notes and reminders on this phone, even when the app is closed.") +
      "</div>" +
      (S.pushPub && ok && (standalone() || !/iPhone|iPad/.test(navigator.userAgent))
        ? on
          ? '<button class="b s ghost" data-a="pushOff">Turn off on this phone</button>'
          : '<button class="b s p" data-a="pushOn">Turn on notifications</button>'
        : "") +
      "</div>"
    );
  }

  // No-account mode: data lives only on this phone, so keep reminding about a safer home for it.
  function localNudge() {
    var ios = /iPhone|iPad/.test(navigator.userAgent),
      lb = +(localStorage.getItem(LS + "-lastbackup") || 0),
      old = Date.now() - lb > 14 * 864e5;
    if (ios && !standalone())
      return '<div class="card nudge"><b>Add the app to your home screen</b><div class="small">In Safari tap Share › Add to Home Screen. Otherwise iPhone can clear what you\'ve logged after a week without use.</div></div>';
    if (old)
      return '<div class="card nudge"><b>Your data is only on this phone</b><div class="small">Connect GitHub (free) to keep it safe and share it, or download a backup.</div><div class="row u-gap8 u-mt8"><button class="b s p" data-a="connGh">Connect GitHub</button><button class="b s" data-a="backup">Backup</button></div></div>';
    return "";
  }

  // Fight-time heads-up: the busiest 3-hour window for fights (last 90 days, fights with a time).
  // Shown on Today from 90 minutes before that window until it ends.
  function fightWindow() {
    var since = addDays(today(), -90),
      hrs = [],
      n = 0;
    for (var h = 0; h < 24; h++) hrs.push(0);
    (S.fights || []).forEach(function (f) {
      if (f.d < since || !/^\d\d:\d\d$/.test(f.m || "")) return;
      hrs[+f.m.slice(0, 2)]++;
      n++;
    });
    if (n < 4) return null;
    var best = -1,
      bs = 0;
    for (var s = 0; s < 24; s++) {
      var c = hrs[s] + hrs[(s + 1) % 24] + hrs[(s + 2) % 24];
      if (c > best) {
        best = c;
        bs = s;
      }
    }
    if (best < 3 || best / n < 0.4) return null;
    return { from: bs, to: (bs + 3) % 24, count: best, n: n };
  }

  function fightHeadsUp() {
    if (!tabOn("fights")) return "";
    var w = fightWindow();
    if (!w) return "";
    var d = new Date(),
      mins = d.getHours() * 60 + d.getMinutes(),
      start = w.from * 60,
      rel = (mins - start + 1440) % 1440; // minutes since the window started
    if (!(rel >= 1440 - 90 || rel < 180)) return "";
    var hh = function (h) {
      return ("0" + h).slice(-2) + ":00";
    };
    return (
      '<div class="card nudge"><b>⚠️ Fight time ' +
      (rel >= 1440 - 90 ? "soon" : "now") +
      "</b><div class=\"small\">" +
      w.count +
      " of the last " +
      w.n +
      " fights with a time were between " +
      hh(w.from) +
      " and " +
      hh(w.to) +
      ". A play session for " +
      esc(S.cats.albert.name) +
      " and then food usually takes the edge off.</div></div>"
    );
  }

  // Calendar file (.ics): worming and flea due dates, Saturday weigh-ins, birthdays and bookings.
  // Opening it on iPhone offers "Add All" to the Calendar app, with reminders.
  function icsFile() {
    var L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Albert & Milly//EN", "CALSCALE:GREGORIAN"],
      stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
      n = 0;
    function esc2(s) {
      return String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
    }
    function day(ds) {
      return ds.replace(/-/g, "");
    }
    function ev(ds, title, extra, alarm) {
      n++;
      L.push(
        "BEGIN:VEVENT",
        "UID:am-" + day(ds) + "-" + n + "-" + title.replace(/\W/g, "").slice(0, 20) + "@albert-milly",
        "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + day(ds),
        "DTEND;VALUE=DATE:" + day(addDays(ds, 1)),
        "SUMMARY:" + esc2(title)
      );
      (extra || []).forEach(function (x) {
        L.push(x);
      });
      if (alarm !== false) L.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + esc2(title), "TRIGGER:-PT15H", "END:VALARM");
      L.push("END:VEVENT");
    }
    ["albert", "milly"].forEach(function (k) {
      var c = S.cats[k];
      ["Worming", "Flea"].forEach(function (ty) {
        var d = treatDue(c, ty);
        if (d && d.next >= today()) ev(d.next, ty + " treatment due: " + c.name);
      });
      if (c.born && !c.bornGuess) ev(nextBday(c), c.name + "'s birthday", ["RRULE:FREQ=YEARLY"], false);
    });
    if (tabOn("weight")) {
      var sat = addDays(today(), (6 - parse(today()).getDay() + 7) % 7);
      ev(sat, "Weigh-in: " + S.cats.albert.name + " & " + S.cats.milly.name, ["RRULE:FREQ=WEEKLY;BYDAY=SA"]);
    }
    ((S.info && S.info.bookings) || []).forEach(function (b) {
      if (!b.from || (b.to || b.from) < today()) return;
      var nm = b.place || "cat hotel";
      ev(b.from, "Drop-off at " + nm, b.notes ? ["DESCRIPTION:" + esc2(b.notes)] : []);
      if (b.to) ev(b.to, "Pick-up from " + nm, b.notes ? ["DESCRIPTION:" + esc2(b.notes)] : []);
    });
    L.push("END:VCALENDAR");
    return { text: L.join("\r\n"), count: n };
  }
