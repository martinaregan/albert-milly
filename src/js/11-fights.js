/* 11-fights: Fight log, fight logging sheets and wizard. */
  function wkStart(d) {
    var x = parse(d),
      n = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - n);
    return x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-" + ("0" + x.getDate()).slice(-2);
  }

  function topOf(arr) {
    var m = {};
    arr.forEach(function (v) {
      if (v) m[v] = (m[v] || 0) + 1;
    });
    var k = Object.keys(m).sort(function (a, b) {
      return m[b] - m[a];
    });
    return k.length ? k[0] + (m[k[0]] > 1 ? " ×" + m[k[0]] : "") : "";
  }

  function fightLog(F) {
    if (!F.length) return '<div class="card"><h2>Log</h2><span class="mute">Nothing logged yet</span></div>';
    var all = F.filter(function (f) {
      return f.d;
    })
      .slice()
      .sort(function (a, b) {
        return a.d + a.m < b.d + b.m ? 1 : -1;
      });
    var tw = wkStart(today()),
      lw = addDays(tw, -7),
      cT = 0,
      cL = 0;
    all.forEach(function (f) {
      var w = wkStart(f.d);
      if (w === tw) cT++;
      else if (w === lw) cL++;
    });
    var diff = cT - cL,
      trend =
        diff > 0
          ? '<span class="u-c-e0703a">▲ ' + diff + " vs last week</span>"
          : diff < 0
            ? '<span class="u-c5cb85c">▼ ' + -diff + " vs last week</span>"
            : '<span class="mute">same as last week</span>';
    var groups = [],
      gi = {};
    all.forEach(function (f) {
      var w = wkStart(f.d);
      if (!(w in gi)) {
        gi[w] = groups.length;
        groups.push({ w: w, items: [] });
      }
      groups[gi[w]].items.push(f);
    });
    var h =
      '<details class="card flog" data-open="flog"' +
      isOpen("flog", false) +
      '><summary><div class="row between u-flex1"><h2 class="u-m0">Log</h2><span class="small">' +
      all.length +
      ' total</span></div><div class="small u-mt4">This week <b>' +
      cT +
      "</b> · " +
      trend +
      "</div></summary>";
    groups.forEach(function (g, i) {
      var it = g.items,
        worst = it.reduce(function (m, f) {
          return Math.max(m, SEVN[f.sev] || 0);
        }, 0);
      var bites = it.filter(function (f) {
        return (SEVN[f.sev] || 0) >= 3;
      }).length;
      var trig = topOf(
        [].concat.apply(
          [],
          it.map(function (f) {
            return f.trig || [];
          })
        )
      );
      var lbl = g.w === tw ? "This week" : g.w === lw ? "Last week" : "Week of " + short(g.w);
      h +=
        '<details class="fwk" data-open="fwk' +
        g.w +
        '"' +
        isOpen("fwk" + g.w, i === 0) +
        '><summary><div class="u-flex1"><div class="row between"><b>' +
        lbl +
        '</b><span class="small">' +
        it.length +
        (it.length === 1 ? " incident" : " incidents") +
        "</span></div>" +
        '<div class="row between u-mt4"><span>' +
        it
          .slice()
          .reverse()
          .map(function (f) {
            return '<span class="sevdot" style="background:' + (SEVC[f.sev] || "#999") + '"></span>';
          })
          .join("") +
        '</span><span class="mute small">' +
        (bites ? bites + (bites > 1 ? " bites" : " bite") + " or worse" : "no bites") +
        "</span></div>" +
        (trig ? '<div class="mute small u-mt2">Top trigger: ' + esc(trig) + "</div>" : "") +
        "</div></summary>";
      it.forEach(function (f) {
        var who =
          f.who === S.cats.albert.name
            ? spot("albert")
            : f.who === S.cats.milly.name
              ? spot("milly")
              : '<span class="u-w30 u-ta-center u-fs20">❔</span>';
        var sub = (f.trig || [])[0] || f.where || "";
        h +=
          '<details class="fit" data-open="fit' +
          f.id +
          '"' +
          isOpen("fit" + f.id, false) +
          '><summary><div class="fl u-flex1 u-ai-center">' +
          who +
          '<div class="u-flex1 u-minw0"><div class="row between"><b><span class="sevdot" style="background:' +
          (SEVC[f.sev] || "#999") +
          '"></span>' +
          esc(f.sev || "Fight") +
          '</b><span class="mute small">' +
          short(f.d) +
          " " +
          esc(f.m || "") +
          "</span></div>" +
          (sub ? '<div class="mute small ell">' + esc(sub) + "</div>" : "") +
          "</div></div></summary>" +
          '<div class="fbody"><div class="small">' +
          esc(
            [
              f.who ? "Started by " + f.who : "",
              (f.trig || []).join(", "),
              f.where,
              f.sep === "Yes" ? "separated" : f.sep === "No" ? "not separated" : "",
              f.pher === "Yes" ? "pheromones on" : f.pher === "No" ? "pheromones off" : ""
            ]
              .filter(Boolean)
              .join(" · ")
          ) +
          "</div>" +
          (f.n ? '<div class="small mute u-mt4">' + esc(f.n) + "</div>" : "") +
          ((f.att || []).length ? thumbs(f.att) : "") +
          '<div class="row u-jc-flex-end u-mt6"><button class="x" data-a="fedit" data-v="' +
          f.id +
          '">Edit</button><button class="x" data-a="delf" data-v="' +
          f.id +
          '">✕</button></div></div></details>';
      });
      h += "</details>";
    });
    return h + "</details>";
  }

  function hbars(obj, total) {
    var ks = Object.keys(obj).sort(function (a, b) {
      return obj[b] - obj[a];
    });
    var mx = Math.max.apply(
      0,
      ks
        .map(function (k) {
          return obj[k];
        })
        .concat([1])
    );
    return ks
      .map(function (k) {
        return (
          '<div class="hbar"><span>' +
          esc(k) +
          '</span><div class="bar"><div style="width:' +
          (obj[k] / mx) * 100 +
          '%"></div></div><b>' +
          obj[k] +
          "</b></div>"
        );
      })
      .join("");
  }

  function tod(m) {
    var h = +(m || "12").slice(0, 2);
    return h >= 5 && h < 12
      ? "Morning (5–12)"
      : h < 17 && h >= 12
        ? "Afternoon (12–17)"
        : h >= 17 && h < 22
          ? "Evening (17–22)"
          : "Night (22–5)";
  }

  function vFights(embed) {
    var t = today(),
      since = addDays(t, -30),
      F = S.fights,
      rec = F.filter(function (f) {
        return f.d >= since;
      });
    var c7 = F.filter(function (f) {
        return f.d > addDays(t, -7);
      }).length,
      ct = F.filter(function (f) {
        return f.d === t;
      }).length;
    var last = F.slice().sort(function (a, b) {
        return a.d < b.d ? 1 : -1;
      })[0],
      since0 = last ? daysBetween(last.d, t) : null;
    var W = 520,
      H = 100,
      bw = (W - 20) / 14,
      cnt = [],
      mx = 1;
    for (var i = 13; i >= 0; i--) {
      var dd = addDays(t, -i),
        n = F.filter(function (f) {
          return f.d === dd;
        }).length;
      cnt.push([dd, n]);
      if (n > mx) mx = n;
    }
    var h =
      '<div class="hero duo-h"><div class="vs">' +
      spot("albert") +
      "<b>&amp;</b>" +
      spot("milly") +
      '</div><div class="u-ta-center u-fw900 u-fs20">' +
      (since0 == null
        ? "No fights logged"
        : since0 === 0
          ? "Fight logged today"
          : since0 + " day" + (since0 > 1 ? "s" : "") + " since the last fight") +
      "</div>" +
      '<div class="stats3"><div><b>' +
      ct +
      "</b><span>today</span></div><div><b>" +
      c7 +
      "</b><span>7 days</span></div><div><b>" +
      rec.length +
      "</b><span>30 days</span></div></div>" +
      '<svg viewBox="0 0 ' +
      W +
      " " +
      H +
      '" width="100%" style="margin-top:12px">' +
      cnt
        .map(function (x, i) {
          var bh = (x[1] / mx) * (H - 26);
          return (
            '<rect x="' +
            (10 + i * bw + 4) +
            '" y="' +
            (H - 16 - Math.max(bh, 3)) +
            '" width="' +
            (bw - 8) +
            '" height="' +
            Math.max(bh, 3) +
            '" rx="5" fill="#fff" opacity="' +
            (x[1] ? 0.95 : 0.25) +
            '"/>' +
            (i % 2 === 1
              ? '<text x="' +
                (10 + i * bw + bw / 2) +
                '" y="' +
                (H - 2) +
                '" text-anchor="middle">' +
                parse(x[0]).getDate() +
                "</text>"
              : "")
          );
        })
        .join("") +
      '</svg><div class="ends"><span>Last 14 days</span><span>fights per day</span></div></div>';
    if (embed) {
      var s0 = h.indexOf('<svg viewBox="0 0 ' + W),
        sv = h.slice(s0, h.indexOf("</svg>", s0) + 6).replace(/fill="#fff"/g, 'class="fbar"');
      h =
        '<div class="card fchart"><div class="row between"><h2 class="u-m0">Fights · last 14 days</h2><span class="mute small">' +
        c7 +
        " this week · " +
        rec.length +
        " in 30 days</span></div>" +
        sv +
        "</div>";
    } else
      h +=
        '<button class="b p w u-mb12 u-p16 u-fs17" data-a="fnew">😾 Log a fight</button>';
    h +=
      '<!--bg--><details class="card"' +
      (editing("bully") ? " open" : "") +
      '><summary><b>Background &amp; what you\'ve tried</b></summary><div class="row u-jc-flex-end u-mt6">' +
      editBtn("bully") +
      "</div>" +
      (editing("bully")
        ? '<textarea rows="14" class="u-mt6" data-notes="bullying">' +
          esc(S.notes.bullying || "") +
          "</textarea>"
        : '<div class="rv">' + fmtText(S.notes.bullying) + "</div>") +
      "</details>";

    if (rec.length) {
      var tg = {},
        tm = {},
        wh = {},
        wo = {},
        sv = {},
        sp = {},
        ph = {};
      rec.forEach(function (f) {
        (f.trig || []).forEach(function (x) {
          tg[x] = (tg[x] || 0) + 1;
        });
        if (f.m) tm[tod(f.m)] = (tm[tod(f.m)] || 0) + 1;
        if (f.where) wh[f.where] = (wh[f.where] || 0) + 1;
        if (f.who) wo[f.who] = (wo[f.who] || 0) + 1;
        if (f.sev) sv[f.sev] = (sv[f.sev] || 0) + 1;
        if (f.sep) sp[f.sep] = (sp[f.sep] || 0) + 1;
        if (f.pher) ph[f.pher] = (ph[f.pher] || 0) + 1;
      });
      var top = Object.keys(tg).sort(function (a, b) {
          return tg[b] - tg[a];
        })[0],
        pk = Object.keys(tm).sort(function (a, b) {
          return tm[b] - tm[a];
        })[0];
      var nn = rec.length;
      function topk(o) {
        var k = Object.keys(o).sort(function (x, y) {
          return o[y] - o[x];
        });
        if (!k.length) return null;
        var ties = k.filter(function (x) {
          return o[x] === o[k[0]];
        });
        return {
          k: ties.slice(0, 2).join(" / "),
          v: o[k[0]],
          tot: k.reduce(function (m, x) {
            return m + o[x];
          }, 0)
        };
      }
      function pt(ic, lbl, o) {
        var r = topk(o);
        if (!r) return "";
        return (
          '<div class="ptile"><span class="mute small">' +
          ic +
          " " +
          lbl +
          "</span><b>" +
          esc(r.k.replace(/ \(bed, sofa\)/, "").replace(/ \(\d+.\d+\)/g, "")) +
          '</b><span class="mute small">' +
          r.v +
          " of " +
          r.tot +
          '</span><div class="bar u-h4 u-mt4"><div style="width:' +
          Math.round((r.v / r.tot) * 100) +
          '%"></div></div></div>'
        );
      }
      h +=
        '<!--pt--><div class="card"><div class="row between"><h2 class="u-m0">Patterns · 30 days</h2>' +
        (embed ? "" : '<button class="b s ghost" data-a="tab" data-v="hows">🤝 Friendship</button>') +
        "</div>" +
        '<div class="ptiles">' +
        pt("😾", "Started by", wo) +
        pt("🔎", "Top trigger", tg) +
        pt("📈", "Usually", sv) +
        pt("📍", "Where", wh) +
        pt("🕒", "When", tm) +
        pt("🚪", "Separated", sp) +
        "</div>" +
        '<details data-open="fpat"' +
        isOpen("fpat", false) +
        ' style="margin-top:10px"><summary class="small mute">All numbers</summary>' +
        (Object.keys(wo).length ? "<h3>Who started it</h3>" + hbars(wo) : "") +
        "<h3>Why</h3>" +
        (Object.keys(tg).length ? hbars(tg) : '<span class="mute small">No triggers ticked yet</span>') +
        "<h3>How bad</h3>" +
        hbars(sv) +
        (Object.keys(wh).length ? "<h3>Where</h3>" + hbars(wh) : "") +
        (Object.keys(tm).length ? "<h3>When</h3>" + hbars(tm) : "") +
        (Object.keys(sp).length ? "<h3>Separated afterwards</h3>" + hbars(sp) : "") +
        (Object.keys(ph).length ? "<h3>Pheromones plugged in</h3>" + hbars(ph) : "") +
        playLink() +
        "</details></div>";
    }
    h += "<!--lg-->" + fightLog(F);
    return h;
  }

  function playLink() {
    var c = S.cats.albert,
      t = today(),
      a = [],
      b = [],
      g = [],
      n = [];
    for (var i = 1; i <= 30; i++) {
      var d = addDays(t, -i),
        x = peek(c, d);
      if (!x) continue;
      var fc = S.fights.filter(function (f) {
          return f.d === d;
        }).length,
        p = dayTotals(c, x).play;
      (p >= 15 ? a : b).push(fc);
      var rf = x.checks && x.checks["Ran for food / food puzzle"];
      (rf ? g : n).push(fc);
    }
    function av(l) {
      return (
        l.reduce(function (s, v) {
          return s + v;
        }, 0) / l.length
      );
    }
    var out = "";
    if (a.length >= 3 && b.length >= 3)
      out +=
        '<p class="small">Days ' + esc(S.cats.albert.name) + " got 15+ min play: <b>" +
        av(a).toFixed(1) +
        "</b> fights a day, vs <b>" +
        av(b).toFixed(1) +
        "</b> on days with less.</p>";
    if (g.length >= 3 && n.length >= 3)
      out +=
        '<p class="small">Days he ran for his food: <b>' +
        av(g).toFixed(1) +
        "</b> fights a day, vs <b>" +
        av(n).toFixed(1) +
        "</b> without.</p>";
    return out
      ? "<h3>Does play help?</h3>" + out
      : '<p class="note">Once you have a few days of play logged for ' + esc(S.cats.albert.name) + ', this compares fight counts on high-play and low-play days.</p>';
  }

  function fightSheet() {
    var f = ui.f;
    if (!f.id && f.step != null) return fightWiz();
    function chips(list, key, multi) {
      return (
        '<div class="chips">' +
        list
          .map(function (x) {
            var on = multi ? f[key].indexOf(x) >= 0 : f[key] === x;
            return (
              '<button class="chip' +
              (on ? " on" : "") +
              '" data-a="fc" data-k="' +
              key +
              '" data-v="' +
              esc(x) +
              '">' +
              esc(x) +
              "</button>"
            );
          })
          .join("") +
        "</div>"
      );
    }
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">' +
      (f.id ? "Edit fight" : "Log a fight") +
      "</h2>" +
      '<div class="grid2"><div><label class="l">Date</label><input type="date" data-ff="d" value="' +
      f.d +
      '" max="' +
      today() +
      '"></div><div><label class="l">Time</label><input type="time" data-ff="m" value="' +
      f.m +
      '"></div></div>' +
      (ui.pend.length ? thumbs(ui.pend, "pend") : "") +
      '<div class="u-mt10">' +
      upBtn("pend", "fight", "📷 Add photo or video", "image/*,video/*").replace(
        'class="b s"',
        'class="b w upbig"'
      ) +
      "</div>" +
      '<label class="l">1. Who started it</label>' +
      chips(WHO.map(nmz), "who") +
      '<label class="l">2. Why / what was going on (tick all)</label>' +
      chips(TRIG.map(nmz), "trig", true) +
      '<label class="l">3. How bad</label>' +
      chips(SEV, "sev") +
      '<label class="l">4. Where</label>' +
      chips(WHERE, "where") +
      '<label class="l">5. Did you separate them?</label>' +
      chips(["Yes", "No"], "sep") +
      '<label class="l">6. Pheromone diffuser plugged in?</label>' +
      chips(["Yes", "No", "Not sure"], "pher") +
      '<label class="l">Notes</label><textarea rows="2" data-ff="n" placeholder="What happened just before?">' +
      esc(f.n) +
      "</textarea>" +
      '<div class="row u-mt14"><button class="b p" data-a="fsave">Save</button><button class="b" data-a="close">Cancel</button></div></div></div>'
    );
  }

  function fightWiz() {
    var f = ui.f,
      steps = ["who", "trig", "sev", "where", "sep", "pher", "done"];
    if (f.step >= steps.length) f.step = steps.length - 1;
    if (f.step < 0) f.step = 0;
    var st = steps[f.step];
    function big(list, key, multi) {
      return (
        '<div class="wizc">' +
        list
          .map(function (x) {
            var on = multi ? f[key].indexOf(x) >= 0 : f[key] === x;
            return (
              '<button class="wizb' +
              (on ? " on" : "") +
              '" data-a="fc" data-k="' +
              key +
              '" data-v="' +
              esc(x) +
              '">' +
              esc(x) +
              (on ? " <span>✓</span>" : "") +
              "</button>"
            );
          })
          .join("") +
        "</div>"
      );
    }
    var Q = {
      who: ["Who started it?", big(WHO.map(nmz), "who")],
      trig: [
        "What was going on?",
        big(TRIG.map(nmz), "trig", true) +
          '<button class="b p w u-mt12 u-p14" data-a="fnext">' +
          (f.trig.length ? "Next" : "Not sure, skip") +
          "</button>"
      ],
      sev: ["How bad was it?", big(SEV, "sev")],
      where: ["Where did it happen?", big(WHERE, "where")],
      sep: ["Did you separate them?", big(["Yes", "No"], "sep")],
      pher: ["Was the diffuser plugged in?", big(["Yes", "No", "Not sure"], "pher")],
      done: ["All good?", ""]
    };
    var h =
      '<div class="modal" data-a="close"><div class="sheet wiz" data-stop="1"><div class="row between u-nowrap"><span class="small mute u-fw800">Log a fight · ' +
      (f.step + 1) +
      " of " +
      steps.length +
      '</span><button class="x" data-a="close">✕</button></div>' +
      '<div class="wizbar"><div style="width:' +
      Math.round(((f.step + 1) / steps.length) * 100) +
      '%"></div></div><h2 class="wizq">' +
      Q[st][0] +
      "</h2>" +
      Q[st][1];
    if (st === "done") {
      h +=
        steps
          .slice(0, -1)
          .map(function (k, i) {
            var v = k === "trig" ? (f.trig.length ? f.trig.join(", ") : "Not sure") : f[k] || "Not answered";
            return (
              '<button class="wizsum" data-a="fgo" data-v="' +
              i +
              '"><span class="small mute">' +
              Q[k][0] +
              "</span><b>" +
              esc(v) +
              "</b></button>"
            );
          })
          .join("") +
        '<div class="grid2 u-mt10"><div><label class="l">Date</label><input type="date" data-ff="d" value="' +
        f.d +
        '" max="' +
        today() +
        '"></div><div><label class="l">Time</label><input type="time" data-ff="m" value="' +
        f.m +
        '"></div></div>' +
        (ui.pend.length ? thumbs(ui.pend, "pend") : "") +
        '<div class="u-mt10">' +
        upBtn("pend", "fight", "📷 Add photo or video", "image/*,video/*").replace(
          'class="b s"',
          'class="b w upbig"'
        ) +
        "</div>" +
        '<label class="l">Notes (optional)</label><textarea rows="2" data-ff="n" placeholder="What happened just before?">' +
        esc(f.n) +
        "</textarea>" +
        '<button class="b p w u-mt14 u-p16 u-fs17" data-a="fsave">Save fight</button>';
    }
    if (f.step > 0) h += '<button class="b ghost u-mt10" data-a="fback">‹ Back</button>';
    return h + "</div></div>";
  }
