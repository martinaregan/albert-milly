/* 16-friendship: The Friendship tab: this week, calm moments, patterns, bedtime routine. */
  function nightOf() {
    var n = new Date();
    return n.getHours() < 6 ? addDays(today(), -1) : today();
  }

  function bedStats() {
    var B = S.bed || {},
      ks = Object.keys(B).sort();
    if (ks.length < 3) return "";
    var start = ks[0],
      t = today(),
      w = { n: 0, f: 0 },
      wo = { n: 0, f: 0 };
    for (var d = start; d < t; d = addDays(d, 1)) {
      var nf = S.fights.filter(function (f) {
        return (
          (f.d === d && (f.m >= "21:00" || (!f.m && (f.trig || []).indexOf("Night") >= 0))) ||
          (f.d === addDays(d, 1) && f.m && f.m < "06:00")
        );
      }).length;
      var g = B[d] ? w : wo;
      g.n++;
      g.f += nf;
    }
    if (!w.n || !wo.n) return "";
    return (
      '<div class="card"><h2>🌙 Bedtime routine</h2><div class="grid2"><div class="stat"><span class="mute">With play + snack</span><b>' +
      (w.f / w.n).toFixed(1) +
      '</b><span class="mute small">fights a night · ' +
      w.n +
      ' nights</span></div><div class="stat"><span class="mute">Without</span><b>' +
      (wo.f / wo.n).toFixed(1) +
      '</b><span class="mute small">fights a night · ' +
      wo.n +
      " nights</span></div></div></div>"
    );
  }

  function calmWiz() {
    var x = ui.cm,
      steps = ["what", "done"],
      st = steps[x.step];
    var body =
      st === "what"
        ? wizBig(
            CALMS.map(function (o) {
              return [o, esc(o)];
            }),
            x.what,
            "cmx",
            "what"
          )
        : sumRow("What happened?", x.what, "cmgo", 0) +
          '<div class="grid2" style="margin-top:10px"><div><label class="l">Date</label><input type="date" data-cm="d" value="' +
          x.d +
          '" max="' +
          today() +
          '"></div><div><label class="l">Time</label><input type="time" data-cm="m" value="' +
          x.m +
          '"></div></div><label class="l">Notes (optional)</label><input data-cm="n" value="' +
          esc(x.n) +
          '">' +
          (ui.pend && ui.pend.length ? thumbs(ui.pend, "pend") : "") +
          '<div style="margin-top:10px">' +
          upBtn("pend", "calm", "📷 Add photo or video", "image/*,video/*").replace(
            'class="b s"',
            'class="b w upbig"'
          ) +
          "</div>" +
          '<button class="b p w" style="margin-top:14px;padding:16px;font-size:17px" data-a="cmsave">Save calm moment</button>';
    return wizFrame(
      "😊 Calm moment",
      x.step,
      steps.length,
      { what: "What did they do?", done: "All good?" }[st],
      body,
      "cmback"
    );
  }

  var MILLY_TRIG = ["Milly begging for food", "Milly close to him (bed, sofa)"];

  function pct(a, b) {
    return b ? Math.round((a / b) * 100) : 0;
  }

  function vTogether() {
    var t = today(),
      F = S.fights,
      CA = S.calm || [],
      w1 = F.filter(function (f) {
        return f.d > addDays(t, -7);
      }).length,
      w0 = F.filter(function (f) {
        return f.d > addDays(t, -14) && f.d <= addDays(t, -7);
      }).length,
      calm7 = CA.filter(function (x) {
        return x.d > addDays(t, -7);
      }).length;
    var last = F.slice().sort(function (a, b) {
        return a.d < b.d ? 1 : -1;
      })[0],
      since0 = last ? daysBetween(last.d, t) : null;
    var fd = F.map(function (f) {
        return f.d;
      }).sort(),
      best = since0 || 0;
    for (var bi = 1; bi < fd.length; bi++) {
      var gp = daysBetween(fd[bi - 1], fd[bi]) - 1;
      if (gp > best) best = gp;
    }
    var mood =
      w1 === 0
        ? [
            "Calm week",
            "No fights in the last 7 days" +
              (calm7 ? " · " + calm7 + " calm moment" + (calm7 > 1 ? "s" : "") : "")
          ]
        : w1 < w0
          ? ["Getting better", w1 + " fight" + (w1 !== 1 ? "s" : "") + " this week, down from " + w0]
          : w1 > w0
            ? ["Rougher week", w1 + " fight" + (w1 !== 1 ? "s" : "") + " this week, up from " + w0]
            : ["About the same", w1 + " fight" + (w1 !== 1 ? "s" : "") + " this week, same as last week"];
    var h =
      '<div class="wcount' +
      (w1 > w0 ? " over" : "") +
      '"><div><span class="mute small">This week</span><b>' +
      mood[0] +
      '</b><span class="mute small">' +
      esc(mood[1]) +
      '</span></div><div class="wdays"><span>' +
      (since0 == null ? "–" : since0) +
      "</span><small>days since</small></div></div>" +
      (fd.length > 1
        ? '<div class="small mute" style="margin:-4px 4px 12px;text-align:right">' +
          (since0 >= best && since0 > 0
            ? (function () {
                try {
                  var ck = LS + "-confetti";
                  if (since0 > 1 && localStorage.getItem(ck) !== String(since0)) {
                    localStorage.setItem(ck, String(since0));
                    setTimeout(confetti, 350);
                  }
                } catch (e) {}
                return "🏆 Longest calm stretch yet";
              })()
            : "Longest calm stretch: <b>" + best + " days</b>") +
          "</div>"
        : "");
    h += bedStats();
    h +=
      '<div class="duob"><button class="duof" data-a="fnew"><span>😾</span>Log a fight</button><button class="duoc" data-a="calmnew"><span>😊</span>Log a calm moment</button></div>';
    var hw = vHows(),
      i1 = hw.indexOf('<div class="card"><h2>What stands out'),
      i2 = hw.indexOf("<!--fz-->");
    if (i1 >= 0 && i2 > i1) h += hw.slice(i1, i2);
    var fz = vFights(true),
      bg = fz.indexOf("<!--bg-->"),
      pt = fz.indexOf("<!--pt-->"),
      lg = fz.indexOf("<!--lg-->");
    h += fz.slice(0, bg);
    h += fz.slice(lg + 9);
    var pat = pt >= 0 ? fz.slice(pt + 9, lg) : "";
    if (pat)
      h +=
        '<details class="nf" data-open="fpatt"' +
        isOpen("fpatt", false) +
        '><summary><span>📊 Patterns · 30 days</span></summary><div class="card" style="margin:0">' +
        pat.replace(
          '<div class="card"><div class="row between"><h2 style="margin:0">Patterns · 30 days</h2></div>',
          ""
        ) +
        "</details>";
    var hi = hw.indexOf('<details class="card" data-open="hhelp"');
    if (hi >= 0) {
      var he = hw.indexOf("</details>", hi) + 10;
      h += hw
        .slice(hi, he)
        .replace('<details class="card" data-open="hhelp"', '<details class="nf" data-open="hhelp"')
        .replace(
          "<summary><b>😊 What seems to help</b></summary>",
          '<summary><span>😊 What seems to help</span></summary><div class="card" style="margin:0">'
        )
        .replace(/<\/details>$/, "</div></details>");
    }
    h += fz
      .slice(bg + 9, pt >= 0 ? pt : lg)
      .replace('<details class="card"', '<details class="nf" data-open="fbg"')
      .replace(
        "<summary><b>Background &amp; what you've tried</b></summary>",
        '<summary><span>📝 Background &amp; what you\'ve tried</span></summary><div class="card" style="margin:0">'
      )
      .replace(/<\/details>$/, "</div></details>");
    return h;
  }

  function vHows() {
    var t = today(),
      F = S.fights.filter(function (f) {
        return f.d >= addDays(t, -60);
      }),
      n = F.length,
      CA = S.calm || [];
    var w1 = S.fights.filter(function (f) {
        return f.d > addDays(t, -7);
      }).length,
      w0 = S.fights.filter(function (f) {
        return f.d > addDays(t, -14) && f.d <= addDays(t, -7);
      }).length;
    var last = S.fights.slice().sort(function (a, b) {
        return a.d < b.d ? 1 : -1;
      })[0],
      since0 = last ? daysBetween(last.d, t) : null;
    var calm7 = CA.filter(function (x) {
      return x.d > addDays(t, -7);
    }).length;
    var mood =
      w1 === 0 && calm7
        ? [
            "😌",
            "Calm week",
            "No fights in the last 7 days" +
              (calm7 ? " and " + calm7 + " calm moment" + (calm7 > 1 ? "s" : "") : "") +
              "."
          ]
        : w1 < w0
          ? [
              "📉",
              "Getting better",
              w1 + " fight" + (w1 !== 1 ? "s" : "") + " this week, down from " + w0 + "."
            ]
          : w1 > w0
            ? ["📈", "Rougher week", w1 + " fights this week, up from " + w0 + "."]
            : [
                "➖",
                "About the same",
                w1 + " fight" + (w1 !== 1 ? "s" : "") + " this week, same as the week before."
              ];
    var h =
      '<div class="hero duo-h hmini"><div class="row" style="gap:12px;flex-wrap:nowrap;align-items:center"><div style="font-size:34px">' +
      mood[0] +
      '</div><div><div style="font-size:21px;font-weight:900">' +
      mood[1] +
      '</div><div class="sub">' +
      mood[2] +
      "</div></div></div>" +
      '<div class="stats3"><div><b>' +
      (since0 == null ? "–" : since0) +
      "</b><span>days since</span></div><div><b>" +
      w1 +
      "</b><span>this week</span></div><div><b>" +
      calm7 +
      "</b><span>calm</span></div></div></div>";
    h +=
      '<div class="row" style="gap:8px;margin-bottom:12px;flex-wrap:nowrap"><button class="b p" style="flex:1;padding:14px" data-a="calmnew">😊 Log a calm moment</button><button class="b ghost" style="flex:1;padding:14px" data-a="fnew">😾 Log a fight</button></div>';
    if (!n) {
      return (
        h +
        '<div class="card"><div class="pl mute">Once a few fights are logged, this page tells you who starts it, when, and what sets it off.</div></div><!--fz-->'
      );
    }
    var wo = { Albert: 0, Milly: 0, "Not sure": 0 },
      tg = {},
      tm = {},
      sv = {},
      milTrig = 0,
      night = 0,
      beg = 0;
    F.forEach(function (f) {
      wo[f.who || "Not sure"] = (wo[f.who || "Not sure"] || 0) + 1;
      (f.trig || []).forEach(function (x) {
        tg[x] = (tg[x] || 0) + 1;
      });
      var p = tod(f.m || "");
      if (f.m) tm[p] = (tm[p] || 0) + 1;
      if (
        (f.trig || []).some(function (x) {
          return MILLY_TRIG.indexOf(x) >= 0;
        })
      )
        milTrig++;
      if ((f.trig || []).indexOf("Night") >= 0 || /^Night/.test(p)) night++;
      if ((f.trig || []).indexOf("Milly begging for food") >= 0) beg++;
      if (f.sev) sv[f.sev] = (sv[f.sev] || 0) + 1;
    });
    var topT = Object.keys(tg).sort(function (a, b) {
        return tg[b] - tg[a];
      }),
      topTm = Object.keys(tm).sort(function (a, b) {
        return tm[b] - tm[a];
      })[0];
    var tips = [];
    tips.push([
      "⚖️",
      wo.Albert >= wo.Milly * 2 && wo.Albert > 0
        ? "Albert starts most of it"
        : wo.Milly > wo.Albert
          ? "Milly starts more than you'd think"
          : "It's fairly mixed",
      wo.Albert + " of " + n + " started by Albert."
    ]);
    var bigT = topT[0];
    if (bigT === "Milly begging for food")
      tips.push([
        "🍽️",
        "Food begging is the top trigger",
        "Feed them at the same time in separate rooms, before she starts pestering."
      ]);
    else if (bigT === "Night")
      tips.push(["🌙", "Night-time is the top trigger", "Separate overnight; play then feed before bed."]);
    else if (bigT) tips.push(["🔎", "Top trigger: " + esc(bigT), tg[bigT] + " of " + n + " fights."]);
    if (topTm) tips.push(["🕒", "Busiest time: " + topTm, tm[topTm] + " of the fights with a time."]);
    h +=
      '<div class="card"><h2>What stands out</h2>' +
      tips
        .map(function (x) {
          return (
            '<div class="ins"><span class="ic">' +
            x[0] +
            "</span><div><b>" +
            x[1] +
            "</b><p>" +
            x[2] +
            "</p></div></div>"
          );
        })
        .join("") +
      "</div><!--fz-->";
    var helps = playLink();
    h +=
      '<details class="card" data-open="hhelp"' +
      isOpen("hhelp", false) +
      "><summary><b>😊 What seems to help</b></summary>" +
      helps +
      (CA.length
        ? '<div class="ins"><span class="ic">😊</span><div><b>' +
          CA.length +
          " calm moment" +
          (CA.length > 1 ? "s" : "") +
          " logged</b><p>" +
          esc(
            CA.slice(-3)
              .reverse()
              .map(function (x) {
                return short(x.d) + ": " + (x.what || "calm");
              })
              .join(" · ")
          ) +
          "</p></div></div>"
        : '<div class="note">Log calm moments too. Seeing those go up is the real sign it\'s working.</div>') +
      "</details>";
    h +=
      '<details class="card" data-open="hfull"' +
      isOpen("hfull", false) +
      "><summary><b>📊 Full breakdown (60 days)</b></summary>" +
      '<h3>Who starts it</h3><div class="split"><div style="width:' +
      pct(wo.Albert, n) +
      '%;background:#e8822f"></div><div style="width:' +
      pct(wo.Milly, n) +
      '%;background:#3a3a3a"></div><div style="width:' +
      pct(wo["Not sure"], n) +
      '%;background:#b9b0a6"></div></div>' +
      '<div class="row between small" style="font-weight:800"><span>Albert ' +
      wo.Albert +
      "</span><span>Milly " +
      wo.Milly +
      "</span><span>Not sure " +
      wo["Not sure"] +
      "</span></div>" +
      (milTrig
        ? '<p class="small mute">In ' +
          milTrig +
          " of them something Milly did came first, but he's the one who escalates.</p>"
        : "") +
      (topT.length ? "<h3>Triggers</h3>" + hbars(tg) : "") +
      (Object.keys(tm).length ? "<h3>Time of day</h3>" + hbars(tm) : "") +
      (Object.keys(sv).length ? "<h3>How bad</h3>" + hbars(sv) : "") +
      "</details>";
    return h;
  }

  var CALMS = [
    "Lying together",
    "Groomed without biting",
    "Played together",
    "Ate near each other",
    "Passed each other fine",
    "Slept in the same room"
  ];

  function calmSheet() {
    var x = ui.cm;
    if (x.step != null) return calmWiz();
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 style="margin-top:0">😊 Calm moment</h2><div class="chips">' +
      [
        "Lying together",
        "Groomed without biting",
        "Played together",
        "Ate near each other",
        "Passed each other fine",
        "Slept in the same room"
      ]
        .map(function (o) {
          return (
            '<button class="chip' +
            (x.what === o ? " on" : "") +
            '" data-a="cmx" data-v="' +
            o +
            '">' +
            o +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="grid2"><div><label class="l">Date</label><input type="date" data-cm="d" value="' +
      x.d +
      '" max="' +
      today() +
      '"></div><div><label class="l">Time</label><input type="time" data-cm="m" value="' +
      x.m +
      '"></div></div><label class="l">Notes</label><input data-cm="n" value="' +
      esc(x.n) +
      '">' +
      (ui.pend && ui.pend.length ? thumbs(ui.pend, "pend") : "") +
      '<div style="margin-top:10px">' +
      upBtn("pend", "calm", "📷 Add photo or video", "image/*,video/*").replace(
        'class="b s"',
        'class="b w upbig"'
      ) +
      '</div><div class="row" style="margin-top:14px"><button class="b p" data-a="cmsave">Save</button><button class="b" data-a="close">Cancel</button></div></div></div>'
    );
  }
