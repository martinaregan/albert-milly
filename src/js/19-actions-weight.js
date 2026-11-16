/* 19-actions-weight: button actions for Weigh-ins. Each ACT["name"] runs when a data-a="name" button is tapped. */
ACT["calc"] = function (e, t, a, v, c) {
  var A = num("wa"),
    B = num("wb");
  if (A && B && A > B) document.getElementById("wk").value = (A - B).toFixed(2);
};

ACT["wopen"] = function (e, t, a, v, c) {
  ui.modal = weighSheet;
  render();
};

ACT["addw2"] = function (e, t, a, v, c) {
  var W = ui.w,
    me = toKg(W.me),
    saved = 0,
    bad = false;
  ["albert", "milly"].forEach(function (k) {
    var tot = toKg(W[k]);
    if (isNaN(tot)) return;
    var cw = Math.round((tot - me) * 100) / 100;
    if (isNaN(me) || cw < 1 || cw > 20) {
      bad = true;
      return;
    }
    var cc = S.cats[k];
    cc.weights = cc.weights.filter(function (x) {
      return x.d !== W.d;
    });
    cc.weights.push({ d: W.d, kg: cw });
    saved++;
  });
  if (bad) {
    saveState = "Check the numbers";
    render();
    return;
  }
  if (!saved) {
    flash(isNaN(me) ? "me" : "albert");
    return;
  }
  ui.w = { d: today(), me: "", albert: "", milly: "", direct: "" };
  ui.modal = null;
  change();
};

ACT["addw"] = function (e, t, a, v, c) {
  var wkid = document.getElementById("wk-" + ui.cat) ? "wk-" + ui.cat : "wk",
    kg = toKg((document.getElementById(wkid) || {}).value || ""),
    dd = (ui.w && ui.w.d) || today();
  if (!kg || kg < 1 || kg > 20) {
    flash(wkid);
    return;
  }
  c.weights = c.weights.filter(function (w) {
    return w.d !== dd;
  });
  c.weights.push({ d: dd, kg: kg });
  ui.modal = null;
  change();
};

ACT["wedit"] = function (e, t, a, v, c) {
  var wo = c.weights.filter(function (x) {
    return x.d === v;
  })[0];
  ui.we = { old: v, d: v, kg: wn(wo.kg) };
  ui.modal = function () {
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">Edit ' +
      esc(c.name) +
      '\'s weigh-in</h2><div class="grid2"><div><label class="l">Date</label><input type="date" data-we="d" value="' +
      ui.we.d +
      '" max="' +
      today() +
      '"></div><div><label class="l">Weight (' + UL() + ')</label><input data-we="kg" inputmode="decimal" value="' +
      esc(ui.we.kg) +
      '"></div></div><div class="row u-mt14"><button class="b p" data-a="wsave">Save</button><button class="b" data-a="close">Cancel</button></div></div></div>'
    );
  };
  render();
};

ACT["wsave"] = function (e, t, a, v, c) {
  var we = ui.we,
    nk = toKg(we.kg);
  if (isNaN(nk) || nk < 1 || nk > 20) {
    var ki = document.querySelector("[data-we=kg]");
    if (ki) ki.style.borderColor = "var(--bad)";
    return;
  }
  c.weights = c.weights.filter(function (x) {
    return x.d !== we.old && x.d !== we.d;
  });
  c.weights.push({ d: we.d || we.old, kg: nk });
  ui.we = null;
  ui.modal = null;
  change();
};

ACT["delw"] = function (e, t, a, v, c) {
  ui.modal = function () {
    return confirmBox("Delete the weigh-in on " + short(v) + "?", "delw2", v);
  };
  render();
};

ACT["delw2"] = function (e, t, a, v, c) {
  c.weights = c.weights.filter(function (w) {
    return w.d !== v;
  });
  ui.modal = null;
  change();
};
