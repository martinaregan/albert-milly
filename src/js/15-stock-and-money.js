/* 15-stock-and-money: Stock and order-by dates, the Money tab, repeating costs, insurance claims. */
  function costWiz() {
    var x = ui.cs,
      steps = ["cat", "who", "amount", "done"],
      st = steps[x.step];
    var body =
      st === "cat"
        ? wizBig(
            CC.map(function (c) {
              return [c, CI[c] + " " + c];
            }),
            x.cat,
            "ccx",
            "cat"
          )
        : st === "who"
          ? wizBig(
              [
                ["albert", S.cats.albert.name],
                ["milly", S.cats.milly.name],
                ["both", "Both"]
              ],
              x.who,
              "ccx",
              "who"
            )
          : st === "amount"
            ? '<label class="l">Amount (€)</label><input data-cs="amount" inputmode="decimal" value="' +
              esc(x.amount) +
              '" placeholder="0.00" style="font-size:24px;font-weight:900"><label class="l">What for</label><input data-cs="desc" value="' +
              esc(x.desc) +
              '" placeholder="e.g. 3 kg z/d, zooplus"><button class="b p w u-mt12 u-p14" data-a="cnext">Next</button>'
            : sumRow("What kind?", CI[x.cat] + " " + x.cat, "cgo", 0) +
              sumRow("Which cat?", { albert: S.cats.albert.name, milly: S.cats.milly.name, both: "Both" }[x.who], "cgo", 1) +
              sumRow("How much?", x.amount ? "€" + x.amount + (x.desc ? " · " + x.desc : "") : "", "cgo", 2) +
              '<label class="l">Date</label><input type="date" data-cs="d" value="' +
              esc(x.d) +
              '"><label class="l">Insurance paid back (€, optional)</label><input data-cs="reimb" inputmode="decimal" value="' +
              esc(x.reimb || "") +
              '"><label class="l">Notes (optional)</label><input data-cs="n" value="' +
              esc(x.n || "") +
              '">' +
              '<div class="chips u-mt10"><button class="chip' +
              (x.planned ? " on" : "") +
              '" data-a="ccx" data-k="planned" data-v="1">📅 Not paid yet (planned)</button><button class="chip' +
              (x.rep === "monthly" ? " on" : "") +
              '" data-a="ccx" data-k="rep" data-v="1">🔁 Every month from this date</button></div>' +
              (x.cat === "Vet" || x.cat === "Insurance" || x.reimb
                ? '<label class="l">Insurance claim</label><div class="chips">' +
                  [
                    ["", "Not claimed"],
                    ["claimed", "Claimed, waiting"],
                    ["paid", "Paid out"],
                    ["rejected", "Rejected"]
                  ]
                    .map(function (o) {
                      return (
                        '<button class="chip' +
                        ((x.claim || "") === o[0] ? " on" : "") +
                        '" data-a="ccx" data-k="claim" data-v="' +
                        o[0] +
                        '">' +
                        o[1] +
                        "</button>"
                      );
                    })
                    .join("")
                : "<div>") +
              "</div>" +
              '<button class="b p w u-mt14 u-p16 u-fs17" data-a="csave">Save cost</button>';
    return wizFrame(
      "Add a cost",
      x.step,
      steps.length,
      { cat: "What kind of cost?", who: "Which cat?", amount: "How much was it?", done: "All good?" }[st],
      body,
      "cback"
    );
  }

  function orderBy(k, f) {
    var st = stockOf(k, f);
    if (!st || st.days == null) return null;
    var t = today(),
      out = addDays(t, st.days),
      nm = S.cats[k].name,
      by = out,
      why = "";
    ((S.info && S.info.bookings) || []).forEach(function (b) {
      if (!b.from || !b.to || b.to < t) return;
      if ((b.cats || []).length && (b.cats || []).indexOf(nm) < 0) return;
      if (b.from <= out && b.to > out && b.from < by) {
        by = b.from;
        why =
          " (to cover " +
          (b.place || "the booking").split(" ")[0] +
          " " +
          short(b.from) +
          " to " +
          short(b.to) +
          ")";
      }
    });
    var ob = addDays(by, -3);
    if (ob < t) ob = t;
    return { by: ob, days: daysBetween(t, ob), out: out, why: why };
  }

  function addMon(ds, n) {
    var p = parse(ds),
      y = p.getFullYear(),
      m = p.getMonth() + n,
      last = new Date(y, m + 1, 0).getDate();
    return iso(new Date(y, m, Math.min(p.getDate(), last)));
  }

  function allCosts() {
    var t = today(),
      out = [];
    (S.costs || []).forEach(function (x) {
      if (x.rep !== "monthly") {
        out.push(x);
        return;
      }
      var i = 0,
        d = x.d,
        stop = x.until || "9999";
      while (d <= t && d <= stop && i < 240) {
        out.push(Object.assign({}, x, { id: x.id + "@" + d, d: d, tpl: x.id, planned: false }));
        i++;
        d = addMon(x.d, i);
      }
      if (d <= stop) out.push(Object.assign({}, x, { id: x.id + "@" + d, d: d, tpl: x.id, planned: true }));
    });
    return out;
  }

  function usedSince(c, f, since) {
    var u = 0;
    Object.keys(c.days).forEach(function (d) {
      if (d >= since) u += ((c.days[d].f || {})[f.id] || 0) + ((c.days[d].waste || {})[f.id] || 0);
    });
    return u;
  }

  function stockOf(k, f) {
    var c = S.cats[k],
      st = S.stock[f.id];
    if (!st || st.qty === "") return null;
    var rem = st.qty - (usedSince(c, f, st.on) - (st.usedAtSet || 0));
    var daily = 0,
      n = 0;
    for (var i = 1; i <= 7; i++) {
      var x = peek(c, addDays(today(), -i));
      if (x && x.f && x.f[f.id]) {
        daily += x.f[f.id];
        n++;
      }
    }
    daily = n ? daily / n : (f.kind === "dry" ? c.dryAllowance : c.wetAllowance) || 0;
    return { rem: Math.max(0, rem), daily: daily, days: daily ? Math.floor(Math.max(0, rem) / daily) : null };
  }

  function extraRem(x) {
    if (x.qty === "" || x.qty == null) return null;
    if (!x.check) return +x.qty;
    var u = 0;
    (x.cat === "both" ? ["albert", "milly"] : [x.cat || "albert"]).forEach(function (ck) {
      var c = S.cats[ck];
      Object.keys(c.days).forEach(function (d) {
        if (d >= x.on && c.days[d].checks && c.days[d].checks[x.check]) u++;
      });
    });
    return Math.max(0, x.qty - (u - (x.usedAtSet || 0)));
  }

  function vStock() {
    var ed = editing("stock");
    function info(k, f) {
      var st = stockOf(k, f),
        left = st
          ? f.kind === "dry"
            ? st.rem >= 1000
              ? (st.rem / 1000).toFixed(2) + " kg"
              : Math.round(st.rem) + " g"
            : fmt(st.rem) + " left"
          : "Not set";
      return { st: st, left: left, days: st && st.days != null ? st.days : null };
    }
    function pill(days) {
      if (days == null) return '<span class="dpill">-</span>';
      var c = days < 7 ? "bad" : days < 14 ? "warn" : "ok";
      return '<span class="dpill ' + c + '">' + days + "d</span>";
    }
    function row(k, f, showCat) {
      var o = info(k, f),
        pct = o.days != null ? Math.min(100, (o.days / 30) * 100) : 0;
      return (
        '<div class="srow">' +
        (showCat
          ? spot(k).replace('class="spot"', 'class="spot" style="width:24px;height:24px;flex:none"')
          : "") +
        '<div class="u-flex1 u-minw0"><div class="ell u-fw700">' +
        esc(f.name) +
        '</div><div class="small mute">' +
        o.left +
        (o.days != null ? " · runs out ~" + short(addDays(today(), o.days)) : "") +
        "</div>" +
        (function () {
          var ob = orderBy(k, f);
          return ob
            ? '<div class="small" style="margin-top:2px;font-weight:700;color:' +
                (ob.days < 7 ? "var(--bad)" : "var(--mute)") +
                '">🛒 Order by ' +
                (ob.days <= 0 ? "today" : short(ob.by)) +
                esc(ob.why) +
                "</div>"
            : "";
        })() +
        (o.st && o.days != null
          ? '<div class="bar' +
            (o.days < 7 ? " over" : "") +
            '" style="margin-top:5px;height:5px"><div style="width:' +
            Math.max(pct, 2) +
            '%"></div></div>'
          : "") +
        "</div>" +
        (ed
          ? '<input class="amt" inputmode="decimal" data-stock="' +
            k +
            "|" +
            f.id +
            '" placeholder="' +
            (f.kind === "dry" ? "g" : "count") +
            '" value="' +
            (o.st ? Math.round(o.st.rem * 10) / 10 : "") +
            '">'
          : pill(o.days) +
            '<button class="b s ghost" style="flex:none" data-a="restock" data-v="' +
            k +
            "|" +
            f.id +
            '">+</button>') +
        "</div>"
      );
    }
    var low = [];
    ["albert", "milly"].forEach(function (k) {
      S.cats[k].foods
        .filter(function (f) {
          return f.main;
        })
        .forEach(function (f) {
          var ob = orderBy(k, f);
          if (ob && ob.days < 7) low.push([k, f, ob.days]);
        });
    });
    low.sort(function (a, b) {
      return a[2] - b[2];
    });
    var xl = S.extraStock.filter(function (x) {
      if (x.need) return true;
      if (x.group === "treat") return false;
      var r = extraRem(x);
      return r != null && r <= (x.unit === "sticks" || x.unit === "scoops" || x.unit === "doses" ? 5 : 0);
    });
    var nb = low.length + xl.length,
      soon =
        low.filter(function (x) {
          return x[2] < 3;
        }).length +
        xl.filter(function (x) {
          return extraRem(x) === 0;
        }).length;
    var h =
      '<div class="wcount' +
      (soon ? " urgent" : nb ? " over" : "") +
      '"' +
      (nb ? ' data-a="gobuy" style="cursor:pointer"' : "") +
      '><div><span class="mute small">Shopping</span><b>' +
      (nb ? nb + " to buy soon" : "All stocked up") +
      '</b><span class="mute small">' +
      (nb
        ? (soon ? soon + " out or gone within 3 days" : "Nothing urgent yet") + " · tap to see"
        : "Nothing runs out this week") +
      '</span></div><div class="wdays' +
      (nb ? "" : " now") +
      '">' +
      (nb ? "<span>" + nb + "</span><small>" + (nb > 1 ? "items" : "item") + "</small>" : "✓") +
      "</div></div>";
    h +=
      '<div class="card" id="buysoon"><div class="row between u-nowrap"><h2 class="u-m0">🛒 Buy soon</h2>' +
      editBtn("stock") +
      "</div>" +
      (nb
        ? low
            .map(function (x) {
              return row(x[0], x[1], true);
            })
            .join("") +
          xl
            .map(function (x) {
              var r = extraRem(x),
                i = S.extraStock.indexOf(x);
              return (
                '<div class="srow"><div class="u-flex1"><div class="u-fw700">' +
                esc(x.name) +
                '</div><div class="small mute">' +
                (x.need ? "You marked this to buy" : r + " " + esc(x.unit || "") + " left") +
                "</div></div>" +
                '<span class="dpill bad u-mr6">' +
                (x.need ? "To buy" : r === 0 ? "Out" : "Low") +
                '</span><button class="b s" style="flex:none" data-a="xbought" data-v="' +
                i +
                '">✓ Bought</button>' +
                "</div>"
              );
            })
            .join("")
        : '<div class="note u-mt6">✅ Nothing running low.</div>') +
      "</div>";
    ["albert", "milly"].forEach(function (k) {
      var c = S.cats[k],
        mains = c.foods.filter(function (f) {
          return f.main;
        }),
        others = c.foods.filter(function (f) {
          return !f.main;
        });
      var sub =
        mains
          .map(function (f) {
            var ob = orderBy(k, f),
              o = info(k, f);
            return (
              (f.kind === "dry" ? "Dry" : "Wet") +
              (ob ? ": order by " + (ob.days <= 0 ? "today" : short(ob.by)) : ": " + o.left)
            );
          })
          .join(" · ") || "Tap to add food";
      h +=
        '<details class="catcard catd" data-open="stk-' +
        k +
        '"' +
        (ed ? " open" : isOpen("stk-" + k, false)) +
        '><summary class="head" style="--g:var(--g-' +
        k +
        ')">' +
        spot(k) +
        "<div><b>" +
        esc(c.name) +
        "'s food</b><span>" +
        esc(sub) +
        "</span></div></summary>" +
        mains
          .map(function (f) {
            return row(k, f);
          })
          .join("");
      if (others.length)
        h +=
          '<details class="nf" data-open="sto' +
          k +
          '"' +
          (ed ? " open" : isOpen("sto" + k, false)) +
          '><summary><span>🥫 Other food in the cupboard <span class="nfc">' +
          others.length +
          "</span></span></summary>" +
          others
            .map(function (f) {
              return row(k, f);
            })
            .join("") +
          "</details>";
      h +=
        '<button class="b s ghost" style="margin-top:10px" data-a="addfood2" data-k="' +
        k +
        '">+ New food</button></details>';
    });
    var G = [
      ["supp", "💊", "Supplements", "#ffffff,#e7e5e4"],
      ["treat", "🍬", "Treats", "#f6a25e,#d4622a"],
      ["home", "🏠", "Household", "#52525b,#18181b"]
    ];
    G.forEach(function (g) {
      var xs = S.extraStock
        .map(function (x, i) {
          return [x, i];
        })
        .filter(function (p) {
          return (p[0].group || "home") === g[0];
        });
      if (!xs.length) return;
      var lowN = xs.filter(function (p) {
        var r = extraRem(p[0]);
        return (
          p[0].need ||
          (r != null &&
            r <= (p[0].unit === "sticks" || p[0].unit === "scoops" || p[0].unit === "doses" ? 5 : 0))
        );
      }).length;
      h +=
        '<details class="catcard catd icard" data-open="sg' +
        g[0] +
        '"' +
        (ed ? " open" : isOpen("sg" + g[0], false)) +
        '><summary class="head"><span class="ihic" style="background:linear-gradient(135deg,' +
        g[3] +
        ')">' +
        g[1] +
        "</span><div><b>" +
        g[2] +
        "</b><span>" +
        xs.length +
        " item" +
        (xs.length > 1 ? "s" : "") +
        (lowN ? " · " + lowN + " low" : " · all fine") +
        "</span></div></summary>" +
        xs
          .map(function (p) {
            var x = p[0],
              i = p[1],
              r = extraRem(x),
              lw =
                r != null && r <= (x.unit === "sticks" || x.unit === "scoops" || x.unit === "doses" ? 5 : 0);
            return (
              '<div class="srow"><div class="u-flex1 u-minw0"><div class="ell u-fw700">' +
              esc(x.name) +
              '</div><div class="small mute">' +
              (r == null ? "Not set" : r + " " + esc(x.unit || "") + " left") +
              (x.check ? " · counts down when ticked" : "") +
              "</div>" +
              (x.prev && x.prev.at === today()
                ? '<button class="b s ghost" style="margin-top:6px" data-a="xundo" data-v="' +
                  i +
                  '">↩ Undo "Bought"</button>'
                : "") +
              "</div>" +
              (ed
                ? '<input class="amt" inputmode="decimal" data-xstock="' +
                  i +
                  '" placeholder="how many" value="' +
                  (r == null ? "" : r) +
                  '">'
                : (lw ? '<span class="dpill bad">' + (r === 0 ? "Out" : "Low") + "</span>" : "") +
                  '<button class="b s' +
                  (x.need ? " p" : " ghost") +
                  '" style="flex:none" data-a="xneed" data-v="' +
                  i +
                  '">' +
                  (x.need ? "🛒 On list" : "🛒 Buy") +
                  "</button>") +
              "</div>"
            );
          })
          .join("") +
        "</details>";
    });
    return h;
  }

  function restockSheet() {
    var p = ui.rs,
      f = S.cats[p.k].foods.filter(function (x) {
        return x.id === p.id;
      })[0];
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">Bought more ' +
      esc(f.name) +
      '</h2><label class="l">' +
      (f.kind === "dry"
        ? "How much did you buy? (grams, e.g. 1500 for a 1.5 kg bag)"
        : "How many cans/pouches?") +
      '</label><input id="rsamt" inputmode="decimal"><div class="grid3 u-mt8">' +
      (f.kind === "dry"
        ? [1500, 3000, 8000]
            .map(function (g) {
              return '<button class="b s" data-a="rsq" data-v="' + g + '">' + g / 1000 + " kg</button>";
            })
            .join("")
        : [12, 24, 48]
            .map(function (n) {
              return '<button class="b s" data-a="rsq" data-v="' + n + '">' + n + "</button>";
            })
            .join("")) +
      '</div><label class="l">Price (€, optional: adds it to Money)</label><input id="rsprice" inputmode="decimal"><div class="row u-mt14"><button class="b p" data-a="rssave">Add to stock</button><button class="b" data-a="close">Cancel</button></div></div></div>'
    );
  }

  function setStock(k, fid, qty) {
    var c = S.cats[k],
      f = c.foods.filter(function (x) {
        return x.id === fid;
      })[0],
      t = today();
    S.stock[fid] = { qty: qty, on: t, usedAtSet: ((peek(c, t) || {}).f || {})[fid] || 0 };
  }

  var CC = [
    "Food",
    "Vet",
    "Insurance",
    "Litter",
    "Supplements",
    "Worm & flea",
    "Hotel / sitter",
    "Toys & kit",
    "Other"
  ];

  var CI = {
    Food: "🍽️",
    Vet: "🏥",
    Insurance: "🛡️",
    Litter: "🧻",
    Supplements: "💊",
    "Worm & flea": "🐛",
    "Hotel / sitter": "🏨",
    "Toys & kit": "🧶",
    Other: "🧾"
  };

  function eur(n) {
    return "€" + (Math.round(n * 100) / 100).toFixed(2);
  }

  function upcomingCosts(who) {
    var t = today(),
      end = addDays(t, 30),
      it = [];
    ["albert", "milly"].forEach(function (k) {
      if (who !== "both" && who !== k) return;
      S.cats[k].foods.forEach(function (f) {
        if (!f.main || !f.price) return;
        var ob = orderBy(k, f);
        if (!ob) return;
        var d = ob.by;
        if (d <= end)
          it.push({
            d: d,
            ic: f.kind === "dry" ? "🥣" : "🥫",
            tx: f.name.split(" (")[0],
            sub: S.cats[k].name + " · order by" + (f.buy ? " · " + f.buy : ""),
            eur: +f.price
          });
      });
    });
    (S.extraStock || []).forEach(function (x) {
      if (!x.price || (who !== "both" && x.cat && x.cat !== "both" && x.cat !== who)) return;
      var r = extraRem(x);
      if (r != null && r <= 0)
        it.push({ d: t, ic: "🧺", tx: x.name, sub: "Both" + (x.buy ? " · " + x.buy : ""), eur: +x.price });
    });
    allCosts().forEach(function (x) {
      if (x.planned && x.d >= t && x.d <= end && (who === "both" || x.who === who || x.who === "both"))
        it.push({ d: x.d, ic: CI[x.cat] || "🧾", tx: x.desc || x.cat, sub: "planned", eur: x.amount });
    });
    if (!it.length) return "";
    it.sort(function (a, b) {
      return a.d < b.d ? -1 : 1;
    });
    var tot = it.reduce(function (m, x) {
      return m + x.eur;
    }, 0);
    return (
      '<div class="card"><div class="row between u-nowrap"><h2 class="u-m0">Coming up · 30 days</h2><b class="u-fs18">~' +
      eur(tot) +
      "</b></div>" +
      it
        .map(function (x) {
          var n = daysBetween(t, x.d);
          return (
            '<div class="agr"><span class="agd' +
            (n <= 0 ? " late" : n <= 3 ? " now" : "") +
            '">' +
            (n <= 0
              ? "<b>Now</b>"
              : n === 1
                ? "<b>Tmrw</b>"
                : "<b>" +
                  parse(x.d).getDate() +
                  "</b>" +
                  parse(x.d).toLocaleDateString(LOC(), { month: "short" })) +
            '</span><span class="agi">' +
            x.ic +
            '</span><span class="agt">' +
            esc(x.tx) +
            "<small>" +
            esc(x.sub) +
            "</small></span><b>~" +
            eur(x.eur) +
            "</b></div>"
          );
        })
        .join("") +
      '<div class="note u-mt6">Food shows on the date to order by (3 days before it runs out, or before a cat hotel stay), at the usual price.</div></div>'
    );
  }

  function moneyPeriods(who, share) {
    var t = today(),
      per = ui.fper || "year",
      dow = (parse(t).getDay() + 6) % 7,
      start = {
        day: t,
        week: addDays(t, -dow),
        month: t.slice(0, 7) + "-01",
        year: t.slice(0, 4) + "-01-01"
      }[per],
      L = { day: "Today", week: "This week", month: "This month", year: "This year" },
      sp = 0,
      bk = 0,
      n = 0;
    allCosts().forEach(function (x) {
      if (x.planned || x.d < start || x.d > t || !(who === "both" || x.who === who || x.who === "both"))
        return;
      sp += x.amount * share(x);
      bk += (x.reimb || 0) * share(x);
      n++;
    });
    return (
      '<div class="card"><div class="row between u-nowrap"><h2 class="u-m0">Spent so far</h2><span class="mute small">' +
      n +
      " cost" +
      (n !== 1 ? "s" : "") +
      '</span></div><div class="seg pseg">' +
      ["day", "week", "month", "year"]
        .map(function (k) {
          return (
            '<button class="' +
            (per === k ? "on" : "") +
            '" data-a="fper" data-v="' +
            k +
            '">' +
            { day: "Day", week: "Week", month: "Month", year: "Year" }[k] +
            "</button>"
          );
        })
        .join("") +
      '</div><div class="mute small u-m2-0-8">' +
      L[per] +
      (per === "day" ? "" : " · since " + short(start)) +
      '</div><div class="grid3"><div class="stat"><span class="mute">Spent</span><b>' +
      eur(sp) +
      '</b></div><div class="stat"><span class="mute">Back</span><b>' +
      eur(bk) +
      '</b></div><div class="stat"><span class="mute">You paid</span><b>' +
      eur(sp - bk) +
      "</b></div></div></div>"
    );
  }

  function vMoney() {
    var m = ui.fmonth || today().slice(0, 7),
      first = parse(m + "-01"),
      who = ui.fwho || "both";
    var AC = allCosts(),
      inM = AC.filter(function (x) {
        return x.d.slice(0, 7) === m && (who === "both" || x.who === who || x.who === "both");
      }),
      yr = AC.filter(function (x) {
        return (
          x.d.slice(0, 4) === m.slice(0, 4) &&
          !x.planned &&
          (who === "both" || x.who === who || x.who === "both")
        );
      });
    function share(x) {
      return who === "both" || x.who !== "both" ? 1 : 0.5;
    }
    var spent = 0,
      back = 0,
      plan = 0,
      byc = {};
    inM.forEach(function (x) {
      var a = x.amount * share(x);
      if (x.planned) {
        plan += a;
        return;
      }
      spent += a;
      back += (x.reimb || 0) * share(x);
      byc[x.cat] = (byc[x.cat] || 0) + a;
    });
    var ys = 0,
      yb = 0;
    yr.forEach(function (x) {
      ys += x.amount * share(x);
      yb += (x.reimb || 0) * share(x);
    });
    var h =
      '<div class="seg">' +
      [
        ["both", "Both"],
        ["albert", S.cats.albert.name],
        ["milly", S.cats.milly.name]
      ]
        .map(function (o) {
          return (
            '<button class="' +
            (who === o[0] ? "on" : "") +
            '" data-a="fwho" data-v="' +
            o[0] +
            '">' +
            (o[0] === "both"
              ? '<span class="faces">' + spot("albert") + spot("milly") + "</span>"
              : spot(o[0])) +
            "<span>" +
            o[1] +
            "</span></button>"
          );
        })
        .join("") +
      "</div>";
    h +=
      '<div class="hero money"><div class="row between"><button class="rnd u-bg-rgba-255-255-255-_2 u-c-fff" data-a="fmon" data-v="-1">‹</button><div class="u-ta-center"><div class="sub">' +
      first.toLocaleDateString(LOC(), { month: "long", year: "numeric" }) +
      '</div><div class="wt u-mt4">' +
      eur(spent - back) +
      '</div><div class="sub">you paid after insurance</div></div><button class="rnd' +
      (m >= today().slice(0, 7) ? " off" : "") +
      '" style="background:rgba(255,255,255,.2);color:#fff" data-a="fmon" data-v="1">›</button></div>' +
      '<div class="ends u-mt12"><span>Spent ' +
      eur(spent) +
      "</span><span>Insurance back " +
      eur(back) +
      "</span></div>" +
      (plan
        ? '<div class="ends u-mt4"><span>Coming up: ' + eur(plan) + "</span></div>"
        : "") +
      "</div>";
    var wait = allCosts().filter(function (x) {
      return x.claim === "claimed";
    });
    if (wait.length)
      h +=
        '<div class="card u-p12-16"><b>Waiting on insurance</b><div class="small mute">' +
        wait.length +
        " claim" +
        (wait.length > 1 ? "s" : "") +
        " · " +
        wait
          .map(function (x) {
            return esc(x.desc || x.cat) + " (" + eur(x.amount) + ")";
          })
          .join(", ") +
        "</div></div>";
    h += '<button class="b p w u-mb12 u-p14" data-a="cnew">+ Add a cost</button>';
    h += upcomingCosts(who);
    if (Object.keys(byc).length) {
      var mx = Math.max.apply(
        0,
        Object.keys(byc).map(function (k) {
          return byc[k];
        })
      );
      h +=
        '<div class="card"><h2>Where it went</h2>' +
        Object.keys(byc)
          .sort(function (a, b) {
            return byc[b] - byc[a];
          })
          .map(function (k) {
            return (
              '<div class="hbar"><span>' +
              CI[k] +
              " " +
              k +
              '</span><div class="bar"><div style="width:' +
              (byc[k] / mx) * 100 +
              '%"></div></div><b>' +
              eur(byc[k]) +
              "</b></div>"
            );
          })
          .join("") +
        "</div>";
    }
    h +=
      '<details class="card list mlist" data-open="mlist"' +
      isOpen("mlist", false) +
      "><summary><span><b>" +
      first.toLocaleDateString(LOC(), { month: "long" }) +
      '</b><span class="mute small"> · ' +
      inM.length +
      " cost" +
      (inM.length !== 1 ? "s" : "") +
      "</span></span><b>" +
      eur(spent) +
      "</b></summary>" +
      (inM.length
        ? inM
            .slice()
            .sort(function (a, b) {
              return a.d < b.d ? 1 : -1;
            })
            .map(function (x) {
              return (
                '<div class="it"><div class="row between u-nowrap"><div class="row u-nowrap u-gap10"><span class="ic u-w38 u-h38 u-r12 u-bg-var---bg u-d-grid u-place-items-center u-fs17 u-flex-none">' +
                (CI[x.cat] || "🧾") +
                "</span><div><b>" +
                esc(x.desc || x.cat) +
                '</b><div class="small mute">' +
                short(x.d) +
                " · " +
                (x.who === "both" ? "Both" : S.cats[x.who].name) +
                " · " +
                x.cat +
                (x.claim
                  ? ' · <span class="clm ' +
                    x.claim +
                    '">' +
                    { claimed: "Claim waiting", paid: "Claim paid", rejected: "Claim rejected" }[x.claim] +
                    "</span>"
                  : "") +
                (x.rep === "monthly" ? " · 🔁 monthly" : "") +
                (x.planned ? " · <b>planned</b>" : "") +
                '</div></div></div><div class="u-ta-right"><b>' +
                eur(x.amount) +
                "</b>" +
                (x.reimb
                  ? '<div class="small u-c-var---ok">−' + eur(x.reimb) + " back</div>"
                  : "") +
                '</div></div><div class="row u-jc-flex-end"><button class="x" data-a="cedit" data-v="' +
                x.id +
                '">Edit</button><button class="x" data-a="cdel" data-v="' +
                x.id +
                '">✕</button></div></div>'
              );
            })
            .join("")
        : emptyState(
            "",
            "Nothing spent this month",
            "Nice.",
            '<button class="b s p" data-a="cnew">Add a cost</button>'
          )) +
      "</details>";
    h += moneyPeriods(who, share);
    if (0)
      h +=
        '<div class="card"><h2>' +
        m.slice(0, 4) +
        ' so far</h2><div class="grid3"><div class="stat"><span class="mute">Spent</span><b>' +
        eur(ys) +
        '</b></div><div class="stat"><span class="mute">Back</span><b>' +
        eur(yb) +
        '</b></div><div class="stat"><span class="mute">You paid</span><b>' +
        eur(ys - yb) +
        "</b></div></div></div>";
    return h;
  }

  function costSheet() {
    var x = ui.cs;
    if (!x.id && x.step != null) return costWiz();
    function chips(list, key) {
      return (
        '<div class="chips">' +
        list
          .map(function (o) {
            var v = o[0] || o,
              lab = o[1] || o;
            return (
              '<button class="chip' +
              (x[key] === v ? " on" : "") +
              '" data-a="ccx" data-k="' +
              key +
              '" data-v="' +
              esc(v) +
              '">' +
              lab +
              "</button>"
            );
          })
          .join("") +
        "</div>"
      );
    }
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">' +
      (x.id ? "Edit cost" : "Add a cost") +
      "</h2>" +
      '<div class="grid2"><div><label class="l">Amount (€)</label><input data-cs="amount" inputmode="decimal" value="' +
      esc(x.amount) +
      '" placeholder="0.00"></div><div><label class="l">Date</label><input type="date" data-cs="d" value="' +
      esc(x.d) +
      '"></div></div>' +
      '<label class="l">What for</label><input data-cs="desc" value="' +
      esc(x.desc) +
      '" placeholder="e.g. 3 kg z/d, zooplus">' +
      '<label class="l">Category</label>' +
      chips(
        CC.map(function (c) {
          return [c, CI[c] + " " + c];
        }),
        "cat"
      ) +
      '<label class="l">Which cat</label>' +
      chips(
        [
          ["albert", S.cats.albert.name],
          ["milly", S.cats.milly.name],
          ["both", "Both"]
        ],
        "who"
      ) +
      '<label class="l">Insurance paid back (€, optional)</label><input data-cs="reimb" inputmode="decimal" value="' +
      esc(x.reimb || "") +
      '">' +
      '<label class="l">Notes</label><input data-cs="n" value="' +
      esc(x.n || "") +
      '">' +
      '<div class="chips u-mt10"><button class="chip' +
      (x.planned ? " on" : "") +
      '" data-a="ccx" data-k="planned" data-v="1">📅 Not paid yet (planned)</button><button class="chip' +
      (x.rep === "monthly" ? " on" : "") +
      '" data-a="ccx" data-k="rep" data-v="1">🔁 Every month from this date</button></div>' +
      (x.cat === "Vet" || x.cat === "Insurance" || x.reimb
        ? '<label class="l">Insurance claim</label><div class="chips">' +
          [
            ["", "Not claimed"],
            ["claimed", "Claimed, waiting"],
            ["paid", "Paid out"],
            ["rejected", "Rejected"]
          ]
            .map(function (o) {
              return (
                '<button class="chip' +
                ((x.claim || "") === o[0] ? " on" : "") +
                '" data-a="ccx" data-k="claim" data-v="' +
                o[0] +
                '">' +
                o[1] +
                "</button>"
              );
            })
            .join("")
        : "<div>") +
      "</div>" +
      '<div class="row u-mt14"><button class="b p" data-a="csave">Save</button><button class="b" data-a="close">Cancel</button></div></div></div>'
    );
  }
