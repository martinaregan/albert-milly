/* 19-actions-photos: button actions for Photos and files: pick, view, delete. Each ACT["name"] runs when a data-a="name" button is tapped. */
ACT["phdel"] = function (e, t, a, v, c) {
  ui.phd = { k: t.dataset.k, v: v };
  ui.phPrev = ui.modal || null;
  ui.modal = function () {
    return '<div class="modal" data-a="phcancel"><div class="sheet" data-stop="2"><p style="font-weight:800;font-size:17px">Remove this photo or file?</p><div class="row"><button class="b" style="background:var(--bad);color:#fff" data-a="phdel2">Remove</button><button class="b" data-a="phcancel">Keep it</button></div></div></div>';
  };
  render();
};

ACT["phcancel"] = function (e, t, a, v, c) {
  ui.modal = ui.phPrev;
  ui.phPrev = null;
  ui.phd = null;
  render();
};

ACT["phdel2"] = function (e, t, a, v, c) {
  var P = ui.phd,
    keep = function (arr) {
      return (arr || []).filter(function (x) {
        return (x.path || x.id) !== P.v;
      });
    };
  if (P.k === "day") {
    var dd = day();
    dd.photos = keep(dd.photos);
  } else if (P.k === "pend") ui.pend = keep(ui.pend);
  else if (P.k === "v") ui.v.att = keep(ui.v.att);
  else if (P.k === "b") ui.b.att = keep(ui.b.att);
  else if (P.k.indexOf("info-") === 0) {
    var sc = P.k.slice(5);
    S.info[sc].att = keep(S.info[sc].att);
  }
  ui.modal = ui.phPrev;
  ui.phPrev = null;
  ui.phd = null;
  if (P.k === "day" || P.k.indexOf("info-") === 0) change();
  else render();
};

ACT["copy"] = function (e, t, a, v, c) {
  var txt = vetText();
  (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
    .then(function () {
      t.textContent = "Copied ✓";
    })
    .catch(function () {
      var ta = document.getElementById("vt");
      ta.focus();
      ta.select();
      t.textContent = "Selected, use Copy";
    });
};

ACT["view"] = function (e, t, a, v, c) {
  var isV = t.dataset.k === "video";
  ui.vprev = ui.modal || null;
  ui.modal = function () {
    return (
      '<div class="modal pview" data-a="vclose"><div class="sheet viewer" data-stop="2">' +
      (isV
        ? '<video data-phv="' + esc(v) + '" controls playsinline autoplay></video>'
        : '<img data-ph="' + esc(v) + '" alt="">') +
      '<button class="b w" style="margin-top:12px" data-a="vclose">Close</button></div></div>'
    );
  };
  render();
};

ACT["vclose"] = function (e, t, a, v, c) {
  ui.modal = ui.vprev || null;
  ui.vprev = null;
  render();
};

ACT["pick"] = function (e, t, a, v, c) {
  upTarget = { kind: t.dataset.k, ref: t.dataset.v };
  var fi = document.getElementById("fileIn");
  fi.accept = t.dataset.acc || "image/*";
  fi.multiple = !t.dataset.cap;
  if (t.dataset.cap) fi.setAttribute("capture", "environment");
  else fi.removeAttribute("capture");
  fi.value = "";
  fi.click();
};
