/* 19-actions-health: button actions for Symptoms, breathing counter, vet questions, vet notes and summary, worming and flea. Each ACT["name"] runs when a data-a="name" button is tapped. */
ACT["hnew"] = function (e, t, a, v, c) {
  ui.pend = [];
  ui.pendFor = "health";
  ui.sy = { step: 0, cat: "", t: "", d: today(), m: new Date().toTimeString().slice(0, 5), n: "" };
  ui.modal = symWiz;
  render();
};

ACT["syx"] = function (e, t, a, v, c) {
  ui.sy[t.dataset.k] = v;
  ui.sy.step++;
  render();
};

ACT["syback"] = function (e, t, a, v, c) {
  ui.sy.step--;
  render();
};

ACT["sygo"] = function (e, t, a, v, c) {
  ui.sy.step = +v;
  render();
};

ACT["sysave"] = function (e, t, a, v, c) {
  var y = ui.sy;
  if (!y.cat || !y.t) return;
  S.cats[y.cat].health.push({
    id: uid(),
    t: y.t,
    d: y.d || today(),
    m: y.m,
    n: (y.n || "").trim(),
    att: ui.pend || []
  });
  ui.cat = y.cat;
  ui.pend = [];
  ui.pendFor = null;
  ui.sy = null;
  ui.modal = null;
  change();
};

ACT["qsym"] = function (e, t, a, v, c) {
  ui.tab = "health";
  ui.open = ui.open || {};
  ui.open.hform = true;
  render();
  var hf = document.getElementById("hform");
  if (hf) hf.scrollIntoView({ block: "start" });
};

ACT["vqadd"] = function (e, t, a, v, c) {
  var qi = document.getElementById("vq-" + ui.cat),
    qt = qi && qi.value.trim();
  if (!qt) {
    if (qi) qi.focus();
    return;
  }
  var cq = S.cats[ui.cat];
  cq.vq = cq.vq || [];
  cq.vq.push({ id: uid(), t: qt, d: today(), by: whoAmI() });
  change();
  toast("Added to " + cq.name + "'s vet questions");
};

ACT["vqdone"] = function (e, t, a, v, c) {
  var cq2 = S.cats[ui.cat];
  (cq2.vq || []).forEach(function (x) {
    if (x.id === v) x.done = !x.done;
  });
  change();
};

ACT["vqdel"] = function (e, t, a, v, c) {
  var cq3 = S.cats[ui.cat];
  cq3.vq = (cq3.vq || []).filter(function (x) {
    return x.id !== v;
  });
  change();
};

ACT["rrnew"] = function (e, t, a, v, c) {
  if (ui.rrT) clearInterval(ui.rrT);
  ui.rr = { k: ui.cat, taps: 0, start: 0, done: false };
  ui.modal = rrSheet;
  render();
};

ACT["rrtap"] = function (e, t, a, v, c) {
  var R = ui.rr;
  if (!R || R.done) return;
  if (!R.start) {
    R.start = Date.now();
    ui.rrT = setInterval(function () {
      var left = 30 - Math.floor((Date.now() - R.start) / 1000),
        el = document.getElementById("rrt");
      if (left <= 0) {
        clearInterval(ui.rrT);
        R.done = true;
        render();
        return;
      }
      if (el) el.textContent = left + "s left";
    }, 250);
  }
  R.taps++;
  var ce = document.getElementById("rrc");
  if (ce) ce.textContent = R.taps;
};

ACT["rrman"] = function (e, t, a, v, c) {
  var mv2 = parseInt((document.getElementById("rrman") || {}).value, 10);
  if (!(mv2 > 3 && mv2 < 150)) {
    flash("rrman");
    return;
  }
  if (ui.rrT) clearInterval(ui.rrT);
  ui.rr.taps = mv2 / 2;
  ui.rr.done = true;
  render();
};

ACT["rrx"] = function (e, t, a, v, c) {
  if (ui.rrT) clearInterval(ui.rrT);
  ui.rr = null;
  ui.modal = null;
  render();
};

ACT["rrsave"] = function (e, t, a, v, c) {
  var R2 = ui.rr,
    cr = S.cats[R2.k];
  cr.rr = cr.rr || [];
  cr.rr.push({ id: uid(), d: today(), m: nowHM(), bpm: Math.round(R2.taps * 2), by: whoAmI() });
  ui.rr = null;
  ui.modal = null;
  change();
  celebrate();
};

ACT["rrdel"] = function (e, t, a, v, c) {
  ["albert", "milly"].forEach(function (k) {
    var cr2 = S.cats[k];
    if (cr2.rr)
      cr2.rr = cr2.rr.filter(function (x) {
        return x.id !== v;
      });
  });
  change();
};

ACT["htab"] = function (e, t, a, v, c) {
  ui.htab = ui.htab || {};
  ui.htab[ui.cat] = v;
  render();
};

ACT["vrep"] = function (e, t, a, v, c) {
  ui.vrper = 30;
  ui.modal = vetReport;
  render();
};

ACT["vrper"] = function (e, t, a, v, c) {
  ui.vrper = +v;
  render();
};

ACT["vrprint"] = function (e, t, a, v, c) {
  window.print();
};

