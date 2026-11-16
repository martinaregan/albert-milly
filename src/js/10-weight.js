/* 10-weight: The Weight tab: charts (one cat and both cats), weigh-in sheet, progress, history, feeding suggestion. */
  function bothChart() {
    var ks = ["albert", "milly"],
      L = ks
        .map(function (k) {
          var c = S.cats[k],
            w = sorted(c);
          return { k: k, c: c, w: w, f: w[0] };
        })
        .filter(function (x) {
          return x.w.length;
        });
    if (!L.length) return emptyState("", "No weigh-ins yet", "", "");
    var all = [].concat
        .apply(
          [],
          L.map(function (x) {
            return x.w.map(function (p) {
              return p.d;
            });
          })
        )
        .sort(),
      d0 = all[0],
      d1 = all[all.length - 1],
      span = Math.max(7, daysBetween(d0, d1));
    function pct(x, kg) {
      return ((kg - x.f.kg) / x.f.kg) * 100;
    }
    var tg = L.map(function (x) {
        return pct(x, x.c.target);
      }),
      vals = [].concat
        .apply(
          [],
          L.map(function (x) {
            return x.w.map(function (p) {
              return pct(x, p.kg);
            });
          })
        )
        .concat(tg, [0]);
    var mn = Math.floor(Math.min.apply(0, vals) / 5) * 5 - 2,
      mx = Math.max(4, Math.ceil(Math.max.apply(0, vals)));
    var W = 520,
      H = 210,
      P = 40;
    function X(d) {
      return P + (daysBetween(d0, d) / span) * (W - P - 14);
    }
    function Y(v) {
      return 10 + ((mx - v) / (mx - mn)) * (H - 34);
    }
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="100%">';
    for (var v = Math.ceil(mn / 5) * 5; v <= mx; v += 5)
      s +=
        '<line x1="' +
        P +
        '" x2="' +
        (W - 10) +
        '" y1="' +
        Y(v) +
        '" y2="' +
        Y(v) +
        '" stroke="var(--line)"/><text x="2" y="' +
        (Y(v) + 4) +
        '">' +
        (v > 0 ? "+" : "") +
        v +
        "%</text>";
    L.forEach(function (x, i) {
      var col = colOf(x.k);
      s +=
        '<line x1="' +
        P +
        '" x2="' +
        (W - 10) +
        '" y1="' +
        Y(tg[i]) +
        '" y2="' +
        Y(tg[i]) +
        '" stroke="' +
        col +
        '" stroke-dasharray="4 5" opacity=".55"/>' +
        '<polyline fill="none" stroke="' +
        col +
        '" stroke-width="3" stroke-linejoin="round" points="' +
        x.w
          .map(function (p) {
            return X(p.d) + "," + Y(pct(x, p.kg));
          })
          .join(" ") +
        '"/>' +
        x.w
          .map(function (p) {
            return '<circle cx="' + X(p.d) + '" cy="' + Y(pct(x, p.kg)) + '" r="4" fill="' + col + '"/>';
          })
          .join("");
    });
    s +=
      '<text x="' +
      P +
      '" y="' +
      (H - 4) +
      '">' +
      short(d0) +
      '</text><text x="' +
      (W - 12) +
      '" y="' +
      (H - 4) +
      '" text-anchor="end">' +
      short(d1) +
      "</text></svg>";
    return (
      s +
      '<div class="small mute u-d-flex u-gap14 u-wrap u-mt4">' +
      L.map(function (x, i) {
        return (
          '<span><b style="color:' +
          (colOf(x.k)) +
          '">━</b> ' +
          esc(x.c.name) +
          " " +
          (pct(x, x.w[x.w.length - 1].kg) <= 0 ? "" : "+") +
          pct(x, x.w[x.w.length - 1].kg).toFixed(1) +
          "% · goal " +
          tg[i].toFixed(0) +
          "%</span>"
        );
      }).join("") +
      '</div><div class="note">Change from each cat\'s first weigh-in, so both fit on one scale. Dashed lines are their goals.</div>'
    );
  }

  function chart(c) {
    var w = sorted(c);
    if (!w.length) return "";
    var r = stats(c);
    var W = 520,
      H = 210,
      P = 34,
      first = w[0],
      last = w[w.length - 1];
    var planWk = first.kg > c.target ? Math.log(c.target / first.kg) / Math.log(0.99) : 0,
      planEnd = planWk > 0 ? addDays(first.d, Math.round(planWk * 7)) : null;
    var eta = r && r.eta && daysBetween(last.d, r.eta) <= 730 ? r.eta : null,
      endD = last.d;
    if (planEnd && planEnd > endD) endD = planEnd;
    if (eta && eta > endD) endD = eta;
    var kgs = w
      .map(function (x) {
        return x.kg;
      })
      .concat([c.target]);
    var mn = Math.floor(Math.min.apply(0, kgs) * 2) / 2 - 0.2,
      mx = Math.ceil(Math.max.apply(0, kgs) * 2) / 2 + 0.2;
    var d0 = first.d,
      span = Math.max(7, daysBetween(d0, endD));
    function X(d) {
      return P + (daysBetween(d0, d) / span) * (W - P - 14);
    }
    function Y(k) {
      return 10 + ((mx - k) / (mx - mn)) * (H - 34);
    }
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="100%">',
      step = mx - mn > 3 ? 1 : 0.5;
    for (var k = Math.ceil(mn / step) * step; k <= mx; k += step)
      s +=
        '<line x1="' +
        P +
        '" x2="' +
        (W - 10) +
        '" y1="' +
        Y(k) +
        '" y2="' +
        Y(k) +
        '" stroke="var(--line)"/><text x="2" y="' +
        (Y(k) + 4) +
        '">' +
        wn(k, 1) +
        "</text>";
    s +=
      '<line x1="' +
      P +
      '" x2="' +
      (W - 10) +
      '" y1="' +
      Y(c.target) +
      '" y2="' +
      Y(c.target) +
      '" stroke="var(--ok)" stroke-dasharray="5 4" stroke-width="2"/><text x="' +
      (P + 4) +
      '" y="' +
      (Y(c.target) + 15) +
      '" style="fill:var(--ok)">target ' +
      wt(c.target, "t") +
      "</text>";
    if (planEnd) {
      var pts = [];
      for (var wk = 0; wk <= Math.ceil(planWk); wk++) {
        var kg = Math.max(c.target, first.kg * Math.pow(0.99, wk));
        pts.push(X(addDays(d0, wk * 7)) + "," + Y(kg));
      }
      s +=
        '<polyline fill="none" stroke="var(--mute)" stroke-width="1.5" stroke-dasharray="2 4" points="' +
        pts.join(" ") +
        '"/>';
    }
    if (eta)
      s +=
        '<line x1="' +
        X(last.d) +
        '" y1="' +
        Y(last.kg) +
        '" x2="' +
        X(eta) +
        '" y2="' +
        Y(c.target) +
        '" stroke="' +
        c.color +
        '" stroke-width="2.5" stroke-dasharray="7 5" opacity=".8"/><circle cx="' +
        X(eta) +
        '" cy="' +
        Y(c.target) +
        '" r="5" fill="none" stroke="' +
        c.color +
        '" stroke-width="2.5"/>';
    s +=
      '<polyline fill="none" stroke="' +
      c.color +
      '" stroke-width="3" stroke-linejoin="round" points="' +
      w
        .map(function (p) {
          return X(p.d) + "," + Y(p.kg);
        })
        .join(" ") +
      '"/>';
    w.forEach(function (p) {
      s += '<circle cx="' + X(p.d) + '" cy="' + Y(p.kg) + '" r="4.5" fill="' + c.color + '"/>';
    });
    function mon(d) {
      return parse(d).toLocaleDateString(LOC(), { month: "short", year: "2-digit" });
    }
    s +=
      '<text x="' +
      P +
      '" y="' +
      (H - 4) +
      '">' +
      short(d0) +
      '</text><text x="' +
      (W - 12) +
      '" y="' +
      (H - 4) +
      '" text-anchor="end">' +
      mon(endD) +
      "</text></svg>";
    var lg =
      '<div class="small mute u-d-flex u-gap14 u-wrap u-mt4"><span><b style="color:' +
      c.color +
      '">━</b> weigh-ins</span>' +
      (eta ? '<span><b style="color:' + c.color + '">╌</b> current pace → ' + mon(eta) + "</span>" : "") +
      (planEnd ? "<span><b>┈</b> 1% a week plan → " + mon(planEnd) + "</span>" : "") +
      "</div>";
    var verdict = "";
    if (r && r.toGo > 0) {
      if (r.kgWeek == null) verdict = "Need two weigh-ins at least 5 days apart to show a pace.";
      else if (r.kgWeek <= 0)
        verdict =
          "Not losing yet at the current pace, so there is no finish date. Give it 2 to 3 weigh-ins before changing anything.";
      else if (planEnd && eta)
        verdict =
          eta <= planEnd
            ? "Ahead of the 1% a week plan."
            : "Behind the 1% a week plan, by about " + Math.round(daysBetween(planEnd, eta) / 7) + " weeks.";
    }
    return s + lg + (verdict ? '<div class="note">' + verdict + "</div>" : "");
  }

  function weighSheet() {
    var c = cat(),
      W = ui.w || (ui.w = { d: today(), me: "", albert: "", milly: "", direct: "" });
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">Add a weigh-in</h2>' +
      '<div class="mute small">Weigh yourself, then step on again holding each cat. It works out their weight.</div>' +
      '<label class="l">Date</label><input type="date" data-w="d" value="' +
      W.d +
      '" max="' +
      today() +
      '">' +
      '<label class="l">1. You on your own (' + UL() + ")</label>" + '<input data-w="me" inputmode="decimal" placeholder="e.g. 62.4" value="' +
      esc(W.me) +
      '">' +
      ["albert", "milly"]
        .map(function (k) {
          return (
            '<label class="l">' +
            spot(k) +
            " You holding " +
            S.cats[k].name +
            " (" + UL() + ')</label><div class="row u-nowrap"><input data-w="' +
            k +
            '" inputmode="decimal" placeholder="leave blank to skip" value="' +
            esc(W[k]) +
            '"><b id="res-' +
            k +
            '" style="flex:none;white-space:nowrap;text-align:right;padding-left:10px"></b></div><div id="cmp-' +
            k +
            '" class="small mute"></div>'
          );
        })
        .join("") +
      '<button class="b p w u-mt12" data-a="addw2">Save weigh-in</button>' +
      '<details class="u-mt10"><summary class="mute small">Weighed them on a pet scale instead?</summary>' +
      ["albert", "milly"]
        .map(function (k) {
          return (
            '<div class="row u-nowrap u-mt8">' +
            spot(k).replace('class="spot"', 'class="spot" style="width:28px;height:28px;flex:none"') +
            '<input id="wk-' +
            k +
            '" inputmode="decimal" placeholder="' +
            esc(S.cats[k].name) +
            "'s weight (" + UL() + ')"><button class="b" data-a="addw" data-cat="' +
            k +
            '">Save</button></div>'
          );
        })
        .join("") +
      "</details>" +
      '<details class="u-mt6"><summary class="mute small">Tips</summary><div class="note">Same scale, same time of day (before breakfast), once a week. Bathroom scales can be 100 to 200 g out, so a single reading is a rough guide; the trend over a few weeks is what counts.</div></details><div class="row u-mt12"><button class="b" data-a="close">Cancel</button></div></div></div>'
    );
  }

  function weightProgress(c, r) {
    var st = status(r, c),
      ww = sorted(c),
      wl = ww.length > 1 ? ww[ww.length - 2].kg - ww[ww.length - 1].kg : 0;
    var happy =
      (wl > 0.01 && ww[ww.length - 1].kg >= c.target - 0.001) || wl > 0.01
        ? '<div class="happy">' +
          spot(c === S.cats.albert ? "albert" : "milly") +
          "<span><b>Down " +
          Math.round(wl * 1000) +
          " g</b> since the last weigh-in. Nice work.</span></div>"
        : "";
    if (!r)
      return '<span class="pill neutral">No weigh-ins yet</span><div class="note">Tap Add a weigh-in above to start.</div>';
    var span = r.lost + Math.max(r.toGo, 0),
      frac = span > 0 ? Math.max(0, Math.min(1, r.lost / span)) : 0;
    return (
      happy +
      '<span class="pill ' +
      st[0] +
      '">' +
      st[1] +
      '</span><div class="bar u-mt10"><div style="width:' +
      Math.max(frac * 100, 2) +
      '%"></div></div>' +
      '<div class="grid3 u-mt10"><div class="stat"><span class="mute">Lost</span><b>' +
      wt(r.lost) +
      '</b><span class="mute small">' +
      r.pct.toFixed(1) +
      "%</span></div>" +
      '<div class="stat"><span class="mute">To go</span><b>' +
      wt(r.toGo > 0 ? r.toGo : 0) +
      "</b></div>" +
      '<div class="stat"><span class="mute">Per week</span><b>' +
      (r.kgWeek != null ? wg(r.kgWeek * 1000) : "-") +
      "</b></div></div>" +
      '<div class="u-mt12">' +
      chart(c) +
      "</div>" +
      (r.eta
        ? '<div class="note">At this rate ' +
          esc(c.name) +
          " reaches " +
          wt(c.target, "t") +
          " around <b>" +
          parse(r.eta).toLocaleDateString(LOC(), { month: "long", year: "numeric" }) +
          "</b>.</div>"
        : "") +
      '<div class="note">Safe loss for ' +
      esc(c.name) +
      ": " +
      (unit() === "lb" ? ((r.last.kg * 10) / 28.35).toFixed(1) : Math.round(r.last.kg * 10)) +
      "-" +
      wg(r.last.kg * 15) +
      " a week (1-1.5% of current weight). Faster than that risks fatty liver.</div>"
    );
  }

  function weightHistory(k, c) {
    var w = sorted(c).reverse();
    if (!w.length)
      return emptyState(
        "",
        "No weigh-ins yet",
        "Saturday morning, before breakfast, is weigh-in time.",
        '<button class="b s p" data-a="wopen">Add a weigh-in</button>'
      );
    return (
      '<div class="list u-mt10">' +
      w
        .map(function (x) {
          return (
            '<div class="it row between"><span>' +
            short(x.d) +
            " " +
            parse(x.d).getFullYear() +
            "</span><span><b>" +
            wt(x.kg) +
            '</b><button class="x" data-a="wedit" data-cat="' +
            k +
            '" data-v="' +
            x.d +
            '">Edit</button><button class="x" data-a="delw" data-cat="' +
            k +
            '" data-v="' +
            x.d +
            '">✕</button></span></div>'
          );
        })
        .join("") +
      "</div>"
    );
  }

  function weightFeed(c) {
    var fd = feed(c);
    return (
      '<div class="grid2"><div class="stat"><span class="mute">Current plan</span><b>' +
      Math.round(fd.plan) +
      ' kcal</b><span class="mute small">' +
      (fd.dry ? c.dryAllowance + " g dry" : "") +
      (fd.wet ? " + " + c.wetAllowance + " wet" : "") +
      "</span></div>" +
      '<div class="stat"><span class="mute">Loss range</span><b>' +
      Math.round(fd.lo) +
      "-" +
      Math.round(fd.hi) +
      '</b><span class="mute small">' +
      (c.kcalLo && c.kcalHi ? "kcal/day, vet plan" : "kcal/day at " + wt(c.target, "t")) +
      "</span></div></div>" +
      (fd.dry
        ? '<div class="note">With ' +
          c.wetAllowance +
          " × " +
          esc(fd.wet ? fd.wet.name : "wet") +
          ", that range works out at <b>" +
          Math.round(fd.dLo) +
          "-" +
          Math.round(fd.dHi) +
          " g</b> of " +
          esc(fd.dry.name) +
          " a day.</div>"
        : "") +
      (fd.plan > fd.hi * 1.1
        ? '<div class="note u-c-var---warn">The current plan is above the formula range. That is fine while the scale shows steady loss. Close the gap in steps of about 10% rather than all at once.</div>'
        : "") +
      (function () {
        var k = c === S.cats.albert ? "albert" : "milly",
          o = checkin(k);
        return o
          ? '<div class="note u-c-var---ink"><b>This week:</b> ' +
              esc(o.tx) +
              (o.apply
                ? ' <button class="b s p" data-a="ciapply" data-k="' +
                  k +
                  '" data-v="' +
                  o.apply +
                  '">Change to ' +
                  o.apply +
                  " g</button>"
                : "") +
              "</div>"
          : '<div class="note u-c-var---ink"><b>Next step:</b> ' + fd.step + "</div>";
      })() +
      '<div class="note">Uses the standard vet formula (70 × target kg<sup>0.75</sup>, × 0.8-1.0) and the calories on each food. Run changes past the vet, especially for prescription food.</div>'
    );
  }

  function eatTally(c) {
    var tal = {};
    Object.keys(c.days).forEach(function (k) {
      var x = c.days[k];
      if (x.meals && x.meals.length)
        x.meals.forEach(function (m) {
          var n = tal[m.f] || (tal[m.f] = { all: 0, some: 0, no: 0 });
          if (n[m.rx] != null) n[m.rx]++;
        });
      else
        Object.keys(x.react || {}).forEach(function (fid) {
          var r = x.react[fid],
            n = tal[fid] || (tal[fid] = { all: 0, some: 0, no: 0 });
          if (n[r] != null) n[r]++;
        });
    });
    return tal;
  }

  function likesBlock(k, c) {
    var tal = eatTally(c),
      yes = [],
      no = [];
    c.foods.forEach(function (f) {
      var n = tal[f.id];
      if (!n) return;
      (n.no > n.all + n.some ? no : yes).push(f.name);
    });
    function list(a, empty) {
      return a.length
        ? '<ul class="kvl">' +
            a
              .map(function (x) {
                return "<li>" + esc(x) + "</li>";
              })
              .join("") +
            "</ul>"
        : '<div class="pl mute small">' + empty + "</div>";
    }
    return (
      '<details class="nf" data-open="wfp-' +
      k +
      '"' +
      isOpen("wfp-" + k, false) +
      '><summary><span>🍽️ Food preferences</span></summary><div class="fpin"><details class="nf" data-open="wl-' +
      k +
      '"' +
      isOpen("wl-" + k, false) +
      '><summary><span>😋 Likes <span class="nfc">' +
      yes.length +
      "</span></span></summary>" +
      list(yes, "Nothing yet. Foods show up here when " + esc(c.name) + " eats them.") +
      "</details>" +
      '<details class="nf" data-open="wn-' +
      k +
      '"' +
      isOpen("wn-" + k, false) +
      '><summary><span>🙅 Doesn\'t like <span class="nfc">' +
      no.length +
      "</span></span></summary>" +
      list(no, "Nothing yet. Foods show up here when you log them as refused.") +
      "</details></div></details>"
    );
  }

  function nextWeighIn() {
    var t = today(),
      dow = parse(t).getDay(),
      gap = (6 - dow + 7) % 7,
      lastSat = addDays(t, -((dow + 1) % 7)),
      weighedSince = function (d) {
        return ["albert", "milly"].every(function (k) {
          return S.cats[k].weights.some(function (w) {
            return w.d >= d;
          });
        });
      };
    if (gap !== 0 && !weighedSince(lastSat))
      return { d: lastSat, days: -daysBetween(lastSat, t), over: true };
    if (gap === 0 && weighedSince(t)) gap = 7;
    return { d: addDays(t, gap), days: gap };
  }

  function vWeight() {
    var nw = nextWeighIn(),
      od = -nw.days,
      when = nw.over
        ? "Over by " + od + " day" + (od > 1 ? "s" : "")
        : nw.days === 0
          ? "Today"
          : nw.days === 1
            ? "Tomorrow"
            : "In " + nw.days + " days";
    var h =
      '<div class="wcount' +
      (nw.over ? " over" : "") +
      '"><div><span class="small mute">' +
      (nw.over ? "Weigh-in missed" : "Next weigh-in") +
      "</span><b>" +
      when +
      '</b><span class="small mute">' +
      (nw.over
        ? "Was due Saturday " + short(nw.d) + " · weigh them today"
        : "Saturday " + short(nw.d) + (nw.days === 0 ? " · before breakfast" : "")) +
      '</span></div><div class="wdays' +
      (nw.days === 0 ? " now" : "") +
      '">' +
      (nw.days === 0
        ? "⚖️"
        : nw.over
          ? "+" + od + "<small>over</small>"
          : nw.days + "<small>day" + (nw.days > 1 ? "s" : "") + "</small>") +
      "</div></div>";
    h +=
      '<button class="b p w u-m0-0-12 u-p16 u-fs17" data-a="wopen">⚖️ Add a weigh-in for both</button>';
    h +=
      '<details class="nf u-mb12" data-open="wboth" data-lazy' +
      isOpen("wboth", false) +
      '><summary><span>📈 Both cats on one chart</span></summary><div class="card u-m0">' +
      (lazyOpen("wboth") ? bothChart() : "") +
      "</div></details>";
    h += ["albert", "milly"]
      .map(function (k) {
        var c = S.cats[k],
          r = stats(c);
        return (
          '<details class="catcard catd" data-open="w-' +
          k +
          '"' +
          isOpen("w-" + k, false) +
          '><summary class="head" style="--g:var(--g-' +
          k +
          ')">' +
          spot(k) +
          "<div><b>" +
          esc(c.name) +
          "</b><span>" +
          (r
            ? wt(r.last.kg) +
              " → " +
              wt(c.target, "t") +
              (r.toGo > 0 ? " · " + wt(r.toGo) + " to go" : " · target reached")
            : "target " + wt(c.target, "t")) +
          "</span>" +
          (function () {
            var sp = r ? r.lost + Math.max(r.toGo, 0) : 0,
              f = sp > 0 ? Math.max(0, Math.min(1, r.lost / sp)) : 0;
            return (
              '<div class="hpbar"><div style="width:' +
              Math.max(f * 100, 3) +
              '%"></div></div><span class="hpct">' +
              Math.round(f * 100) +
              "% of the way</span>"
            );
          })() +
          "</div></summary>" +
          weightProgress(c, r) +
          '<details class="nf" data-open="wh-' +
          k +
          '" data-lazy' +
          isOpen("wh-" + k, false) +
          "><summary><span>📈 History</span></summary>" +
          (lazyOpen("wh-" + k) ? weightHistory(k, c) : "") +
          "</details>" +
          '<details class="nf" data-open="wf-' +
          k +
          '"' +
          isOpen("wf-" + k, false) +
          "><summary><span>🍽️ Feeding suggestion</span></summary>" +
          weightFeed(c) +
          "</details>" +
          likesBlock(k, c) +
          "</details>"
        );
      })
      .join("");
    return h;
  }
