/* 19-actions-today: button actions for Today, meals, treats, play logging, tabs and navigation, quick log, search, check-in. Each ACT["name"] runs when a data-a="name" button is tapped. */
ACT["cat"] = function (e, t, a, v, c) {
  ui.cat = v;
  render();
};

ACT["tab"] = function (e, t, a, v, c) {
  if (v === "settings") ui.sset = null;
  ui.tab = v;
  ui.modal = null;
  render();
  window.scrollTo(0, 0);
};

ACT["day"] = function (e, t, a, v, c) {
  var nd = addDays(ui.day, +v);
  if (nd <= today()) {
    ui.day = nd;
    render();
  }
};

ACT["openday"] = function (e, t, a, v, c) {
  ui.cat = t.dataset.k;
  ui.day = v;
  ui.tab = "today";
  ui.modal = null;
  render();
  window.scrollTo(0, 0);
};

ACT["food"] = function (e, t, a, v, c) {
  var d = day();
  d.f[t.dataset.k] = Math.max(0, fmt((d.f[t.dataset.k] || 0) + parseFloat(v)));
  change();
};

ACT["treat"] = function (e, t, a, v, c) {
  var d1 = day();
  d1.treats = Math.max(0, (d1.treats || 0) + +v);
  change();
};

ACT["psel"] = function (e, t, a, v, c) {
  ui.psel = +v;
  render();
};

ACT["play"] = function (e, t, a, v, c) {
  var d2 = day(),
    pt = S.playTypes[+t.dataset.k];
  d2.play[pt] = Math.max(0, (d2.play[pt] || 0) + +v);
  change();
};

ACT["morefoods"] = function (e, t, a, v, c) {
  ui.moreFoods = !ui.moreFoods;
  render();
};

ACT["mopen"] = function (e, t, a, v, c) {
  ui.mealKind = v;
  ui.meal = { cat: ui.cat, fid: "", amt: "", rx: "all" };
  var ms = c.foods.filter(function (f) {
    return f.main && (v === "dry" ? f.kind === "dry" : f.kind !== "dry");
  });
  if (ms.length === 1) {
    ui.meal.fid = ms[0].id;
    if (v !== "dry") ui.meal.amt = 1;
  }
  ui.modal = mealSheet;
  render();
};

ACT["mfood"] = function (e, t, a, v, c) {
  ui.meal = { cat: ui.cat, fid: v, amt: "", rx: "all" };
  var mf2 = c.foods.filter(function (f) {
    return f.id === v;
  })[0];
  if (mf2 && mf2.kind !== "dry") ui.meal.amt = 1;
  render();
};

ACT["mamt"] = function (e, t, a, v, c) {
  ui.meal.amt = parseFloat(v);
  render();
};

ACT["madd"] = function (e, t, a, v, c) {
  var ai3 = document.getElementById("mamt");
  if (ai3) ui.meal.amt = ai3.value;
  var A3 = (ui.meal.add = ui.meal.add || []),
    ix = A3.indexOf(v);
  if (ix >= 0) A3.splice(ix, 1);
  else A3.push(v);
  render();
};

ACT["mrx"] = function (e, t, a, v, c) {
  var ai = document.getElementById("mamt");
  if (ai) ui.meal.amt = ai.value;
  ui.meal.rx = v;
  render();
};

ACT["usual"] = function (e, t, a, v, c) {
  var pv = String(v).split("|");
  logUsual(pv[0], pv[1]);
};

ACT["cidone"] = function (e, t, a, v, c) {
  try {
    localStorage.setItem(LS + "-ci", today());
  } catch (e) {}
  render();
};

ACT["wsdone"] = function (e, t, a, v, c) {
  try {
    localStorage.setItem(LS + "-ws", today());
  } catch (e) {}
  render();
};

ACT["ciapply"] = function (e, t, a, v, c) {
  var kk = t.dataset.k,
    old0 = S.cats[kk].dryAllowance;
  setDry(kk, +v);
  change();
  toast(S.cats[kk].name + ": dry now " + v + " g a day", function () {
    setDry(kk, old0);
    S.cats[kk].vet.pop();
    S.cats[kk].vet.pop();
    change();
  });
};

ACT["quick"] = function (e, t, a, v, c) {
  ui.modal = quickSheet;
  render();
};

ACT["qcat2"] = function (e, t, a, v, c) {
  ui.cat = v;
  render();
};

ACT["qmeal"] = function (e, t, a, v, c) {
  ui.modal = null;
  render();
  logUsual("both", v);
};

ACT["srch"] = function (e, t, a, v, c) {
  ui.modal = searchSheet;
  render();
  setTimeout(function () {
    var q = document.getElementById("qsrch");
    if (q) q.focus();
  }, 50);
};

ACT["mlog"] = function (e, t, a, v, c) {
  var ai2 = document.getElementById("mamt"),
    M2 = ui.meal,
    am = parseFloat(String(ai2 ? ai2.value : M2.amt).replace(",", "."));
  if (!M2 || !M2.fid) return;
  if (!(am > 0)) {
    if (ai2) {
      ai2.focus();
      ai2.style.borderColor = "var(--bad)";
    }
    return;
  }
  ui.modal = null;
  var d5 = day();
  if (!d5.meals) d5.meals = [];
  var now = new Date(),
    tm =
      ui.day === today()
        ? String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0")
        : "";
  d5.meals.push({
    id: uid(),
    f: M2.fid,
    a: am,
    rx: M2.rx,
    t: tm,
    who: (GH && GH.who) || "",
    add: (M2.add || []).slice()
  });
  (M2.add || []).forEach(function (k) {
    d5.checks[k] = true;
  });
  if (M2.rx === "no") {
    if (!d5.waste) d5.waste = {};
    d5.waste[M2.fid] = fmt((d5.waste[M2.fid] || 0) + am);
  } else d5.f[M2.fid] = fmt((d5.f[M2.fid] || 0) + am);
  if (!d5.react) d5.react = {};
  d5.react[M2.fid] = M2.rx;
  ui.meal = { cat: ui.cat, fid: "", amt: "", rx: "all" };
  change();
  celebrate();
};

ACT["mdel"] = function (e, t, a, v, c) {
  var d6 = day(),
    m6 = (d6.meals || []).filter(function (m) {
      return m.id === v;
    })[0];
  if (!m6) return;
  d6.meals = d6.meals.filter(function (m) {
    return m.id !== v;
  });
  (m6.add || []).forEach(function (k) {
    if (
      !d6.meals.some(function (m) {
        return (m.add || []).indexOf(k) >= 0;
      })
    )
      d6.checks[k] = false;
  });
  if (m6.rx === "no") {
    if (d6.waste) d6.waste[m6.f] = Math.max(0, fmt((d6.waste[m6.f] || 0) - m6.a));
  } else d6.f[m6.f] = Math.max(0, fmt((d6.f[m6.f] || 0) - m6.a));
  change();
};

ACT["chk"] = function (e, t, a, v, c) {
  var k = c.checks[+v],
    d3 = day();
  d3.checks[k] = !d3.checks[k];
  change();
};

ACT["close"] = function (e, t, a, v, c) {
  ui.modal = null;
  ui.f = null;
  render();
};