ACT["vrshare"] = function (e, t, a, v, c) {
  var tx2 = ui.vrtext || "";
  if (navigator.share) navigator.share({ title: v || "Vet summary", text: tx2 }).catch(function () {});
  else if (navigator.clipboard)
    navigator.clipboard.writeText(tx2).then(function () {
      alert("Copied");
    });
};

ACT["hedit"] = function (e, t, a, v, c) {
  var ho = c.health.filter(function (x) {
    return x.id === v;
  })[0];
  ui.hedit = v;
  ui.hf = { t: ho.t, d: ho.d, m: ho.m, n: ho.n };
  ui.pend = ho.att || [];
  ui.pendFor = "health";
  render();
  window.scrollTo(0, 0);
};

ACT["hcancel"] = function (e, t, a, v, c) {
  ui.hedit = null;
  ui.hf = {};
  ui.pend = [];
  ui.pendFor = null;
  render();
};

ACT["addh"] = function (e, t, a, v, c) {
  if (ui.hedit)
    c.health = c.health.filter(function (x) {
      return x.id !== ui.hedit;
    });
  c.health.push({
    id: ui.hedit || uid(),
    t: document.getElementById("ht").value,
    d: document.getElementById("hd").value || today(),
    m: document.getElementById("hm").value,
    n: document.getElementById("hn").value.trim(),
    att: ui.pendFor === "health" ? ui.pend : []
  });
  ui.pend = [];
  ui.pendFor = null;
  ui.hf = {};
  ui.hedit = null;
  change();
};

ACT["delh"] = function (e, t, a, v, c) {
  ui.modal = function () {
    return confirmBox("Delete this symptom entry?", "delh2", v);
  };
  render();
};

ACT["delh2"] = function (e, t, a, v, c) {
  c.health = c.health.filter(function (x) {
    return x.id !== v;
  });
  ui.modal = null;
  change();
};

ACT["vnew"] = function (e, t, a, v, c) {
  ui.v = {
    isNew: true,
    id: uid(),
    d: today(),
    clinic: "",
    reason: "",
    notes: "",
    next: "",
    email: "",
    att: []
  };
  ui.modal = vetSheet;
  render();
};

ACT["vedit"] = function (e, t, a, v, c) {
  var o = c.vet.filter(function (x) {
    return x.id === v;
  })[0];
  ui.v = JSON.parse(JSON.stringify(o));
  ui.modal = vetSheet;
  render();
};

ACT["vsave"] = function (e, t, a, v, c) {
  var vv = ui.v,
    isNew = vv.isNew;
  delete vv.isNew;
  c.vet = c.vet.filter(function (x) {
    return x.id !== vv.id;
  });
  c.vet.push(vv);
  ui.v = null;
  ui.modal = null;
  change();
};

ACT["vdel"] = function (e, t, a, v, c) {
  var id = ui.v.id;
  ui.modal = function () {
    return confirmBox("Delete this vet note and its files?", "vdel2", id);
  };
  render();
};

ACT["vdel2"] = function (e, t, a, v, c) {
  c.vet = c.vet.filter(function (x) {
    return x.id !== v;
  });
  ui.v = null;
  ui.modal = null;
  change();
};

ACT["vet"] = function (e, t, a, v, c) {
  ui.modal = function () {
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">Vet summary</h2><textarea id="vt" rows="12" readonly>' +
      esc(vetText()) +
      '</textarea><div class="row u-mt10"><button class="b p" data-a="copy">Copy</button><button class="b" data-a="close">Close</button></div></div></div>'
    );
  };
  render();
};

ACT["trnew"] = function (e, t, a, v, c) {
  var lt0 = lastTreat(c, v);
  ui.tr = {
    type: v,
    product: lt0 ? lt0.product : "",
    dose: lt0 ? lt0.dose : "",
    d: today(),
    next: TT[v].days ? addDays(today(), TT[v].days) : "",
    n: ""
  };
  ui.modal = treatSheet;
  render();
};

ACT["tredit"] = function (e, t, a, v, c) {
  ui.tr = JSON.parse(
    JSON.stringify(
      c.treat.filter(function (x) {
        return x.id === v;
      })[0]
    )
  );
  ui.modal = treatSheet;
  render();
};

ACT["trint"] = function (e, t, a, v, c) {
  if (ui.tr) {
    ui.tr.next = addDays(ui.tr.d || today(), +v);
    render();
  }
};

ACT["trsave"] = function (e, t, a, v, c) {
  var tr = ui.tr;
  if (tr.id)
    c.treat = c.treat.filter(function (x) {
      return x.id !== tr.id;
    });
  c.treat.push({
    id: tr.id || uid(),
    type: tr.type,
    product: (tr.product || "").trim(),
    dose: (tr.dose || "").trim(),
    d: tr.d || today(),
    next: tr.next || "",
    n: (tr.n || "").trim()
  });
  ui.tr = null;
  ui.modal = null;
  change();
};

ACT["trdel"] = function (e, t, a, v, c) {
  ui.modal = function () {
    return confirmBox("Delete this treatment?", "trdel2", v);
  };
  render();
};

ACT["trdel2"] = function (e, t, a, v, c) {
  c.treat = c.treat.filter(function (x) {
    return x.id !== v;
  });
  ui.modal = null;
  change();
};
