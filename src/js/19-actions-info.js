/* 19-actions-info: button actions for Bookings. Each ACT["name"] runs when a data-a="name" button is tapped. */
ACT["bnew"] = function (e, t, a, v, c) {
  ui.b = {
    isNew: true,
    id: uid(),
    cats: [S.cats.albert.name, S.cats.milly.name],
    from: "",
    to: "",
    place: "",
    cost: "",
    status: "",
    notes: "",
    att: []
  };
  ui.modal = bookSheet;
  render();
};

ACT["bedit"] = function (e, t, a, v, c) {
  var bk0 = S.info.bookings.filter(function (x) {
    return x.id === v;
  })[0];
  if (!bk0) return;
  ui.b = JSON.parse(JSON.stringify(bk0));
  if (!Array.isArray(ui.b.att)) ui.b.att = [];
  ui.modal = bookSheet;
  render();
};

ACT["bcat"] = function (e, t, a, v, c) {
  var bi = ui.b.cats.indexOf(v);
  if (bi >= 0) ui.b.cats.splice(bi, 1);
  else ui.b.cats.push(v);
  render();
};

ACT["bsave"] = function (e, t, a, v, c) {
  var bb = ui.b;
  if (!bb.from) {
    var fi2 = document.querySelector("[data-bf=from]");
    if (fi2) fi2.style.borderColor = "var(--bad)";
    return;
  }
  if (!bb.to) bb.to = bb.from;
  delete bb.isNew;
  S.info.bookings = S.info.bookings.filter(function (x) {
    return x.id !== bb.id;
  });
  S.info.bookings.push(bb);
  ui.b = null;
  ui.modal = null;
  change();
};

ACT["bdel"] = function (e, t, a, v, c) {
  ui.modal = function () {
    return confirmBox("Delete this booking?", "bdel2", v);
  };
  render();
};

ACT["bdel2"] = function (e, t, a, v, c) {
  S.info.bookings = S.info.bookings.filter(function (x) {
    return x.id !== v;
  });
  ui.modal = null;
  change();
};

ACT["sitter"] = function () {
  ui.modal = sitterSheet;
  render();
};
