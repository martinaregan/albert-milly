/* 04-today-features: Usual meals, undo toast, headline card, quick log, search, who did what, app badge, celebrations, empty states. */
  // Holiday mode: the booking (cat hotel stay) that covers this cat on this day.
  // With a meal kind: drop-off day still has breakfast at home, pick-up day has dinner at home.
  // Without: only the full days in between count as away.
  function awayAt(k, d, kind) {
    var nm = S.cats[k].name;
    return (
      ((S.info && S.info.bookings) || []).filter(function (b) {
        if (!b.from || ((b.cats || []).length && b.cats.indexOf(nm) < 0)) return false;
        var to = b.to || b.from;
        if (d < b.from || d > to) return false;
        if (!kind) return d > b.from && d < to;
        if (d === b.from) return kind !== "dry";
        if (d === to) return kind === "dry";
        return true;
      })[0] || null
    );
  }

  function usualMeal(k, kind) {
    var c = S.cats[k],
      f = c.foods.filter(function (x) {
        return x.main && (kind === "dry" ? x.kind === "dry" : x.kind !== "dry");
      })[0];
    if (!f) return null;
    var a = kind === "dry" ? c.dryAllowance : c.wetAllowance;
    if (!(a > 0)) return null;
    return { f: f, a: a, add: kind === "dry" ? [] : addables(c) };
  }

  function toast(msg, undoFn) {
    var old = document.getElementById("toast");
    if (old) old.remove();
    clearTimeout(toast.t);
    var el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.innerHTML = tr("<span>" + esc(msg) + "</span>" + (undoFn ? '<button type="button">Undo</button>' : ""));
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("on");
    });
    function hide() {
      el.classList.remove("on");
      setTimeout(function () {
        el.remove();
      }, 300);
    }
    if (undoFn)
      el.querySelector("button").addEventListener("click", function (e) {
        e.stopPropagation();
        clearTimeout(toast.t);
        undoFn();
        hide();
      });
    toast.t = setTimeout(hide, undoFn ? 7000 : 3500);
  }

  // amts (optional): { albert: 40, milly: 35 } to log something other than the usual. A cat set to 0 is left out.
  function logUsual(who, kd, amts) {
    var now2 = new Date(),
      tm2 = String(now2.getHours()).padStart(2, "0") + ":" + String(now2.getMinutes()).padStart(2, "0"),
      t = today(),
      snap = {},
      names = [];
    (who === "both" ? ["albert", "milly"] : [who]).forEach(function (k) {
      var u = usualMeal(k, kd);
      if (!u) return;
      var am7 = amts && amts[k] != null ? amts[k] : u.a;
      if (!(am7 > 0)) return;
      var c7 = S.cats[k];
      var d0 = peek(c7, t);
      if (
        d0 &&
        c7.foods.some(function (f) {
          return (
            (kd === "dry" ? f.kind === "dry" : f.kind !== "dry") &&
            ((d0.f || {})[f.id] || (d0.waste || {})[f.id])
          );
        })
      )
        return;
      snap[k] = d0 ? JSON.stringify(d0) : null;
      var d7 = day(c7, t);
      if (!d7.meals) d7.meals = [];
      d7.meals.push({
        id: uid(),
        f: u.f.id,
        a: am7,
        rx: "all",
        t: tm2,
        who: (GH && GH.who) || "",
        add: u.add.slice()
      });
      u.add.forEach(function (q) {
        d7.checks[q] = true;
      });
      d7.f[u.f.id] = fmt((d7.f[u.f.id] || 0) + am7);
      if (!d7.react) d7.react = {};
      d7.react[u.f.id] = "all";
      names.push(c7.name);
    });
    if (!names.length) {
      var mb = mealBy(who === "both" ? "albert" : who, kd) || {};
      toast(
        (kd === "dry" ? "Breakfast" : "Dinner") +
          " was already logged" +
          (mb.who && mb.who !== whoAmI() ? " by " + mb.who : "") +
          (mb.t ? " at " + mb.t : "") +
          ". No double feed."
      );
      return false;
    }
    change();
    celebrate();
    toast((kd === "dry" ? "Breakfast" : "Dinner") + " logged · " + names.join(" & "), function () {
      Object.keys(snap).forEach(function (k) {
        if (snap[k] == null) delete S.cats[k].days[t];
        else S.cats[k].days[t] = JSON.parse(snap[k]);
      });
      change();
    });
    return true;
  }

  // Has this cat already had this meal today (eaten or refused)?
  function mealLogged(k, kind) {
    var c = S.cats[k],
      x = peek(c, today());
    return (
      !!x &&
      c.foods.some(function (f) {
        return (
          (kind === "dry" ? f.kind === "dry" : f.kind !== "dry") && ((x.f || {})[f.id] || (x.waste || {})[f.id])
        );
      })
    );
  }

  // The cats "Log both" would log now: a usual meal set, not away, not logged yet.
  function mealOpenFor(kind) {
    return ["albert", "milly"].filter(function (k) {
      return usualMeal(k, kind) && !awayAt(k, today(), kind) && !mealLogged(k, kind);
    });
  }

  // "Log both" with other amounts: one row per cat, filled in with the usual, one button to log them together.
  function bothSheet() {
    var B = ui.both,
      dry = B.kd === "dry";
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">' +
      (dry ? "Breakfast" : "Dinner") +
      (B.ks.length > 1 ? " for both" : "") +
      '</h2><div class="small mute">Change what wasn\'t the usual today, then log it in one go.</div>' +
      B.ks
        .map(function (k) {
          var u = usualMeal(k, B.kd);
          return (
            '<label class="l u-mt12" for="ba-' +
            k +
            '">' +
            esc(S.cats[k].name) +
            " · " +
            esc(u.f.name) +
            '</label><div class="row u-gap6 u-ai-center u-nowrap"><button class="chip bstep" data-a="bstep" data-v="' +
            k +
            '|-1" aria-label="Less">−</button><input class="amt bamt" id="ba-' +
            k +
            '" inputmode="decimal" value="' +
            esc(String(B.a[k])) +
            '"><span class="small mute">' +
            (dry ? "g" : "×") +
            '</span><button class="chip bstep" data-a="bstep" data-v="' +
            k +
            '|1" aria-label="More">+</button><span class="small mute bus">' +
            "usual " +
            u.a +
            (dry ? " g" : "×") +
            "</span></div>"
          );
        })
        .join("") +
      (B.ks.length > 1 ? '<div class="note">Set a cat to 0 to leave them out.</div>' : "") +
      '<div class="row u-mt14"><button class="b p" data-a="blog">Log ' +
      (B.ks.length > 1 ? "both" : esc(S.cats[B.ks[0]].name)) +
      '</button><button class="b" data-a="close">Cancel</button></div></div></div>'
    );
  }

  function weekStrip() {
    var t = today(),
      days = [];
    for (var i = 6; i >= 0; i--) days.push(addDays(t, -i));
    function has(c, d, kind) {
      var x = peek(c, d);
      if (!x) return false;
      if (kind === "play") {
        for (var k in x.play) if (x.play[k] > 0) return true;
        return false;
      }
      return c.foods.some(function (f) {
        return (
          (kind === "dry" ? f.kind === "dry" : f.kind !== "dry") &&
          ((x.f || {})[f.id] || (x.waste || {})[f.id])
        );
      });
    }
    var h =
      '<div class="card wstrip"><div class="row between u-mb8"><h2 class="u-m0">This week</h2><span class="small mute"><i class="wd on"></i>breakfast <i class="wd on w"></i>dinner <i class="wd on p"></i>play</span></div>' +
      '<div class="wsg"><span></span>' +
      days
        .map(function (d) {
          return (
            '<span class="wsh' +
            (d === t ? " now" : "") +
            '">' +
            parse(d).toLocaleDateString(LOC(), { weekday: "narrow" }) +
            "</span>"
          );
        })
        .join("");
    ["albert", "milly"].forEach(function (k) {
      var c = S.cats[k];
      h +=
        '<span class="wsn">' +
        spot(k).replace('class="spot"', 'class="spot" style="width:22px;height:22px"') +
        "</span>" +
        days
          .map(function (d) {
            var past = d < t;
            return (
              '<button class="wsc' +
              (d === ui.day && k === ui.cat ? " sel" : "") +
              '" data-a="openday" data-k="' +
              k +
              '" data-v="' +
              d +
              '">' +
              ["dry", "wet", "play"]
                .map(function (q) {
                  var on = has(c, d, q),
                    miss =
                      !on &&
                      !(q !== "play" && awayAt(k, d, q)) &&
                      (past ||
                        (d === t &&
                          ((q === "dry" && new Date().getHours() >= 10) ||
                            (q === "wet" && new Date().getHours() >= 21))));
                  return (
                    '<i class="wd' +
                    (on ? " on" : "") +
                    (q === "play" ? " p" : q === "wet" ? " w" : "") +
                    (miss && q !== "play" ? " miss" : "") +
                    '"></i>'
                  );
                })
                .join("") +
              "</button>"
            );
          })
          .join("");
    });
    return h + "</div></div>";
  }

  function headline() {
    var t = today(),
      hr = new Date().getHours(),
      ks = ["albert", "milly"];
    function done(k, kind) {
      var c = S.cats[k],
        x = peek(c, t);
      return (
        !!x &&
        c.foods.some(function (f) {
          return (
            (kind === "dry" ? f.kind === "dry" : f.kind !== "dry") &&
            ((x.f || {})[f.id] || (x.waste || {})[f.id])
          );
        })
      );
    }
    function row(lab, kind, later) {
      var d = ks.filter(function (k) {
          return done(k, kind);
        }),
        m = ks.filter(function (k) {
          return !done(k, kind) && usualMeal(k, kind) && !awayAt(k, t, kind);
        });
      var right,
        aw = ks.filter(function (k) {
          return awayAt(k, t, kind) && !done(k, kind);
        });
      if (!m.length && aw.length && !d.length)
        right = '<span class="hlmute">🏨 ' + esc((awayAt(aw[0], t, kind).place || "Cat hotel").split(" ")[0]) + "</span>";
      else if (!m.length) {
        // Who fed them: "✓ Both · Martina", or "· Martina & Eóin" when they each did one.
        var by = [];
        d.forEach(function (k) {
          var w = (mealBy(k, kind) || {}).who;
          if (w && by.indexOf(w) < 0) by.push(w);
        });
        right =
          '<span class="hlok">✓ ' +
          (d.length > 1 ? "Both" : esc(S.cats[d[0]].name)) +
          "</span>" +
          (by.length ? '<span class="hlby">· ' + esc(by.join(" & ")) + "</span>" : "");
      }
      else if (later) right = '<span class="hlmute">' + later + "</span>";
      else
        right =
          (d.length ? '<span class="hlok">✓ ' + esc(S.cats[d[0]].name) + "</span> " : "") +
          '<button class="hlalt" data-a="bopen" data-v="' +
          kind +
          '" aria-label="Change amounts">Change</button>' +
          '<button class="hlbtn" data-a="usual" data-v="' +
          (m.length > 1 ? "both" : m[0]) +
          "|" +
          kind +
          '">Log ' +
          (m.length > 1 ? "both" : esc(S.cats[m[0]].name)) +
          "</button>";
      return '<div class="hlrow"><span>' + lab + '</span><span class="hlr">' + right + "</span></div>";
    }
    var plan = String(S.cats.albert.plan || ""),
      dt = (plan.match(/Evening[^\n]*?(\d{1,2}[:.]\d{2})/) || [])[1] || "19:30";
    var bDone = ks.every(function (k) {
        return done(k, "dry") || !usualMeal(k, "dry") || awayAt(k, t, "dry");
      }),
      dDone = ks.every(function (k) {
        return done(k, "wet") || !usualMeal(k, "wet") || awayAt(k, t, "wet");
      });
    var title =
      bDone && dDone && ((hr < 21 && hr >= 4) || (S.bed || {})[nightOf()])
        ? "All done for today"
        : bDone && dDone
          ? "Bedtime routine next"
          : bDone
            ? hr >= 17
              ? "Dinner time"
              : "Morning sorted"
            : hr < 12
              ? "Good morning"
              : "Breakfast still to log";
    var stay = ks.every(function (k) {
      return awayAt(k, t);
    })
      ? awayAt("albert", t)
      : null;
    if (stay)
      title =
        "At " +
        esc((stay.place || "the cat hotel").replace(/'s Kattenhotel$/, "'s")) +
        ", home " +
        parse(stay.to || stay.from).toLocaleDateString(LOC(), { weekday: "short", day: "numeric", month: "short" });
    var bd = ks.filter(function (k) {
      return isBday(S.cats[k], t);
    });
    if (bd.length)
      title =
        "Happy birthday, " +
        bd
          .map(function (k) {
            return esc(S.cats[k].name);
          })
          .join(" &amp; ") +
        " 🎂";
    var dow = parse(t).getDay(),
      wr;
    var weighed = ks.every(function (k) {
      return S.cats[k].weights.some(function (w) {
        return w.d === t;
      });
    });
    wr = stay
      ? '<span class="hlmute">After the stay</span>'
      : dow === 6
        ? weighed
          ? '<span class="hlok">✓ Done</span>'
          : '<button class="hlbtn" data-a="tab" data-v="weight">Weigh now</button>'
        : '<span class="hlmute">' + (dow === 5 ? "Tomorrow" : "Saturday") + "</span>";
    var act = null;
    var od = S.todos.filter(function (x) {
      return !x.done && x.due && x.due <= t;
    })[0];
    if (od) act = ["Overdue: " + od.text, "calendar"];
    if (!act) {
      var ob = [];
      ks.forEach(function (k) {
        S.cats[k].foods
          .filter(function (f) {
            return f.main;
          })
          .forEach(function (f) {
            var o = orderBy(k, f);
            if (o && o.days < 7) ob.push([o, f, k]);
          });
      });
      ob.sort(function (a, b) {
        return a[0].days - b[0].days;
      });
      if (ob[0])
        act = [
          "Order " +
            esc(S.cats[ob[0][2]].name) +
            "'s " +
            esc(ob[0][1].name.split(" (")[0].replace(/ \d.*$/, "")) +
            (ob[0][0].days <= 0 ? " today" : " by " + short(ob[0][0].by)),
          "stock"
        ];
    }
    if (!act)
      ((S.info && S.info.bookings) || []).forEach(function (b) {
        if (!act && b.from && b.from >= t && daysBetween(t, b.from) <= 7) {
          var dd = daysBetween(t, b.from);
          act = [
            (b.place || "Cat hotel").split(" ")[0] +
              " drop-off " +
              (dd === 0 ? "today" : dd === 1 ? "tomorrow" : "in " + dd + " days") +
              ": care sheet & packing",
            "info"
          ];
        }
      });
    if (!act)
      ks.forEach(function (k) {
        ["Worming", "Flea"].forEach(function (ty) {
          var du = treatDue(S.cats[k], ty);
          if (!act && du && du.days <= 3)
            act = [
              ty +
                " due for " +
                S.cats[k].name +
                (du.days < 0 ? " (overdue)" : du.days === 0 ? " today" : " " + short(du.next)),
              "health"
            ];
        });
      });
    var zz = title === "All done for today";
    return (
      '<div class="hl' +
      (zz ? " hldone" : "") +
      '">' +
      (zz ? sleepyCat() : "") +
      '<div class="hld">' +
      parse(t)
        .toLocaleDateString(LOC(), { weekday: "long", day: "numeric", month: "short" })
        .toUpperCase() +
      '</div><div class="hlt">' +
      title +
      "</div>" +
      row("Breakfast", "dry") +
      row("Dinner", "wet", dDone || hr >= 16 ? null : dt) +
      (hr >= 21 || hr < 4
        ? '<div class="hlrow"><span>Bedtime play + snack</span><span class="hlr">' +
          ((S.bed || {})[nightOf()]
            ? '<span class="hlok">✓ ' + esc(S.bed[nightOf()]) + "</span>"
            : '<button class="hlbtn" data-a="bedok">Done</button>') +
          "</span></div>"
        : "") +
      (tabOn("weight") ? '<div class="hlrow"><span>Weigh-in</span><span class="hlr">' + wr + "</span></div>" : "") +
      (act && tabOn(act[1])
        ? '<button class="hlact" data-a="tab" data-v="' +
          act[1] +
          '"><span>' +
          esc(act[0]) +
          "</span><span>›</span></button>"
        : "") +
      "</div>"
    );
  }

  function whoAmI() {
    return (GH && GH.who) || "";
  }

  function celebrate() {
    try {
      var rm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (navigator.vibrate) navigator.vibrate(12);
      if (rm) return;
      var el = document.createElement("div");
      el.className = "tickpop";
      el.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      document.body.appendChild(el);
      setTimeout(function () {
        el.remove();
      }, 800);
      var p = document.getElementById("pg");
      if (p && p.animate)
        p.animate([{ transform: "scale(1)" }, { transform: "scale(.985)" }, { transform: "scale(1)" }], {
          duration: 260,
          easing: "ease-out"
        });
    } catch (e) {}
  }

  function mealBy(k, kind) {
    var c = S.cats[k],
      x = peek(c, today());
    if (!x) return null;
    var m = (x.meals || []).filter(function (m) {
      var f = c.foods.filter(function (y) {
        return y.id === m.f;
      })[0];
      return f && (kind === "dry" ? f.kind === "dry" : f.kind !== "dry");
    })[0];
    return m || {};
  }

  function quickSheet() {
    var hr = new Date().getHours(),
      t = today(),
      ks = ["albert", "milly"];
    function open(kind) {
      return ks.some(function (k) {
        var c = S.cats[k],
          x = peek(c, t);
        return (
          usualMeal(k, kind) &&
          !awayAt(k, t, kind) &&
          !(
            x &&
            c.foods.some(function (f) {
              return (
                (kind === "dry" ? f.kind === "dry" : f.kind !== "dry") &&
                ((x.f || {})[f.id] || (x.waste || {})[f.id])
              );
            })
          )
        );
      });
    }
    var bo = open("dry"),
      dn = open("wet"),
      sug =
        hr >= 4 && hr < 12 && bo
          ? "dry"
          : hr >= 16 && dn
            ? "wet"
            : bo && hr < 16
              ? "dry"
              : dn && hr >= 15
                ? "wet"
                : null;
    function amt(kind) {
      return ks
        .map(function (k) {
          var u = usualMeal(k, kind);
          return u ? (kind === "dry" ? u.a + " g" : u.a + "×") : "";
        })
        .filter(Boolean)
        .join(" + ");
    }
    var why = sug
      ? "It's " +
        new Date().toTimeString().slice(0, 5) +
        ", so " +
        (sug === "dry" ? "breakfast" : "dinner") +
        " is first."
      : bo || dn
        ? "Tap what you want to log."
        : "Meals are done for today.";
    function tile(a, v, lab, sub, cls, extra) {
      return (
        '<button class="qt' +
        (cls ? " " + cls : "") +
        '" data-a="' +
        a +
        '" data-v="' +
        v +
        '"' +
        (extra || "") +
        ">" +
        lab +
        "<small>" +
        sub +
        "</small></button>"
      );
    }
    var mt = ["dry", "wet"]
      .filter(function (q) {
        return q !== sug;
      })
      .map(function (q) {
        var op = q === "dry" ? bo : dn;
        return tile(
          "qmeal",
          q,
          q === "dry" ? "Breakfast" : "Dinner",
          op
            ? "for both"
            : (function () {
                var mb = mealBy("albert", q) || mealBy("milly", q) || {};
                return "✓ done" + (mb.who ? " by " + esc(mb.who) : "") + (mb.t ? " at " + mb.t : "");
              })(),
          "",
          op ? "" : " disabled"
        );
      })
      .join("");
    return (
      '<div class="modal" data-a="close"><div class="sheet qsheet" data-stop="1"><div class="row between u-nowrap"><h2 class="u-m0">Quick log</h2><button class="x" data-a="close" aria-label="Close">✕</button></div><div class="small mute u-m2-0-12">' +
      why +
      "</div>" +
      (sug
        ? '<button class="qbig" data-a="qmeal" data-v="' +
          sug +
          '"><span>' +
          (sug === "dry" ? "Breakfast" : "Dinner") +
          " for both</span><small>" +
          amt(sug) +
          "</small></button>" +
          '<button class="qalt" data-a="bopen" data-v="' +
          sug +
          '">Not the usual amount? Change it</button>'
        : "") +
      '<div class="qgrid">' +
      mt +
      (tabOn("health")
        ? tile("lnew", "Poo", "Poo", "usual for " + esc(cat().name)) + tile("lnew", "Pee", "Pee", "one tap")
        : "") +
      tile("plopen", "", "Play", "minutes or timer") +
      (DEMO || (GH && GH.local) ? "" : tile("noteNew", "", "Note", "or reminder")) +
      (tabOn("fights")
        ? tile("fnew", "", "Fight", "what happened", "qwarn") +
          tile("calmnew", "", "Calm moment", "something nice", "qok")
        : "") +
      "</div>" +
      '<div class="seg u-cols1fr-1fr u-m12-0-0">' +
      ks
        .map(function (k) {
          return (
            '<button class="' +
            (ui.cat === k ? "on" : "") +
            '" data-a="qcat2" data-v="' +
            k +
            '">' +
            esc(S.cats[k].name) +
            "</button>"
          );
        })
        .join("") +
      '</div><div class="small mute u-mt6 u-ta-center">Poo, pee and play are logged for ' +
      esc(cat().name) +
      "</div></div></div>"
    );
  }

  function searchSheet() {
    return (
      '<div class="modal" data-a="close"><div class="sheet ssheet" data-stop="1"><div class="row between u-nowrap u-mb10"><h2 class="u-m0">Search</h2><button class="x" data-a="close" aria-label="Close">✕</button></div><input id="qsrch" type="search" placeholder="cough, z/d, vet, Milly…" value="' +
      esc(ui.sq || "") +
      '" autocomplete="off"><div id="qres">' +
      searchResults(ui.sq || "") +
      "</div></div></div>"
    );
  }

  function searchResults(q) {
    q = (q || "").trim();
    if (q.length < 2)
      return '<div class="note">Searches symptoms, day notes, poo and pee, fights, calm moments, vet notes, profiles, to-dos and costs.</div>';
    var ql = q.toLowerCase(),
      R = [];
    function hit(x) {
      return x && String(x).toLowerCase().indexOf(ql) >= 0;
    }
    function hl(x) {
      x = String(x || "");
      var i = x.toLowerCase().indexOf(ql);
      if (i < 0) return esc(x.slice(0, 140));
      var st = Math.max(0, i - 50);
      return (
        (st ? "…" : "") +
        esc(x.slice(st, i)) +
        "<mark>" +
        esc(x.slice(i, i + q.length)) +
        "</mark>" +
        esc(x.slice(i + q.length, i + q.length + 90)) +
        (i + q.length + 90 < x.length ? "…" : "")
      );
    }
    ["albert", "milly"].forEach(function (k) {
      var c = S.cats[k];
      c.health.forEach(function (x) {
        var tx = [x.t, x.n].filter(Boolean).join(" · ");
        if (hit(tx)) R.push({ d: x.d, lab: "Symptom · " + c.name, tx: tx, a: "openday", k: k, v: x.d });
      });
      Object.keys(c.days).forEach(function (d) {
        var x = c.days[d];
        if (hit(x.note)) R.push({ d: d, lab: "Day note · " + c.name, tx: x.note, a: "openday", k: k, v: d });
        (x.meals || []).forEach(function (m) {
          var f = c.foods.filter(function (y) {
            return y.id === m.f;
          })[0];
          if (f && hit(f.name))
            R.push({
              d: d,
              lab: "Meal · " + c.name,
              tx: fmt(m.a) + (f.kind === "dry" ? " g " : " × ") + f.name + (m.t ? " at " + m.t : ""),
              a: "openday",
              k: k,
              v: d
            });
        });
      });
      (c.vq || []).forEach(function (x) {
        if (hit(x.t)) R.push({ d: x.d || '', lab: 'Vet question · ' + c.name + (x.done ? ' (asked)' : ''), tx: x.t, a: 'tab', v: 'health' });
      });
      c.vet.forEach(function (v) {
        var tx = [v.reason, v.notes].filter(Boolean).join(" · ");
        if (hit(tx) || hit(v.clinic))
          R.push({ d: v.d || "", lab: "Vet · " + c.name, tx: tx, a: "tab", v: "health" });
      });
      c.foods.forEach(function (f) {
        if (hit(f.name)) R.push({ d: "", lab: "Food · " + c.name, tx: f.name, a: "tab", v: "stock" });
      });
      if (hit(S.profiles && S.profiles[k]))
        R.push({
          d: "",
          lab: "Profile · " + c.name,
          tx: S.profiles[k].split("\n").filter(hit).join(" · "),
          a: "tab",
          v: "info"
        });
    });
    (S.litter || []).forEach(function (x) {
      var tx = [x.type, x.who, x.cons, x.smell, (x.extra || []).join(", "), x.n].filter(Boolean).join(" · ");
      if (hit(tx))
        R.push({
          d: x.d,
          lab: x.type + " · " + x.who,
          tx: tx,
          a: "openday",
          k: keyOfName(x.who) || "albert",
          v: x.d
        });
    });
    (S.fights || []).forEach(function (x) {
      var tx = [x.sev, (x.trig || []).join(", "), x.where, x.n].filter(Boolean).join(" · ");
      if (hit(tx) || hit("fight")) R.push({ d: x.d, lab: "Fight", tx: tx || "Fight", a: "tab", v: "fights" });
    });
    (S.calm || []).forEach(function (x) {
      var tx = [x.what, x.n].filter(Boolean).join(" · ");
      if (hit(tx) || hit("calm")) R.push({ d: x.d, lab: "Calm moment", tx: tx, a: "tab", v: "fights" });
    });
    (S.todos || []).forEach(function (x) {
      if (hit(x.text))
        R.push({
          d: x.due || "",
          lab: "To-do" + (x.done ? " (done)" : ""),
          tx: x.text,
          a: "tab",
          v: "calendar"
        });
    });
    (S.costs || []).forEach(function (x) {
      var tx = [x.desc, x.cat, x.n].filter(Boolean).join(" · ");
      if (hit(tx)) R.push({ d: x.d, lab: "Cost · " + eur(x.amount), tx: tx, a: "tab", v: "money" });
    });
    if (!R.length)
      return '<div class="pl mute u-p18-4">Nothing found for "' + esc(q) + '"</div>';
    R.sort(function (a, b) {
      return (a.d || "0") < (b.d || "0") ? 1 : -1;
    });
    return (
      '<div class="small mute u-m10-2-4">' +
      R.length +
      " result" +
      (R.length > 1 ? "s" : "") +
      "</div>" +
      R.slice(0, 80)
        .map(function (r) {
          return (
            '<button class="sres" data-a="' +
            r.a +
            '" data-v="' +
            esc(r.v) +
            '"' +
            (r.k ? ' data-k="' + r.k + '"' : "") +
            '><span class="small mute u-fw800">' +
            esc(r.lab.toUpperCase()) +
            (r.d ? " · " + short(r.d) + " " + r.d.slice(0, 4) : "") +
            "</span><span>" +
            hl(r.tx) +
            "</span></button>"
          );
        })
        .join("")
    );
  }

  function whoCard() {
    var t = today(),
      it = [];
    ["albert", "milly"].forEach(function (k) {
      var c = S.cats[k],
        x = peek(c, t);
      if (!x) return;
      (x.meals || []).forEach(function (m) {
        var f = c.foods.filter(function (y) {
          return y.id === m.f;
        })[0];
        it.push({
          t: m.t || "",
          by: m.who || "",
          tx:
            c.name +
            " · " +
            (f
              ? (f.kind === "dry" ? "breakfast" : "dinner") +
                ", " +
                fmt(m.a) +
                (f.kind === "dry" ? " g" : " ×")
              : "meal")
        });
      });
    });
    (S.litter || []).forEach(function (x) {
      if (x.d === t)
        it.push({
          t: x.m || "",
          by: x.by || (/from chat/i.test(x.n || "") ? "Claude" : ""),
          tx: x.who + " · " + x.type.toLowerCase() + (x.cons ? ", " + x.cons.toLowerCase() : "")
        });
    });
    (S.fights || []).forEach(function (x) {
      if (x.d === t) it.push({ t: x.m || "", by: x.by || "", tx: "Fight" + (x.sev ? " · " + x.sev : "") });
    });
    (S.calm || []).forEach(function (x) {
      if (x.d === t) it.push({ t: x.m || "", by: x.by || "", tx: "Calm · " + (x.what || "") });
    });
    if (!it.length) return "";
    it.sort(function (a, b) {
      return a.t < b.t ? -1 : 1;
    });
    var cols = {};
    var pal = ["#e2702c", "#3f6fb5", "#2f8a5b", "#8a4fb5"];
    return (
      '<details class="nf" data-open="whocard"' +
      isOpen("whocard", false) +
      '><summary><span>👥 Today · who did what <span class="nfc">' +
      it.length +
      '</span></span></summary><div class="card u-m0">' +
      it
        .map(function (x) {
          var nm = x.by || "",
            col = nm ? (cols[nm] = cols[nm] || pal[Object.keys(cols).length % 4]) : "#b9b1aa";
          return (
            '<div class="whor"><span class="whoav" style="background:' +
            col +
            '">' +
            esc((nm || "?").charAt(0).toUpperCase()) +
            '</span><div class="u-flex1 u-minw0"><b>' +
            esc(x.tx) +
            '</b><div class="small mute">' +
            esc(nm || "Not recorded") +
            (x.t ? " · " + x.t : "") +
            "</div></div></div>"
          );
        })
        .join("") +
      "</div></details>"
    );
  }

  function openCount() {
    if (!S) return 0;
    var t = today(),
      hr = new Date().getHours(),
      n = 0,
      ks = ["albert", "milly"];
    function miss(kind) {
      return ks.some(function (k) {
        var c = S.cats[k],
          x = peek(c, t);
        return (
          usualMeal(k, kind) &&
          !awayAt(k, t, kind) &&
          !(
            x &&
            c.foods.some(function (f) {
              return (
                (kind === "dry" ? f.kind === "dry" : f.kind !== "dry") &&
                ((x.f || {})[f.id] || (x.waste || {})[f.id])
              );
            })
          )
        );
      });
    }
    if (hr >= 7 && miss("dry")) n++;
    if (hr >= 20 && miss("wet")) n++;
    if (
      parse(t).getDay() === 6 &&
      tabOn("weight") &&
      !ks.every(function (k) {
        return awayAt(k, t);
      }) &&
      !ks.every(function (k) {
        return S.cats[k].weights.some(function (w) {
          return w.d === t;
        });
      })
    )
      n++;
    return n;
  }

  // The badge can be switched off per phone (Settings › This phone).
  function badgeOff() {
    try {
      return localStorage.getItem(LS + "-badge") === "off";
    } catch (e) {
      return false;
    }
  }

  function badgeIsOn() {
    return !!(window.Notification && Notification.permission === "granted") && !badgeOff();
  }

  function badge() {
    try {
      if (!("setAppBadge" in navigator)) return;
      var n = badgeOff() ? 0 : openCount();
      if (n) navigator.setAppBadge(n).catch(function () {});
      else navigator.clearAppBadge().catch(function () {});
    } catch (e) {}
  }

  function sleepyCat() {
    return '<svg class="sleepy" viewBox="0 0 120 80" aria-hidden="true"><path d="M18 62c0-18 18-30 42-30s40 10 40 26c0 8-6 12-14 12H30c-8 0-12-3-12-8z" fill="#fff"/><path d="M96 60c10 2 16-6 12-14" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M30 38c-4-9-2-18 2-22l7 10c4-1 9-1 13 0l7-10c4 4 6 13 2 22-3 7-10 11-16 11s-12-4-15-11z" fill="#fff"/><path d="M32 18l5 8M59 18l-5 8" stroke="#e2702c" stroke-width="4" stroke-linecap="round"/><path d="M37 38q3 3 6 0M49 38q3 3 6 0" fill="none" stroke="#2b2622" stroke-width="2" stroke-linecap="round"/><path d="M45 43l2 1.6 2-1.6" fill="none" stroke="#e88a9a" stroke-width="1.8" stroke-linecap="round"/><text x="70" y="22" font-size="13" font-weight="900" fill="#d8cfc6">z</text><text x="82" y="12" font-size="10" font-weight="900" fill="#d8cfc6">z</text></svg>';
  }

  function confetti() {
    try {
      if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var cols = ["#e2702c", "#f3b257", "#3e9a63", "#3f6fb5", "#e88a9a", "#2b2622"],
        box = document.createElement("div");
      box.className = "confbox";
      for (var i = 0; i < 46; i++) {
        var p = document.createElement("i");
        p.style.left = Math.random() * 100 + "%";
        p.style.background = cols[i % cols.length];
        p.style.animationDelay = Math.random() * 0.25 + "s";
        p.style.animationDuration = 1.1 + Math.random() * 0.8 + "s";
        p.style.setProperty("--dx", Math.random() * 160 - 80 + "px");
        p.style.setProperty("--r", Math.random() * 720 - 360 + "deg");
        box.appendChild(p);
      }
      document.body.appendChild(box);
      setTimeout(function () {
        box.remove();
      }, 2300);
    } catch (e) {}
  }

  function emptyState(art, title, sub, btn) {
    return (
      '<div class="empty">' +
      art +
      '<div class="emt">' +
      title +
      "</div>" +
      (sub ? '<div class="ems">' + sub + "</div>" : "") +
      (btn || "") +
      "</div>"
    );
  }

  function bowlArt() {
    return '<svg class="emart" viewBox="0 0 64 44" aria-hidden="true"><path d="M6 18h52l-4 16a6 6 0 0 1-6 5H16a6 6 0 0 1-6-5z" fill="var(--accent)"/><rect x="4" y="15" width="56" height="5" rx="2.5" fill="color-mix(in srgb,var(--accent) 75%,#000)"/><path d="M26 9q6-8 12 0" fill="none" stroke="var(--mute)" stroke-width="2.5" stroke-linecap="round" opacity=".6"/></svg>';
  }

  function nowHM() {
    var n = new Date();
    return String(n.getHours()).padStart(2, "0") + ":" + String(n.getMinutes()).padStart(2, "0");
  }
