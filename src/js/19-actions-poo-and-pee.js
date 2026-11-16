/* 19-actions-poo-and-pee: button actions for Poo and pee logging. Each ACT["name"] runs when a data-a="name" button is tapped. */
ACT["lnew"] = function (e, t, a, v, c) {
  ui.pend = [];
  ui.pendFor = "litter";
  var lday = t.dataset.k === "today" ? today() : ui.day;
  ui.l = {
    who: c.name,
    type: v,
    d: lday,
    m: lday === today() ? new Date().toTimeString().slice(0, 5) : "",
    cons: "",
    amt: "Normal",
    smell: "Normal",
    extra: [],
    n: "",
    step: 0
  };
  var recL = S.litter
      .filter(function (x) {
        return x.type === v && x.who === c.name;
      })
      .sort(function (a, b) {
        return a.d + (a.m || "") < b.d + (b.m || "") ? 1 : -1;
      })
      .slice(0, 5),
    prevL = recL[0];
  function modeL(f, dflt) {
    var m = {},
      best = dflt,
      bn = 0;
    recL.forEach(function (x) {
      var q = x[f] || dflt;
      if (!q) return;
      m[q] = (m[q] || 0) + 1;
      if (m[q] > bn) {
        bn = m[q];
        best = q;
      }
    });
    return best;
  }
  if (prevL) {
    ui.l.cons = modeL("cons", "");
    ui.l.amt = modeL("amt", "Normal");
    ui.l.smell = modeL("smell", "Normal");
    if (v !== "Poo" || ui.l.cons) {
      ui.l.step = 99;
      ui.l.pre = 1;
    }
  }
  ui.modal = litterSheet;
  render();
};

ACT["lc"] = function (e, t, a, v, c) {
  var lk = t.dataset.k;
  if (lk === "extra") {
    var li = ui.l.extra.indexOf(v);
    if (li >= 0) ui.l.extra.splice(li, 1);
    else ui.l.extra.push(v);
  } else if (lk === "type" || lk === "who") ui.l[lk] = v;
  else ui.l[lk] = ui.l.step != null && !ui.l.id ? v : ui.l[lk] === v ? "" : v;
  if (lk === "type" && v === "Pee") ui.l.cons = "";
  if (ui.l.step != null && !ui.l.id && lk !== "extra" && ui.l[lk]) ui.l.step++;
  render();
};

ACT["lnext"] = function (e, t, a, v, c) {
  ui.l.step++;
  render();
};

ACT["lback"] = function (e, t, a, v, c) {
  ui.l.step--;
  render();
};

ACT["lgo"] = function (e, t, a, v, c) {
  ui.l.step = +v;
  render();
};

ACT["ledit"] = function (e, t, a, v, c) {
  var lo = S.litter.filter(function (x) {
    return x.id === v;
  })[0];
  ui.l = JSON.parse(JSON.stringify(lo));
  ui.l.extra = ui.l.extra || [];
  ui.pend = ui.l.att || [];
  ui.pendFor = "litter";
  ui.modal = litterSheet;
  render();
};

ACT["lsave"] = function (e, t, a, v, c) {
  var l = ui.l;
  if (l.id)
    S.litter = S.litter.filter(function (x) {
      return x.id !== l.id;
    });
  S.litter.push({
    id: l.id || uid(),
    by: l.by || whoAmI(),
    who: l.who,
    type: l.type,
    d: l.d || today(),
    m: l.m,
    cons: l.cons,
    amt: l.amt,
    smell: l.smell,
    extra: l.extra,
    n: (l.n || "").trim(),
    att: ui.pend
  });
  ui.pend = [];
  ui.pendFor = null;
  ui.l = null;
  ui.modal = null;
  change();
  celebrate();
};

ACT["ldel"] = function (e, t, a, v, c) {
  ui.modal = function () {
    return confirmBox("Delete this entry?", "ldel2", v);
  };
  render();
};

ACT["ldel2"] = function (e, t, a, v, c) {
  S.litter = S.litter.filter(function (x) {
    return x.id !== v;
  });
  ui.modal = null;
  change();
};
