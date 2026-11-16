/* 08-today: The Food & play (Today) tab, the weekly check-in card and the 7-day summary. */
  function checkinCard(force) {
    var t = today(),
      ks = ["albert", "milly"].filter(function (k) {
        var w = sorted(S.cats[k]);
        return w.length && daysBetween(w[w.length - 1].d, t) <= 2;
      });
    if (!force) {
      if (!ks.length) return "";
      try {
        if (localStorage.getItem(LS + "-ci") === t) return "";
      } catch (e) {}
    } else ks = ["albert", "milly"];
    return (
      '<div class="card ci2"><div class="row between u-nowrap"><h2 class="u-m0">⚖️ Weekly check-in</h2>' +
      (force ? "" : '<button class="x" data-a="cidone" aria-label="Hide">✕</button>') +
      "</div>" +
      ks
        .map(function (k) {
          var o = checkin(k);
          if (!o) return "";
          return (
            '<div class="cir ' +
            o.tone +
            '">' +
            spot(k).replace('class="spot"', 'class="spot" style="width:34px;height:34px;flex:none"') +
            '<div class="u-flex1"><b>' +
            esc(o.head) +
            '</b><div class="small">' +
            esc(o.tx) +
            "</div>" +
            (o.apply
              ? '<button class="b s p" style="margin-top:8px" data-a="ciapply" data-k="' +
                k +
                '" data-v="' +
                o.apply +
                '">Change to ' +
                o.apply +
                " g</button>"
              : "") +
            "</div></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function weekSummary() {
    var t = today(),
      s0 = addDays(t, -6),
      p0 = addDays(t, -13),
      ks = ["albert", "milly"];
    function inW(d, a, b) {
      return d >= a && d <= b;
    }
    var rows = [];
    ks.forEach(function (k) {
      var c = S.cats[k],
        w = sorted(c),
        wk = w.filter(function (x) {
          return inW(x.d, s0, t);
        }),
        prev = w.filter(function (x) {
          return x.d < s0;
        }),
        lw = wk[wk.length - 1],
        pw = prev[prev.length - 1];
      var meals = 0,
        home = 0,
        kc = 0,
        kn = 0,
        pl = 0;
      for (var i = 0; i < 7; i++) {
        var d = addDays(s0, i),
          x = peek(c, d);
        if (!awayAt(k, d)) home++;
        if (!x) continue;
        var tt = dayTotals(c, x);
        if (tt.dry > 0 && tt.wet > 0) meals++;
        if (tt.kcal > 0) {
          kc += tt.kcal;
          kn++;
        }
        pl += tt.play;
      }
      var poo = (S.litter || []).filter(function (x) {
          return x.who === c.name && x.type === "Poo" && inW(x.d, s0, t);
        }),
        soft = poo.filter(function (x) {
          return /mushy|liquid|soft/i.test(x.cons || "");
        }).length;
      var rr = (c.rr || []).filter(function (x) {
          return inW(x.d, s0, t);
        }),
        ra = rr.length
          ? Math.round(
              rr.reduce(function (m, x) {
                return m + x.bpm;
              }, 0) / rr.length
            )
          : null;
      rows.push(
        '<div class="wsum"><div class="wsh2">' +
          spot(k).replace('class="spot"', 'class="spot" style="width:26px;height:26px"') +
          "<b>" +
          esc(c.name) +
          "</b></div><ul>" +
          "<li>Weight: " +
          (lw
            ? (+lw.kg).toFixed(2) +
              " kg" +
              (pw
                ? " (" + (lw.kg <= pw.kg ? "−" : "+") + Math.abs(Math.round((lw.kg - pw.kg) * 1000)) + " g)"
                : "")
            : "no weigh-in this week") +
          "</li>" +
          "<li>Both meals logged on " +
          meals +
          " of " +
          home +
          (home < 7 ? " days at home" : " days") +
          (kn ? ", about " + Math.round(kc / kn) + " kcal a day" : "") +
          "</li>" +
          "<li>Play: " +
          (pl ? Math.round(pl / 7) + " min a day on average" : "none logged") +
          "</li>" +
          "<li>Poo: " +
          (poo.length ? poo.length + " logged, " + soft + " soft" : "none logged") +
          "</li>" +
          (ra != null
            ? "<li>Sleeping breathing: " + ra + "/min average (" + rr.length + " counts)</li>"
            : "") +
          "</ul></div>"
      );
    });
    var fw = S.fights.filter(function (f) {
        return inW(f.d, s0, t);
      }).length,
      fp = S.fights.filter(function (f) {
        return inW(f.d, p0, addDays(s0, -1));
      }).length,
      cm = (S.calm || []).filter(function (x) {
        return inW(x.d, s0, t);
      }).length,
      bn = Object.keys(S.bed || {}).filter(function (d) {
        return inW(d, s0, t);
      }).length;
    rows.push(
      '<div class="wsum"><div class="wsh2"><b>Together</b></div><ul><li>' +
        fw +
        " fight" +
        (fw !== 1 ? "s" : "") +
        " this week, " +
        (fw < fp ? "down from " : fw > fp ? "up from " : "same as ") +
        fp +
        "</li><li>" +
        cm +
        " calm moment" +
        (cm !== 1 ? "s" : "") +
        " logged</li><li>Bedtime routine on " +
        bn +
        " of 7 nights</li></ul></div>"
    );
    var nx = [],
      e7 = addDays(t, 7);
    ks.forEach(function (k) {
      ["Worming", "Flea"].forEach(function (ty) {
        var du = treatDue(S.cats[k], ty);
        if (du && du.next <= e7) nx.push(ty + " for " + S.cats[k].name + " " + short(du.next));
      });
      S.cats[k].foods
        .filter(function (f) {
          return f.main;
        })
        .forEach(function (f) {
          var o = orderBy(k, f);
          if (o && o.by <= e7) nx.push("Order " + f.name.split(" (")[0] + " by " + short(o.by));
        });
      var q = (S.cats[k].vq || []).filter(function (x) {
        return !x.done;
      }).length;
      if (q) nx.push(q + " question" + (q > 1 ? "s" : "") + " for the vet about " + S.cats[k].name);
    });
    ((S.info && S.info.bookings) || []).forEach(function (b) {
      if (b.from && b.from >= t && b.from <= e7)
        nx.push((b.place || "Booking") + " drop-off " + short(b.from));
    });
    (S.todos || []).forEach(function (x) {
      if (!x.done && x.due && x.due <= e7)
        nx.push(x.text + (x.due < t ? " (overdue)" : " by " + short(x.due)));
    });
    rows.push(
      '<div class="wsum"><div class="wsh2"><b>Next 7 days</b></div>' +
        (nx.length
          ? "<ul>" +
            nx
              .map(function (x) {
                return "<li>" + esc(x) + "</li>";
              })
              .join("") +
            "</ul>"
          : '<div class="small mute">Nothing due.</div>') +
        "</div>"
    );
    return rows.join("");
  }

  function weekCard(force) {
    var dow = new Date().getDay(),
      t = today();
    if (!force) {
      if (!(dow === 0 || (dow === 1 && new Date().getHours() < 14))) return "";
      try {
        if (localStorage.getItem(LS + "-ws") === t) return "";
      } catch (e) {}
    }
    return (
      '<details class="card wkc" data-open="wkc"' +
      (force ? "" : isOpen("wkc", true)) +
      '><summary><h2 class="u-d-inline">📊 Your week · ' +
      short(addDays(t, -6)) +
      " to " +
      short(t) +
      "</h2></summary>" +
      weekSummary() +
      (force
        ? ""
        : '<button class="b s ghost u-mt8" data-a="wsdone">Hide until next Sunday</button>') +
      "</details>"
    );
  }

  function vToday() {
    var c = cat(),
      d = day(c),
      r = stats(c),
      st = status(r, c),
      t = dayTotals(c, d),
      fd = feed(c);
    var h =
      (ui.day === today() ? headline() + (DEMO ? "" : notesCard()) + checkinCard() + weekCard() : "") +
      '<div class="datebar"><button class="b" data-a="day" data-v="-1">‹</button><b>' +
      nice(ui.day) +
      '</b><button class="b" data-a="day" data-v="1" ' +
      (ui.day >= today() ? 'disabled style="opacity:.3"' : "") +
      ">›</button></div>";
    if (
      new Date().getDay() === 6 &&
      ui.day === today() &&
      ["albert", "milly"].some(function (k) {
        return !S.cats[k].weights.some(function (w) {
          return w.d === today();
        });
      })
    )
      h +=
        '<button class="b p w u-mb12 u-p14" data-a="tab" data-v="weight">⚖️ It\'s Saturday: weigh-in day. Tap to log</button>';
    var prog =
      r && r.first.kg > c.target
        ? Math.max(0, Math.min(100, ((r.first.kg - r.last.kg) / (r.first.kg - c.target)) * 100))
        : 0;
    var lows = [];
    ["albert", "milly"].forEach(function (k) {
      S.cats[k].foods
        .filter(function (f) {
          return f.main;
        })
        .forEach(function (f) {
          var ob = orderBy(k, f);
          if (ob && ob.days < 7) lows.push(f.name);
        });
    });
    var dueT = S.todos.filter(function (x) {
      return !x.done && x.due && x.due <= addDays(today(), 3);
    });
    ["albert", "milly"].forEach(function (k) {
      ["Worming", "Flea"].forEach(function (ty) {
        var du = treatDue(S.cats[k], ty);
        if (du && du.days <= 3) dueT.push({ text: "" });
      });
    });
    if (lows.length)
      h +=
        '<div class="row u-gap6 u-mb10 u-wrap">' +
        (lows.length ? "" : "") +
        "" +
        "</div>";
    if (0)
      h +=
        '<div class="hero mini"><div class="top">' +
        spot(ui.cat) +
        '<div class="u-flex1"><div class="row between"><span class="nm">' +
        esc(c.name) +
        '</span><span class="wt">' +
        (r ? r.last.kg.toFixed(2) : "–") +
        " <small>kg</small></span></div>" +
        '<div class="track"><div style="width:' +
        Math.max(prog, 2) +
        '%"></div></div><div class="ends"><span>' +
        esc(st[1]) +
        "</span><span>" +
        (r && r.toGo > 0 ? r.toGo.toFixed(2) + " kg to go" : "target " + c.target + " kg") +
        "</span></div></div></div></div>";
    var meals = d.meals || [],
      RXL = { all: ["😋", "Ate it all"], some: ["😐", "Some"], no: ["🙅", "Refused"] };
    function tile(lbl, val, max, txt, k) {
      return (
        "<" +
        (k ? 'button data-a="mopen" data-v="' + k + '"' : "div") +
        ' class="tile' +
        (k ? " tap" : "") +
        '"><span class="mute small">' +
        lbl +
        (k ? ' <span class="tplus">＋</span>' : "") +
        "</span><b>" +
        txt +
        "</b>" +
        bar(val, max) +
        "</" +
        (k ? "button" : "div") +
        ">"
      );
    }
    if (ui.day === today()) h += weekStrip();
    if (ui.day === today()) h += whoCard();
    if (ui.day !== today()) {
      var dx0 = peek(c, ui.day),
        lx0 = (S.litter || []).some(function (x) {
          return x.d === ui.day && x.who === c.name;
        }),
        has0 =
          dx0 &&
          (Object.keys(dx0.f || {}).some(function (q) {
            return dx0.f[q];
          }) ||
            Object.keys(dx0.play || {}).some(function (q) {
              return dx0.play[q];
            }) ||
            dx0.note ||
            (dx0.photos || []).length);
      if (!has0 && !lx0)
        h +=
          '<div class="card">' +
          emptyState(
            bowlArt(),
            "Nothing logged for " +
              esc(c.name) +
              " on " +
              parse(ui.day).toLocaleDateString("en-GB", { weekday: "long" }),
            "Fill it in if you remember. Every day helps the averages.",
            '<div class="row u-gap8 u-jc-center"><button class="b s p" data-a="mopen" data-v="dry">Add breakfast</button><button class="b s" data-a="mopen" data-v="wet">Add dinner</button></div>'
          ) +
          "</div>";
    }
    if (c.plan)
      h +=
        '<details class="card" data-open="fplan-' +
        ui.cat +
        '"' +
        isOpen("fplan-" + ui.cat, false) +
        '><summary><h2 class="u-d-inline">🍽️ Feeding plan</h2></summary>' +
        profText(c.plan) +
        "</details>";
    h +=
      '<div class="card"><h2>Today so far</h2><div class="tiles">' +
      tile(
        "Dry",
        t.dry,
        c.dryAllowance,
        fmt(t.dry) + (c.dryAllowance ? "<small>/" + c.dryAllowance + " g</small>" : " g"),
        "dry"
      ) +
      tile("Wet", t.wet, c.wetAllowance, fmt(t.wet) + "<small>/" + c.wetAllowance + "</small>", "wet") +
      tile(
        "kcal",
        t.kcal,
        fd.hi,
        Math.round(t.kcal) + "<small>/" + Math.round(fd.lo) + "–" + Math.round(fd.hi) + "</small>"
      ) +
      "</div>" +
      '<div class="row between u-mt10"><span class="small">Treats: <b>' +
      (d.treats || 0) +
      '</b></span><button class="b s" data-a="treat" data-v="1">+1 treat</button></div>' +
      (meals.length
        ? '<details data-open="tmeals"' +
          isOpen("tmeals", false) +
          ' style="margin-top:8px"><summary class="small mute">Meals today (' +
          meals.length +
          ")</summary>" +
          meals
            .map(function (m) {
              var f = c.foods.filter(function (x) {
                  return x.id === m.f;
                })[0],
                dry = f && f.kind === "dry";
              return (
                '<div class="row between swr" data-del="mdel" data-id="' +
                m.id +
                '" style="flex-wrap:nowrap;gap:8px;padding:8px 0;border-top:1px solid var(--line)"><span>' +
                (RXL[m.rx] || ["", ""])[0] +
                " <b>" +
                esc(f ? f.name : "(removed food)") +
                '</b><br><span class="small mute">' +
                (m.t ? m.t + " · " : "") +
                fmt(m.a) +
                (dry ? " g" : " ×") +
                " · " +
                (RXL[m.rx] || ["", ""])[1] +
                (m.who ? " · " + esc(m.who) : "") +
                ((m.add || []).length ? " · + " + esc(m.add.join(", ")) : "") +
                '</span></span><button class="x" data-a="mdel" data-v="' +
                m.id +
                '">✕</button></div>'
              );
            })
            .join("") +
          "</details>"
        : "") +
      '<details data-open="tadj"' +
      isOpen("tadj", false) +
      ' style="margin-top:6px"><summary class="small mute">Adjust totals by hand</summary>' +
      c.foods
        .map(function (f) {
          var a = d.f[f.id] || 0,
            dry = f.kind === "dry";
          return (
            '<div class="row between u-mt6"><span class="small">' +
            esc(f.name) +
            '</span><span class="row"><input class="amt" inputmode="decimal" data-amt="food" data-k="' +
            f.id +
            '" value="' +
            fmt(a) +
            '"><span class="mute small">' +
            (dry ? "g" : "×") +
            "</span></span></div>"
          );
        })
        .join("") +
      '<div class="row between u-mt6"><span class="small">Treats / extras</span><input class="amt" inputmode="decimal" data-amt="treat" value="' +
      (d.treats || 0) +
      '"></div></details></div>';
    if (c.checks.length)
      h +=
        '<div class="card"><h2>Daily checklist</h2>' +
        c.checks
          .map(function (k, i) {
            var done = !!d.checks[k];
            return (
              '<div class="check' +
              (done ? " done" : "") +
              '" data-a="chk" data-v="' +
              i +
              '"><span class="box">' +
              (done ? "✓" : "") +
              "</span><span>" +
              esc(k) +
              (function () {
                var mm = (d.meals || []).filter(function (m) {
                    return (m.add || []).indexOf(k) >= 0;
                  })[0],
                  ff =
                    mm &&
                    c.foods.filter(function (f) {
                      return f.id === mm.f;
                    })[0];
                return mm
                  ? ' <span class="small mute">· in ' +
                      esc(ff ? ff.name.split(" (")[0] : "a meal") +
                      (mm.t ? " at " + mm.t : "") +
                      "</span>"
                  : lastDone(c, k);
              })() +
              "</span></div>"
            );
          })
          .join("") +
        "</div>";
    var ps = Math.min(ui.psel || 0, S.playTypes.length - 1),
      done = S.playTypes
        .filter(function (p) {
          return d.play[p];
        })
        .map(function (p) {
          return esc(p) + " " + d.play[p];
        });
    var TM = tGet(),
      tmHere = TM && TM.cat === ui.cat;
    h +=
      '<details class="nf" data-open="tplayc"' +
      (tmHere ? " open" : isOpen("tplayc", false)) +
      "><summary><span>🧶 Play · " +
      t.play +
      " min today" +
      (tmHere ? ' <span class="nfc">⏱ on</span>' : "") +
      '</span></summary><div class="card u-m0">' +
      (TM
        ? timerBanner().replace(
            "position:sticky;top:calc(env(safe-area-inset-top) + 34px);z-index:4",
            "margin:0 0 12px"
          )
        : "") +
      (done.length
        ? '<div class="u-mb10">' +
          S.playTypes
            .filter(function (p) {
              return d.play[p];
            })
            .map(function (p) {
              return (
                '<div class="srow"><div class="u-flex1"><b>' +
                esc(p) +
                "</b></div><b>" +
                d.play[p] +
                ' min</b><button class="x" data-a="pldel" data-v="' +
                esc(p) +
                '">✕</button></div>'
              );
            })
            .join("") +
          "</div>"
        : '<div class="mute small u-mb10">Nothing logged yet today.</div>') +
      '<button class="symbtn fbtn u-minh58 u-fs17" data-a="plopen">🧶 Log play</button>' +
      '<details data-open="tplay"' +
      isOpen("tplay", false) +
      ' style="margin-top:8px"><summary class="small mute">Edit minutes</summary>' +
      S.playTypes
        .map(function (p, i) {
          return (
            '<div class="row between u-mt6"><span class="small">' +
            esc(p) +
            '</span><span class="row"><input class="amt" inputmode="numeric" data-amt="play" data-k="' +
            i +
            '" value="' +
            (d.play[p] || 0) +
            '"><span class="mute small">min</span></span></div>'
          );
        })
        .join("") +
      "</details></div></details>";
    var hasN = !!(d.note || d.photos.length);
    h +=
      '<details class="nf" data-open="tnote"' +
      isOpen("tnote", false) +
      "><summary><span>📝 Note &amp; photos" +
      (hasN ? ' <span class="nfc">' + (d.photos.length + (d.note ? 1 : 0)) + "</span>" : "") +
      '</span></summary><div class="card u-m0"><textarea rows="2" class="u-mt10" data-a="note" placeholder="Begging, ate slowly, sitter visit…">' +
      esc(d.note) +
      "</textarea>" +
      (d.photos.length ? thumbs(d.photos, "day") : "") +
      '<div class="u-mt10">' +
      upBtn("day", "", "📷 Take or add photo", "image/*") +
      "</div></div></details>";
    return h;
  }
