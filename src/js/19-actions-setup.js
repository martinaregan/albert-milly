/* 19-actions-setup: Buttons in the first-run setup. */
function swRead() {
  var k = swCat(),
    c = S.cats[k],
    st = SW_STEPS[ui.sw.step],
    $ = function (id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : "";
    },
    n = function (id) {
      var v = parseFloat($(id).replace(",", "."));
      return isNaN(v) ? null : v;
    };
  if (st === "name") {
    if (!$("swname")) return "Type a name";
    if (!renameCat(k, $("swname")) && $("swname") !== c.name) return "That name is taken";
    c.born = /^\d{4}-\d\d-\d\d$/.test($("swborn")) ? $("swborn") : "";
    c.bornGuess = !!(document.getElementById("swguess") || {}).checked;
  }
  if (st === "weight") {
    var now = n("swnow"),
      tg = n("swtarget");
    if (!now || now < 0.5 || now > 15) return "Fill in their weight in kg";
    c.target = tg && tg > 0.5 && tg < 15 ? tg : now;
    c.weights = c.weights.filter(function (w) {
      return w.d !== today();
    });
    c.weights.push({ d: today(), kg: now });
  }
  if (st === "food") {
    var px = k === "albert" ? "a-" : "m-";
    c.foods = c.foods.filter(function (f) {
      return !f.main;
    });
    if ($("swdry")) c.foods.push({ id: px + "dry", name: $("swdry"), kind: "dry", kcal: n("swdryk") || 370, main: true });
    if ($("swwet")) c.foods.push({ id: px + "wet", name: $("swwet"), kind: "wet", kcal: n("swwetk") || 70, main: true });
    c.wetAllowance = $("swwet") ? n("swwetn") || 1 : 0;
    if (!$("swdry")) c.dryAllowance = 0;
  }
  if (st === "amount") {
    var g = n("swg");
    if (g != null) c.dryAllowance = g;
    var dry = firstOf(c, "dry"),
      wet = firstOf(c, "wet");
    c.plan =
      (dry ? "Morning:\n- " + c.dryAllowance + " g " + dry.name + ", weighed\n" : "") +
      (wet ? "Evening:\n- " + c.wetAllowance + " × " + wet.name + "\n" : "") +
      "Rules:\n- No extra treats\n- Log each meal in the app";
    c.planFrom = today();
  }
  return "";
}

ACT["swGo"] = function () {
  ui.sw.intro = false;
  render();
};

ACT["swSkip"] = function () {
  delete S.fresh;
  ui.modal = null;
  ui.sw = null;
  change();
};

ACT["swNext"] = function () {
  var err = swRead();
  if (err) return toast(err);
  if (ui.sw.step < SW_STEPS.length - 1) ui.sw.step++;
  else if (ui.sw.cat === 0) {
    ui.sw.cat = 1;
    ui.sw.step = 0;
  } else {
    delete S.fresh;
    ui.modal = null;
    ui.sw = null;
    change();
    return toast("All set. Log their first breakfast from the + button");
  }
  ui.cat = swCat();
  change();
};

ACT["swBack"] = function () {
  if (ui.sw.step > 0) ui.sw.step--;
  else if (ui.sw.cat === 1) {
    ui.sw.cat = 0;
    ui.sw.step = SW_STEPS.length - 1;
  }
  ui.cat = swCat();
  render();
};
