/* 19-actions-play: button actions for Play logging and the play timer. Each ACT["name"] runs when a data-a="name" button is tapped. */
ACT["plopen"] = function (e, t, a, v, c) {
  ui.pl = { type: "", min: 0 };
  ui.modal = playSheet;
  render();
};

ACT["plt"] = function (e, t, a, v, c) {
  ui.pl.type = v;
  render();
};

ACT["plm"] = function (e, t, a, v, c) {
  ui.pl.min = +v;
  render();
};

ACT["plsave"] = function (e, t, a, v, c) {
  var dp = day();
  dp.play[ui.pl.type] = (dp.play[ui.pl.type] || 0) + ui.pl.min;
  ui.modal = null;
  ui.pl = null;
  change();
};

ACT["plstart"] = function (e, t, a, v, c) {
  if (tGet()) {
    ui.modal = null;
    ui.pl = null;
    render();
    return;
  }
  tSet({ cat: ui.cat, type: ui.pl.type, start: Date.now(), dur: 0 });
  ui.modal = null;
  ui.pl = null;
  ui.open = ui.open || {};
  ui.open.tplayc = true;
  render();
};

ACT["pldel"] = function (e, t, a, v, c) {
  ui.modal = function () {
    return confirmBox("Remove today's " + v + " minutes?", "pldel2", esc(v));
  };
  render();
};

ACT["pldel2"] = function (e, t, a, v, c) {
  var dq = day();
  delete dq.play[v];
  ui.modal = null;
  change();
};

ACT["tnew"] = function (e, t, a, v, c) {
  if (tGet()) {
    return;
  }
  tSet({ cat: ui.cat, type: S.playTypes[+t.dataset.k], start: Date.now(), dur: 0 });
  render();
};

ACT["tstart"] = function (e, t, a, v, c) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    actx.resume();
  } catch (er) {}
  tSet({ cat: ui.cat, type: S.playTypes[ui.tk], start: Date.now(), dur: +v });
  ui.modal = null;
  render();
};

ACT["tstop"] = function (e, t, a, v, c) {
  var T = tGet();
  if (T) {
    var mins = Math.max(1, Math.round((Date.now() - T.start) / 60000));
    if (T.dur) mins = Math.min(mins, T.dur);
    tLog(T, mins);
  }
};

ACT["tcancel"] = function (e, t, a, v, c) {
  tSet(null);
  render();
};

ACT["tedit"] = function (e, t, a, v, c) {
  ui.edit = ui.edit || {};
  var ae = document.activeElement;
  if (ae && ae.blur) ae.blur();
  ui.edit[v] = !ui.edit[v];
  render();
};
