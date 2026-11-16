/* 19-actions-money: button actions for Costs and insurance claims. Each ACT["name"] runs when a data-a="name" button is tapped. */
ACT["cnext"] = function (e, t, a, v, c) {
  var am0 = parseFloat(String(ui.cs.amount).replace(",", "."));
  if (isNaN(am0)) {
    var ai0 = document.querySelector("[data-cs=amount]");
    if (ai0) ai0.style.borderColor = "var(--bad)";
    return;
  }
  ui.cs.step++;
  render();
};

ACT["cback"] = function (e, t, a, v, c) {
  ui.cs.step--;
  render();
};

ACT["cgo"] = function (e, t, a, v, c) {
  ui.cs.step = +v;
  render();
};

ACT["fper"] = function (e, t, a, v, c) {
  ui.fper = v;
  render();
};

ACT["fwho"] = function (e, t, a, v, c) {
  ui.fwho = v;
  render();
};

ACT["fmon"] = function (e, t, a, v, c) {
  var fp = parse((ui.fmonth || today().slice(0, 7)) + "-01");
  fp.setMonth(fp.getMonth() + +v);
  ui.fmonth = iso(fp).slice(0, 7);
  if (ui.fmonth > today().slice(0, 7)) ui.fmonth = today().slice(0, 7);
  render();
};

ACT["cnew"] = function (e, t, a, v, c) {
  ui.cs = {
    step: 0,
    amount: "",
    d: today(),
    desc: "",
    cat: "",
    who: ui.fwho && ui.fwho !== "both" ? ui.fwho : "both",
    reimb: "",
    n: "",
    planned: false
  };
  ui.modal = costSheet;
  render();
};

ACT["cedit"] = function (e, t, a, v, c) {
  v = String(v).split("@")[0];
  ui.cs = JSON.parse(
    JSON.stringify(
      S.costs.filter(function (x) {
        return x.id === v;
      })[0]
    )
  );
  ui.modal = costSheet;
  render();
};

ACT["ccx"] = function (e, t, a, v, c) {
  if (t.dataset.k === "planned") ui.cs.planned = !ui.cs.planned;
  else if (t.dataset.k === "rep") ui.cs.rep = ui.cs.rep === "monthly" ? "" : "monthly";
  else {
    ui.cs[t.dataset.k] = v;
    if (!ui.cs.id && ui.cs.step != null && (t.dataset.k === "cat" || t.dataset.k === "who")) ui.cs.step++;
  }
  render();
};

ACT["csave"] = function (e, t, a, v, c) {
  var cx = ui.cs,
    am = parseFloat(String(cx.amount).replace(",", "."));
  if (isNaN(am)) {
    var ai = document.querySelector("[data-cs=amount]");
    if (ai) ai.style.borderColor = "var(--bad)";
    return;
  }
  var rb = parseFloat(String(cx.reimb || "").replace(",", "."));
  if (cx.id)
    S.costs = S.costs.filter(function (x) {
      return x.id !== cx.id;
    });
  S.costs.push({
    id: cx.id || uid(),
    d: cx.d || today(),
    who: cx.who,
    cat: cx.cat,
    amount: am,
    reimb: isNaN(rb) ? 0 : rb,
    desc: (cx.desc || "").trim(),
    n: (cx.n || "").trim(),
    planned: cx.rep === "monthly" ? false : !!cx.planned,
    claim: cx.claim || undefined,
    rep: cx.rep === "monthly" ? "monthly" : undefined,
    until: cx.rep === "monthly" ? cx.until : undefined
  });
  ui.cs = null;
  ui.modal = null;
  change();
};

ACT["cdel"] = function (e, t, a, v, c) {
  if (String(v).indexOf("@") > 0) {
    var tv = String(v).split("@")[0];
    ui.modal = function () {
      return confirmBox("Stop this monthly cost from today? Past months stay in the totals.", "cstop", tv);
    };
    render();
  } else {
    ui.modal = function () {
      return confirmBox("Delete this cost?", "cdel2", v);
    };
    render();
  }
};

ACT["cstop"] = function (e, t, a, v, c) {
  S.costs.forEach(function (x) {
    if (x.id === v) x.until = today();
  });
  ui.modal = null;
  change();
};

ACT["cdel2"] = function (e, t, a, v, c) {
  S.costs = S.costs.filter(function (x) {
    return x.id !== v;
  });
  ui.modal = null;
  change();
};
