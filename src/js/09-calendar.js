/* 09-calendar: The Calendar tab, day panel and to-do list. */
  var SEVC = {
      "Stare / stalk": "#b8a6ff",
      "Chase / hiss": "#8b6cff",
      Bite: "#e0703a",
      "Full fight": "#d23b3b"
    },
    SEVN = { "Stare / stalk": 1, "Chase / hiss": 2, Bite: 3, "Full fight": 4 };

  document.addEventListener(
    "toggle",
    function (e) {
      var k = e.target && e.target.dataset && e.target.dataset.open;
      if (k) {
        ui.open = ui.open || {};
        ui.open[k] = e.target.open;
        if (e.target.open && e.target.hasAttribute("data-lazy")) render();
      }
    },
    true
  );

  function catDayIcons(c, ds) {
    var x = peek(c, ds),
      tt = dayTotals(c, x),
      ic = "";
    if (
      c.weights.some(function (w) {
        return w.d === ds;
      })
    )
      ic += "⚖️";
    if (
      c.health.some(function (e) {
        return e.d === ds;
      })
    )
      ic += "🩺";
    if (
      c.vet.some(function (e) {
        return e.d === ds;
      })
    )
      ic += "🏥";
    if (
      x &&
      x.checks &&
      Object.keys(x.checks).some(function (k) {
        return x.checks[k];
      })
    )
      ic += "💊";
    if (x && tt.play) ic += "🧶";
    if (x && x.photos && x.photos.length) ic += "📷";
    var lt = S.litter.filter(function (l) {
      return l.d === ds && l.who === c.name;
    });
    if (lt.length) ic += lt.some(bad) ? "💩⚠️" : "💩";
    if (isBday(c, ds)) ic += "🎂";
    if (
      S.info.bookings.some(function (b) {
        return b.cats.indexOf(c.name) >= 0 && b.from && ds >= b.from && ds <= (b.to || b.from);
      })
    )
      ic += "🏨";
    var fdc = "";
    if (x && (tt.dry || tt.wet)) {
      fdc =
        (c.dryAllowance && tt.dry > c.dryAllowance) ||
        tt.wet > c.wetAllowance ||
        (x.treats || 0) > c.treatAllowance
          ? "r"
          : "g";
    }
    return { ic: ic, fdc: fdc, any: !!(ic || fdc) };
  }

  function calInfo(c, ds) {
    var x = peek(c, ds),
      tt = dayTotals(c, x),
      r = { any: false, food: "", warn: false, weigh: false, vet: false, hotel: false, bits: [] };
    if (x && (tt.dry || tt.wet)) {
      r.food =
        (c.dryAllowance && tt.dry > c.dryAllowance) ||
        tt.wet > c.wetAllowance ||
        (x.treats || 0) > c.treatAllowance
          ? "over"
          : "ok";
    }
    r.weigh = c.weights.some(function (w) {
      return w.d === ds;
    });
    r.treat = (c.treat || []).some(function (x) {
      return x.d === ds;
    });
    r.vet = c.vet.some(function (e) {
      return e.d === ds;
    });
    var lt = S.litter.filter(function (l) {
      return l.d === ds && l.who === c.name;
    });
    r.warn =
      lt.some(bad) ||
      c.health.some(function (e) {
        return e.d === ds;
      });
    r.hotel = S.info.bookings.some(function (b) {
      return b.cats.indexOf(c.name) >= 0 && b.from && ds >= b.from && ds <= (b.to || b.from);
    });
    r.any =
      !!(
        x &&
        (tt.dry ||
          tt.wet ||
          tt.play ||
          x.note ||
          (x.photos && x.photos.length) ||
          Object.keys(x.checks || {}).some(function (k) {
            return x.checks[k];
          }))
      ) ||
      r.weigh ||
      r.vet ||
      r.warn ||
      lt.length > 0;
    return r;
  }

  function calBits(ds, cats) {
    var out = [],
      both = cats.length > 1;
    (S.todos || [])
      .filter(function (x) {
        return x.due === ds;
      })
      .forEach(function (x) {
        out.push(["✅", (x.done ? "Done: " : "To do: ") + x.text]);
      });
    S.fights
      .filter(function (f) {
        return f.d === ds;
      })
      .forEach(function (f) {
        out.push([
          "😾",
          (f.sev || "Fight") + (f.who ? ", started by " + f.who : "") + (f.m ? " (" + f.m + ")" : "")
        ]);
      });
    cats.forEach(function (k) {
      var c = S.cats[k],
        nm = both ? c.name + ": " : "",
        x = peek(c, ds),
        tt = dayTotals(c, x);
      if (isBday(c, ds)) out.push(["🎂", c.name + "'s birthday, " + (c.bornGuess ? "about " : "") + ageOn(c, ds)]);
      c.weights
        .filter(function (w) {
          return w.d === ds;
        })
        .forEach(function (w) {
          out.push(["⚖️", nm + "weighed " + w.kg.toFixed(2) + " kg"]);
        });
      c.vet
        .filter(function (e) {
          return e.d === ds;
        })
        .forEach(function (e) {
          out.push(["🏥", nm + "vet" + (e.reason ? ", " + e.reason : "")]);
        });
      c.health
        .filter(function (e) {
          return e.d === ds;
        })
        .forEach(function (e) {
          out.push(["🩺", nm + e.t]);
        });
      S.litter
        .filter(function (l) {
          return l.d === ds && l.who === c.name && bad(l);
        })
        .forEach(function (l) {
          out.push(["⚠️", nm + l.type.toLowerCase() + (l.cons ? ", " + l.cons.toLowerCase() : "")]);
        });
      (c.treat || [])
        .filter(function (e) {
          return e.d === ds;
        })
        .forEach(function (e) {
          out.push([TT[e.type].ic, nm + (e.product || e.type)]);
        });
      if (
        x &&
        (tt.dry || tt.wet) &&
        ((c.dryAllowance && tt.dry > c.dryAllowance) ||
          tt.wet > c.wetAllowance ||
          (x.treats || 0) > c.treatAllowance)
      )
        out.push(["🍽️", nm + "ate over plan"]);
      if (x && x.note) out.push(["📝", nm + x.note]);
    });
    S.info.bookings
      .filter(function (b) {
        return (
          b.from &&
          (ds === b.from || ds === (b.to || b.from)) &&
          cats.some(function (k) {
            return b.cats.indexOf(S.cats[k].name) >= 0;
          })
        );
      })
      .forEach(function (b) {
        out.push(["🏨", (ds === b.from ? "Drop-off at " : "Pick-up from ") + (b.place || S.info.hotel.name)]);
      });
    return out;
  }

  function vCal() {
    ui.calWho = "both";
    var m = ui.month,
      first = parse(m + "-01"),
      y = first.getFullYear(),
      mo = first.getMonth(),
      who = "both";
    var dim = new Date(y, mo + 1, 0).getDate(),
      off = (first.getDay() + 6) % 7,
      t = today(),
      cats = who === "both" ? ["albert", "milly"] : [who],
      sel = ui.calSel || t;
    var h = "";
    h +=
      '<div class="card calcard"><div class="calhead"><button class="rnd" data-a="mon" data-v="-1">‹</button><div><div class="mname">' +
      first.toLocaleDateString("en-GB", { month: "long" }) +
      '</div><div class="yname">' +
      y +
      '</div></div><button class="rnd" data-a="mon" data-v="1">›</button></div>';
    h +=
      '<div class="cal">' +
      ["M", "T", "W", "T", "F", "S", "S"]
        .map(function (x) {
          return '<div class="h">' + x + "</div>";
        })
        .join("");
    for (var i = 0; i < off; i++) h += "<div></div>";
    var month = [];
    for (var dd = 1; dd <= dim; dd++) {
      var ds = m + "-" + String(dd).padStart(2, "0"),
        hotel = cats.some(function (k) {
          return calInfo(S.cats[k], ds).hotel;
        }),
        bits = calBits(ds, cats);
      if (bits.length) month.push([ds, bits]);
      var em = [];
      bits.forEach(function (b) {
        if (em.indexOf(b[0]) < 0) em.push(b[0]);
      });
      h +=
        '<div class="d' +
        (ds === t ? " today" : "") +
        (ds === sel ? " sel" : "") +
        (ds > t ? " fut" : "") +
        (hotel ? " hotel" : "") +
        '" data-a="open" data-v="' +
        ds +
        '"><span class="n">' +
        dd +
        "</span>" +
        (em.length
          ? '<span class="ics2">' +
            em.slice(0, 2).join("") +
            (em.length > 2 ? "<small>+" + (em.length - 2) + "</small>" : "") +
            "</span>"
          : "") +
        "</div>";
    }
    h +=
      '</div><details class="legend2"><summary class="mute small">What the icons mean</summary><div class="small mute u-mt6 u-lh1_8">😾 fight · ⚖️ weigh-in · 🏥 vet · 🩺 symptom · ⚠️ poo/pee to check · 🐛🛡️ worm/flea · 🍽️ ate over plan · ✅ to do · 📝 note · 🎂 birthday · 🏨 hotel drop-off/pick-up · striped day = at the cat hotel</div></details></div>';
    h += dayPanel(sel);
    var tdn = (S.todos || []).filter(function (x) {
      return !x.done;
    }).length;
    h +=
      '<details class="nf tdnf" data-open="caltodo"' +
      isOpen("caltodo", false) +
      ' style="margin:0 0 12px"><summary><span>✅ To do &amp; coming up' +
      (tdn ? ' <span class="nfc">' + tdn + "</span>" : "") +
      "</span></summary>" +
      calList() +
      "</details>";
    h +=
      '<details class="nf" data-open="wsall"' +
      isOpen("wsall", false) +
      '><summary><span>📊 Last 7 days summary</span></summary><div class="card u-m0">' +
      weekSummary() +
      "</div></details>";
    h +=
      '<details class="nf" data-open="mrecap"' +
      isOpen("mrecap", false) +
      "><summary><span>📖 What happened in " +
      first.toLocaleDateString("en-GB", { month: "long" }) +
      (month.length ? ' <span class="nfc">' + month.length + "</span>" : "") +
      '</span></summary><div class="card u-m0">' +
      (month.length
        ? month
            .reverse()
            .map(function (r) {
              var dt = parse(r[0]);
              return (
                '<div class="mrow" data-a="open" data-v="' +
                r[0] +
                '"><div class="mdate"><b>' +
                dt.getDate() +
                "</b><span>" +
                dt.toLocaleDateString("en-GB", { weekday: "short" }) +
                '</span></div><div class="mitems">' +
                r[1]
                  .map(function (b) {
                    return "<div>" + b[0] + " " + esc(b[1]) + "</div>";
                  })
                  .join("") +
                "</div></div>"
              );
            })
            .join("")
        : emptyState("", "A quiet month", "No fights, vet visits or anything worrying logged.", "")) +
      "</div></details>";
    return h;
  }

  function todoRow(x) {
    var t0 = today(),
      late = x.due && !x.done && x.due < t0;
    return (
      '<div class="todo' +
      (x.done ? " done" : "") +
      '"><button class="tick" data-a="tdone" data-v="' +
      x.id +
      '">' +
      (x.done ? "✓" : "") +
      '</button><div class="tt2"><div class="tx">' +
      esc(x.text) +
      "</div>" +
      (x.due
        ? '<div class="due' +
          (late ? " late" : "") +
          '">' +
          (late ? "Overdue · " : x.due === t0 ? "Today · " : "Due ") +
          short(x.due) +
          "</div>"
        : "") +
      "</div></div>"
    );
  }

  function calList() {
    var t = today(),
      it = [],
      all = S.todos || [],
      open = all.filter(function (x) {
        return !x.done;
      }),
      done = all.filter(function (x) {
        return x.done;
      });
    open.forEach(function (x) {
      it.push({ d: x.due || "", ic: "✅", tx: x.text, id: x.id });
    });
    ["albert", "milly"].forEach(function (k) {
      var c = S.cats[k],
        nb = nextBday(c);
      if (nb && !c.bornGuess && daysBetween(t, nb) <= 60)
        it.push({ d: nb, ic: "🎂", tx: c.name + " turns " + (c.bornGuess ? "about " : "") + ageOn(c, nb) });
    });
    (S.info.bookings || []).forEach(function (b) {
      var nm = b.place || S.info.hotel.name || "cat hotel";
      if (b.from && b.from >= t) it.push({ d: b.from, ic: "🏨", tx: "Drop-off at " + nm });
      if (b.to && b.to >= t) it.push({ d: b.to, ic: "🏠", tx: "Pick-up from " + nm });
    });
    ["albert", "milly"].forEach(function (k) {
      var c = S.cats[k],
        last = {};
      (c.treat || []).forEach(function (e) {
        if (!last[e.type] || e.d > last[e.type].d) last[e.type] = e;
      });
      Object.keys(last).forEach(function (ty) {
        var e = last[ty];
        if (e.next)
          it.push({
            d: e.next,
            ic: TT[ty] ? TT[ty].ic : "💊",
            tx: c.name + ": " + ty.toLowerCase() + " due"
          });
      });
    });
    var dow = parse(t).getDay();
    it.push({ d: addDays(t, (6 - dow + 7) % 7), ic: "⚖️", tx: "Weigh-in for both" });
    var G = [
      [
        "late",
        "Overdue",
        function (d) {
          return d && d < t;
        }
      ],
      [
        "today",
        "Today",
        function (d) {
          return d === t;
        }
      ],
      [
        "tmrw",
        "Tomorrow",
        function (d) {
          return d === addDays(t, 1);
        }
      ],
      [
        "week",
        "Next 7 days",
        function (d) {
          return d > addDays(t, 1) && d <= addDays(t, 7);
        }
      ],
      [
        "later",
        "Later",
        function (d) {
          return d > addDays(t, 7);
        }
      ],
      [
        "any",
        "Any time",
        function (d) {
          return !d;
        }
      ]
    ];
    it.sort(function (a, b) {
      return (a.d || "9") < (b.d || "9") ? -1 : 1;
    });
    var h =
      '<details class="nf tdadd" data-open="tdadd"' +
      isOpen("tdadd", false) +
      ' style="margin:0 0 12px"><summary><span>➕ Add a to-do</span></summary><div class="addrow u-mt0"><input id="tdtext" placeholder="What needs doing?"><input id="tddue" type="date" title="Due date (optional)"><button class="b p" data-a="tadd">Add</button></div></details>';
    G.forEach(function (g) {
      var xs = it.filter(function (x) {
        return g[2](x.d);
      });
      if (!xs.length) return;
      h +=
        '<div class="card cgrp cg-' +
        g[0] +
        '"><div class="row between u-nowrap"><h2 class="u-m0">' +
        g[1] +
        '</h2><span class="mute small">' +
        xs.length +
        "</span></div>" +
        xs
          .map(function (x) {
            var dt = x.d ? parse(x.d) : null,
              sub =
                dt && (g[0] === "week" || g[0] === "later" || g[0] === "late")
                  ? dt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
                  : "";
            return (
              '<div class="agr">' +
              (x.id
                ? '<button class="tick" data-a="tdone" data-v="' + x.id + '"></button>'
                : '<span class="agi">' + x.ic + "</span>") +
              '<span class="agt">' +
              esc(x.tx) +
              (sub ? "<small>" + sub + "</small>" : "") +
              "</span>" +
              (x.id ? '<button class="x" data-a="tdel" data-v="' + x.id + '">✕</button>' : "") +
              "</div>"
            );
          })
          .join("") +
        "</div>";
    });
    if (done.length)
      h +=
        '<details class="nf" data-open="tddone"' +
        isOpen("tddone", false) +
        '><summary><span>✓ Done <span class="nfc">' +
        done.length +
        '</span></span></summary><div class="card u-m0">' +
        done.map(todoRow).join("") +
        "</div></details>";
    return h;
  }

  function dayPanel(ds) {
    var cats = ui.calWho && ui.calWho !== "both" ? [ui.calWho] : ["albert", "milly"];
    var nb = calBits(ds, ["albert", "milly"]).length;
    var h =
      '<details class="card daydd" data-open="daypan"' +
      isOpen("daypan", false) +
      '><summary class="dayttl"><div class="dnum">' +
      parse(ds).getDate() +
      '</div><div class="u-flex1"><div class="dw">' +
      parse(ds).toLocaleDateString("en-GB", { weekday: "long" }) +
      '</div><div class="mute small">' +
      parse(ds).toLocaleDateString("en-GB", { month: "long" }) +
      (nb ? " · " + nb + " thing" + (nb > 1 ? "s" : "") + " logged" : " · tap to see the day") +
      "</div></div></summary>";
    cats.forEach(function (k) {
      var c = S.cats[k],
        x = peek(c, ds),
        tt = dayTotals(c, x),
        rows = [];
      if (x && (tt.dry || tt.wet))
        rows.push([
          "🍽️",
          fmt(tt.dry) + " g dry · " + fmt(tt.wet) + " wet" + (x.treats ? " · " + x.treats + " treats" : ""),
          "about " + Math.round(tt.kcal) + " kcal"
        ]);
      if (x && tt.play)
        rows.push([
          "🧶",
          tt.play + " min play",
          Object.keys(x.play)
            .filter(function (p) {
              return x.play[p];
            })
            .map(function (p) {
              return p + " " + x.play[p];
            })
            .join(", ")
        ]);
      var ck = x
        ? Object.keys(x.checks || {}).filter(function (q) {
            return x.checks[q];
          })
        : [];
      if (ck.length) rows.push(["✅", ck.join(", "), ""]);
      c.weights
        .filter(function (w) {
          return w.d === ds;
        })
        .forEach(function (w) {
          rows.push(["⚖️", w.kg.toFixed(2) + " kg", "weigh-in"]);
        });
      S.litter
        .filter(function (l) {
          return l.d === ds && l.who === c.name;
        })
        .forEach(function (l) {
          rows.push([
            l.type === "Poo" ? "💩" : "💧",
            l.type + (l.cons ? " · " + l.cons : ""),
            [
              l.m,
              l.amt,
              l.smell && l.smell !== "Normal" ? l.smell.toLowerCase() + " smell" : "",
              (l.extra || []).join(", ")
            ]
              .filter(Boolean)
              .join(" · ")
          ]);
        });
      c.health
        .filter(function (e) {
          return e.d === ds;
        })
        .forEach(function (e) {
          rows.push(["🩺", e.t, [e.m, e.n].filter(Boolean).join(" · ")]);
        });
      c.vet
        .filter(function (e) {
          return e.d === ds;
        })
        .forEach(function (e) {
          rows.push(["🏥", e.reason || "Vet", e.clinic || ""]);
        });
      (c.treat || [])
        .filter(function (e) {
          return e.d === ds;
        })
        .forEach(function (e) {
          rows.push([
            TT[e.type].ic,
            (e.product || e.type) + (e.dose ? " · " + e.dose : ""),
            e.type + (e.next ? " · next " + short(e.next) : "")
          ]);
        });
      S.info.bookings
        .filter(function (b) {
          return b.cats.indexOf(c.name) >= 0 && b.from && ds >= b.from && ds <= (b.to || b.from);
        })
        .forEach(function (b) {
          rows.push([
            "🏨",
            b.place || S.info.hotel.name,
            ds === b.from ? "drop-off" : ds === b.to ? "pick-up" : "staying"
          ]);
        });
      if (x && x.note) rows.push(["📝", x.note, ""]);
      h +=
        '<div class="dcat"><div class="dch dch-' +
        k +
        '" style="--g:var(--g-' +
        k +
        ')">' +
        spot(k) +
        "<b>" +
        esc(c.name) +
        '</b><button class="b s" data-a="openday" data-k="' +
        k +
        '" data-v="' +
        ds +
        '">Open day ›</button></div>' +
        (rows.length
          ? rows
              .map(function (r) {
                return (
                  '<div class="ci"><span class="ic">' +
                  r[0] +
                  '</span><span><span class="val">' +
                  esc(r[1]) +
                  "</span>" +
                  (r[2] ? '<br><span class="small mute">' + esc(r[2]) + "</span>" : "") +
                  "</span></div>"
                );
              })
              .join("")
          : emptyState(
              bowlArt(),
              "A blank day",
              "Nothing was logged on this one.",
              '<button class="b s p" data-a="openday" data-k="' +
                ui.cat +
                '" data-v="' +
                ds +
                '">Open this day to add</button>'
            )) +
        (x && x.photos && x.photos.length ? thumbs(x.photos) : "") +
        "</div>";
    });
    var td = (S.todos || []).filter(function (x) {
      return x.due === ds;
    });
    if (0 && td.length)
      h +=
        '<div class="dcat"><div class="dch u---g-linear-gradient-135deg-52525b-18181b"><span class="u-fs22">✅</span><b>To do</b></div>' +
        td.map(todoRow).join("") +
        "</div>";
    var fs = S.fights.filter(function (f) {
      return f.d === ds;
    });
    if (fs.length)
      h +=
        '<div class="dcat"><div class="dch u---g-linear-gradient-135deg-e05a4f-a8322a"><span class="u-fs22">😾</span><b>' +
        fs.length +
        " fight" +
        (fs.length > 1 ? "s" : "") +
        "</b></div>" +
        fs
          .map(function (f) {
            return (
              '<div class="ci"><span class="ic">' +
              (f.sev === "Full fight" ? "💥" : f.sev === "Bite" ? "🦷" : "💨") +
              '</span><span><span class="val">' +
              esc((f.m ? f.m + " · " : "") + (f.sev || "Fight")) +
              '</span><br><span class="small mute">' +
              esc(
                [f.who ? "started by " + f.who : "", (f.trig || []).join(", "), f.where]
                  .filter(Boolean)
                  .join(" · ")
              ) +
              "</span></span></div>"
            );
          })
          .join("") +
        "</div>";
    return h + "</details>";
  }

  function vTodo() {
    var open = S.todos
        .filter(function (t) {
          return !t.done;
        })
        .sort(function (a, b) {
          return (a.due || "9") < (b.due || "9") ? -1 : 1;
        }),
      done = S.todos.filter(function (t) {
        return t.done;
      }),
      t0 = today();
    function row(t) {
      var late = t.due && !t.done && t.due < t0;
      return (
        '<div class="todo' +
        (t.done ? " done" : "") +
        '"><button class="tick" data-a="tdone" data-v="' +
        t.id +
        '">' +
        (t.done ? "✓" : "") +
        '</button><div class="tt2"><div class="tx">' +
        esc(t.text) +
        "</div>" +
        (t.due
          ? '<div class="due' +
            (late ? " late" : "") +
            '">' +
            (late ? "Overdue · " : "Due ") +
            short(t.due) +
            "</div>"
          : "") +
        '</div><button class="x" data-a="tdel" data-v="' +
        t.id +
        '">✕</button></div>'
      );
    }
    return (
      '<div class="card"><div class="row between"><h2 class="u-m0">✅ To do</h2><span class="tag">' +
      open.length +
      " left</span></div>" +
      (open.length
        ? open.map(row).join("")
        : '<div class="pl mute u-mt10">All done 🎉</div>') +
      '<div class="addrow"><input id="tdtext" placeholder="Add a to-do…"><input id="tddue" type="date" title="Due date (optional)"><button class="b p" data-a="tadd">Add</button></div>' +
      (done.length
        ? '<details class="u-mt8"><summary class="mute small">Done (' +
          done.length +
          ")</summary>" +
          done.map(row).join("") +
          "</details>"
        : "") +
      "</div>"
    );
  }
