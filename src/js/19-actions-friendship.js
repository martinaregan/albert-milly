/* 19-actions-friendship: button actions for Fights, calm moments, bedtime routine. Each ACT["name"] runs when a data-a="name" button is tapped. */
ACT["cmback"] = function (e, t, a, v, c) {
  ui.cm.step--;
  render();
};

ACT["cmgo"] = function (e, t, a, v, c) {
  ui.cm.step = +v;
  render();
};

ACT["qcat"] = function (e, t, a, v, c) {
  ui.qcat = v;
  ui.cat = v;
  render();
};

ACT["bedok"] = function (e, t, a, v, c) {
  S.bed = S.bed || {};
  S.bed[nightOf()] = nowHM();
  change();
  celebrate();
  toast("Bedtime routine done", function () {
    delete S.bed[nightOf()];
    change();
  });
};

ACT["fnew"] = function (e, t, a, v, c) {
  ui.pend = [];
  ui.pendFor = "fight";
  var lastF = S.fights.slice().sort(function (a, b) {
    return a.d + a.m < b.d + b.m ? 1 : -1;
  })[0];
  ui.f = {
    d: today(),
    m: new Date().toTimeString().slice(0, 5),
    sev: "",
    trig: [],
    where: "",
    who: "",
    sep: "",
    pher: lastF && lastF.pher ? lastF.pher : "",
    n: "",
    step: 0
  };
  ui.modal = fightSheet;
  render();
};

ACT["fc"] = function (e, t, a, v, c) {
  var key = t.dataset.k,
    wz = ui.f.step != null && !ui.f.id;
  if (key === "trig") {
    var ix = ui.f.trig.indexOf(v);
    if (ix >= 0) ui.f.trig.splice(ix, 1);
    else ui.f.trig.push(v);
  } else ui.f[key] = wz ? v : ui.f[key] === v ? "" : v;
  if (wz && key !== "trig") ui.f.step++;
  render();
};

ACT["fnext"] = function (e, t, a, v, c) {
  ui.f.step++;
  render();
};

ACT["fback"] = function (e, t, a, v, c) {
  ui.f.step--;
  render();
};

ACT["fgo"] = function (e, t, a, v, c) {
  ui.f.step = +v;
  render();
};

ACT["fedit"] = function (e, t, a, v, c) {
  var fo = S.fights.filter(function (x) {
    return x.id === v;
  })[0];
  ui.f = JSON.parse(JSON.stringify(fo));
  ui.f.trig = ui.f.trig || [];
  ui.f.n = ui.f.n || "";
  ui.pend = ui.f.att || [];
  ui.pendFor = "fight";
  ui.modal = fightSheet;
  render();
};

ACT["fsave"] = function (e, t, a, v, c) {
  var f = ui.f;
  if (f.id)
    S.fights = S.fights.filter(function (x) {
      return x.id !== f.id;
    });
  S.fights.push({
    id: f.id || uid(),
    by: f.by || whoAmI(),
    d: f.d || today(),
    m: f.m,
    sev: f.sev,
    trig: f.trig,
    where: f.where,
    who: f.who,
    sep: f.sep,
    pher: f.pher,
    n: (f.n || "").trim(),
    att: ui.pend
  });
  ui.pend = [];
  ui.pendFor = null;
  ui.modal = null;
  ui.f = null;
  change();
};

ACT["delf"] = function (e, t, a, v, c) {
  ui.modal = function () {
    return confirmBox("Delete this fight entry?", "delf2", v);
  };
  render();
};

ACT["delf2"] = function (e, t, a, v, c) {
  S.fights = S.fights.filter(function (x) {
    return x.id !== v;
  });
  ui.modal = null;
  change();
};

ACT["calmnew"] = function (e, t, a, v, c) {
  ui.pend = [];
  ui.pendFor = "calm";
  ui.cm = { step: 0, d: today(), m: new Date().toTimeString().slice(0, 5), what: "", n: "" };
  ui.modal = calmSheet;
  render();
};

ACT["cmx"] = function (e, t, a, v, c) {
  ui.cm.what = v;
  if (ui.cm.step != null && ui.cm.step === 0) ui.cm.step++;
  render();
};

ACT["cmsave"] = function (e, t, a, v, c) {
  var cm = ui.cm;
  S.calm.push({
    id: uid(),
    by: whoAmI(),
    d: cm.d || today(),
    m: cm.m,
    what: cm.what,
    n: (cm.n || "").trim(),
    att: ui.pend || []
  });
  ui.cm = null;
  ui.modal = null;
  change();
  celebrate();
};
