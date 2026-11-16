/* 19-actions-stock: button actions for Stock, shopping and foods. Each ACT["name"] runs when a data-a="name" button is tapped. */
ACT["xundo"] = function (e, t, a, v, c) {
  var xu = S.extraStock[+v];
  if (xu && xu.prev) {
    xu.qty = xu.prev.qty;
    xu.on = xu.prev.on;
    xu.need = xu.prev.need;
    delete xu.prev;
    change();
  }
};

ACT["xbought"] = function (e, t, a, v, c) {
  var xb = S.extraStock[+v];
  if (xb) {
    xb.prev = { qty: xb.qty, on: xb.on, need: !!xb.need, at: today() };
    xb.need = false;
    if (!xb.check && (+xb.qty || 0) <= 0) {
      xb.qty = 1;
      xb.on = today();
    }
    change();
  }
};

ACT["xneed"] = function (e, t, a, v, c) {
  var xs = S.extraStock[+v];
  if (xs) {
    xs.need = !xs.need;
    change();
  }
};

ACT["addfood2"] = function (e, t, a, v, c) {
  ui.cat = t.dataset.k;
  S.cats[ui.cat].foods.push({ id: uid(), name: "New food", kind: "dry", kcal: 370 });
  change();
  ui.tab = "settings";
  ui.modal = null;
  render();
  var fc = document.getElementById("foodscard");
  if (fc) {
    var ins = fc.querySelectorAll("input[data-fk=name]");
    fc.scrollIntoView();
    var li = ins[ins.length - 1];
    if (li) {
      li.select && li.select();
    }
  }
};

ACT["addfood"] = function (e, t, a, v, c) {
  c.foods.push({ id: uid(), name: "New food", kind: "dry", kcal: 370 });
  change();
};

ACT["delfood"] = function (e, t, a, v, c) {
  if (c.foods.length > 1) {
    c.foods.splice(+v, 1);
    change();
  }
};

ACT["gobuy"] = function (e, t, a, v, c) {
  var bs = document.getElementById("buysoon");
  if (bs) {
    bs.scrollIntoView({ behavior: "smooth", block: "start" });
    bs.style.transition = "box-shadow .3s";
    bs.style.boxShadow = "0 0 0 3px var(--bad)";
    setTimeout(function () {
      bs.style.boxShadow = "";
    }, 1500);
  }
};

ACT["restock"] = function (e, t, a, v, c) {
  var rp = v.split("|");
  ui.rs = { k: rp[0], id: rp[1] };
  ui.modal = restockSheet;
  render();
};

ACT["rsq"] = function (e, t, a, v, c) {
  document.getElementById("rsamt").value = v;
};

ACT["rssave"] = function (e, t, a, v, c) {
  var add = parseFloat(String(document.getElementById("rsamt").value).replace(",", "."));
  if (isNaN(add) || add <= 0) {
    flash("rsamt");
    return;
  }
  var ff = S.cats[ui.rs.k].foods.filter(function (x) {
      return x.id === ui.rs.id;
    })[0],
    cur = stockOf(ui.rs.k, ff);
  setStock(ui.rs.k, ui.rs.id, (cur ? cur.rem : 0) + add);
  var pr = parseFloat(String(document.getElementById("rsprice").value).replace(",", "."));
  if (!isNaN(pr) && pr > 0)
    S.costs.push({
      id: uid(),
      d: today(),
      who: ui.rs.k,
      cat: "Food",
      amount: pr,
      reimb: 0,
      desc:
        ff.name + (ff.kind === "dry" ? " " + (add >= 1000 ? add / 1000 + " kg" : add + " g") : " ×" + add),
      n: ""
    });
  ui.modal = null;
  change();
};
