/* 19-actions-calendar: button actions for Calendar views and to-dos. Each ACT["name"] runs when a data-a="name" button is tapped. */
ACT["calview"] = function (e, t, a, v, c) {
  ui.calView = v;
  render();
  window.scrollTo(0, 0);
};

ACT["agall"] = function (e, t, a, v, c) {
  ui.agAll = !ui.agAll;
  render();
};

ACT["mon"] = function (e, t, a, v, c) {
  var p = parse(ui.month + "-01");
  p.setMonth(p.getMonth() + +v);
  ui.month = iso(p).slice(0, 7);
  render();
};

ACT["open"] = function (e, t, a, v, c) {
  ui.calSel = v;
  ui.open = ui.open || {};
  ui.open.daypan = true;
  render();
};

ACT["calwho"] = function (e, t, a, v, c) {
  ui.calWho = v;
  render();
};

ACT["tadd"] = function (e, t, a, v, c) {
  var tx = document.getElementById("tdtext").value.trim();
  if (!tx) {
    flash("tdtext");
    return;
  }
  S.todos.push({ id: uid(), text: tx, done: false, due: document.getElementById("tddue").value || "" });
  change();
};

ACT["tdone"] = function (e, t, a, v, c) {
  S.todos.forEach(function (x) {
    if (x.id === v) x.done = !x.done;
  });
  change();
};

ACT["tdel"] = function (e, t, a, v, c) {
  S.todos = S.todos.filter(function (x) {
    return x.id !== v;
  });
  change();
};
