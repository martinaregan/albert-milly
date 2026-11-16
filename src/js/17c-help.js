/* 17c-help: First-time intro, "What's new" after an update, the emergency vet panel, and report a problem. */
  // Newest first. Add a line here with every release that changes something people will notice.
  var NEWS = [
    ["43", "Light, Dark or Automatic (Settings › This phone)"],
    [
      "42",
      '🚨 "Urgent?" on Health: when to call a vet now',
      "Help in Settings: how the app works, report a problem"
    ],
    ["41", "Weights in kg or lb (Settings › This phone)", "Switch tabs you don't need off (Settings › Tabs)"],
    ["40", "Friendship shows 'Last fight' in plain words"],
    ["39", "Start without an account; connect GitHub any time", "Restore from a backup"],
    ["37", "Notes and reminders for each other, with phone notifications"],
    ["36", "Your cats, your colours: coat, breed or tap the fur on a photo"],
    ["33", "Care sheet for a cat hotel or sitter", "Holiday mode while they're away"],
    ["31", "Birthdays"]
  ];

  function vnum(v) {
    return parseInt(v, 10) || 0;
  }

  function seenV() {
    try {
      return localStorage.getItem(LS + "-seenv");
    } catch (e) {
      return null;
    }
  }

  function markSeen() {
    try {
      localStorage.setItem(LS + "-seenv", APPV);
    } catch (e) {}
  }

  function newsSheet() {
    var from = vnum(ui.newsFrom),
      items = NEWS.filter(function (n) {
        return vnum(n[0]) > from;
      }).slice(0, 6);
    return (
      '<div class="modal" data-a="newsok"><div class="sheet" data-stop="1"><h2 class="u-mt0">✨ What\'s new</h2><ul class="newsl">' +
      items
        .map(function (n) {
          return n
            .slice(1)
            .map(function (x) {
              return "<li>" + esc(x) + "</li>";
            })
            .join("");
        })
        .join("") +
      '</ul><button class="b p w u-mt10" data-a="newsok">Got it</button></div></div>'
    );
  }

  // The intro: a few cards the first time the app opens on a phone.
  var INTRO = [
    [
      "🍽️",
      "Log in a tap",
      "The top card on Food & play shows what's left today. Tap <b>Log both</b> for the usual breakfast or dinner. The round <b>+</b> logs anything else."
    ],
    [
      "⚖️",
      "Weigh on Saturdays",
      "Weigh yourself, then hold each cat. The app works out their weight, checks the pace and tells you if the food needs changing."
    ],
    [
      "🩺",
      "Health and the vet",
      "Log poo, pee and symptoms on Health. Before a vet visit, tap <b>Vet summary</b> to share everything in one go."
    ],
    [
      "😾",
      "Friendship",
      "Log fights and calm moments. After a few, it shows who starts it, when, and what helps."
    ],
    [
      "⚙️",
      "Make it yours",
      "Settings has your cats' looks, names, plans, units and which tabs you see. Swipe left or right to change tab."
    ]
  ];

  function introSheet() {
    var i = ui.intro || 0,
      it = INTRO[i];
    return (
      '<div class="modal"><div class="sheet intro" data-stop="1"><div class="introic">' +
      it[0] +
      '</div><h2 class="wizq">' +
      it[1] +
      '</h2><div class="pl">' +
      it[2] +
      '</div><div class="dots">' +
      INTRO.map(function (x, j) {
        return '<i class="' + (j === i ? "on" : "") + '"></i>';
      }).join("") +
      '</div><div class="row u-gap8 u-mt10">' +
      (i < INTRO.length - 1
        ? '<button class="b ghost u-flex1" data-a="introdone">Skip</button><button class="b p u-flex1" data-a="intronext">Next</button>'
        : '<button class="b p w" data-a="introdone">Start</button>') +
      "</div></div></div>"
    );
  }

  // Decide once per load whether to show the intro or What's new.
  function helpOnStart() {
    if (DEMO || ui.modal || !S || S.fresh) return;
    var sv = seenV(),
      used = ["albert", "milly"].some(function (k) {
        return S.cats[k].weights.length > 1 || Object.keys(S.cats[k].days || {}).length > 2;
      });
    // Someone who's used the app before this version existed gets What's new, not the intro.
    if (sv === null && used) sv = "30";
    if (sv === null) {
      ui.intro = 0;
      ui.modal = introSheet;
    } else if (vnum(sv) < vnum(APPV)) {
      var any = NEWS.some(function (n) {
        return vnum(n[0]) > vnum(sv);
      });
      ui.newsFrom = sv;
      if (any) ui.modal = newsSheet;
      else markSeen();
    }
  }

  // When to stop logging and call a vet now. General guidance, not a diagnosis.
  function sosSheet() {
    var v = (S.info && S.info.vet) || {};
    return (
      '<div class="modal" data-a="close"><div class="sheet sos" data-stop="1"><div class="row between u-nowrap"><h2 class="u-m0">🚨 Call a vet now if…</h2><button class="x" data-a="close">✕</button></div><ul class="sosl">' +
      [
        "Breathing with an open mouth, struggling to breathe, or more than 40 breaths a minute while asleep",
        "Straining in the litter tray with little or no pee coming out, especially a male cat. This can be fatal within a day",
        "Not eating anything for 24 hours. In an overweight cat this can quickly damage the liver",
        "Collapse, a fit, wobbling, sudden weakness or can't use the back legs",
        "Pale, white, grey or blue gums or tongue",
        "Repeated vomiting, vomiting blood, or bloody diarrhoea",
        "Ate something toxic: lilies (any part, even pollen), paracetamol or other human medicine, antifreeze, dog flea treatment",
        "Bleeding that won't stop, a bad wound, or a fall or road accident even if they seem fine",
        "Hiding, crying in pain, or a hard, swollen belly"
      ]
        .map(function (x) {
          return "<li>" + esc(x) + "</li>";
        })
        .join("") +
      "</ul>" +
      (v.phone
        ? '<button class="b p w u-mt10 sosc" data-a="callvet" data-v="' +
          esc(String(v.phone).replace(/[^\d+]/g, "")) +
          '">📞 Call ' +
          esc(v.clinic || "the vet") +
          "</button>" +
          (v.hours ? '<div class="note">Open: ' + esc(v.hours.replace(/\n/g, "; ")) + "</div>" : "")
        : '<div class="note">Add your vet\'s phone number in Info so it shows here.</div>') +
      '<div class="note">Out of hours, call your vet anyway: the recorded message usually gives the emergency number. This list is general guidance, not a diagnosis. If you\'re worried, call.</div></div></div>'
    );
  }

  function reportLink() {
    return (
      "https://github.com/martinaregan/albert-milly/issues/new?title=" +
      encodeURIComponent("Problem: ") +
      "&body=" +
      encodeURIComponent(
        "What happened:\n\n\nWhat I expected:\n\n\n---\nApp version " +
          APPV +
          "\n" +
          navigator.userAgent +
          "\n(Please don't include access keys or anything private.)"
      )
    );
  }
