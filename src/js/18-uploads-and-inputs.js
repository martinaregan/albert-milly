/* 18-uploads-and-inputs: File uploads and typing in forms. */
  var upTarget = null;

  function shrink(file) {
    return new Promise(function (res) {
      if (!/^image\/(jpeg|png|heic|heif|webp)/.test(file.type)) {
        res(file);
        return;
      }
      var img = new Image(),
        url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, 1800 / Math.max(img.width, img.height));
        if (s === 1 && file.size < 1.5e6) {
          res(file);
          return;
        }
        var cv = document.createElement("canvas");
        cv.width = Math.round(img.width * s);
        cv.height = Math.round(img.height * s);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        cv.toBlob(
          function (b) {
            URL.revokeObjectURL(url);
            res(b || file);
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = function () {
        res(file);
      };
      img.src = url;
    });
  }

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.id === "fileIn") {
      var files = Array.prototype.slice.call(t.files || []);
      if (!files.length || !GH) return;
      if (DEMO) return toast("Photos don't upload in the demo");
      var tg = upTarget;
      saveState = "Uploading…";
      render();
      Promise.all(
        files.map(function (f) {
          return shrink(f).then(function (b) {
            return ghUpload(b, f.name);
          });
        })
      )
        .then(function (list) {
          if (tg.kind === "day") {
            day().photos = day().photos.concat(list);
            change();
          } else if (tg.kind === "vet") {
            ui.v.att = ui.v.att.concat(list);
            saveState = "Uploaded, tap Save";
            render();
          } else if (tg.kind === "book") {
            ui.b.att = ui.b.att.concat(list);
            saveState = "Uploaded, tap Save";
            render();
          } else if (tg.kind === "catphoto") {
            S.cats[tg.ref].photo = list[0].thumb || list[0].path;
            change();
          } else if (tg.kind === "info") {
            S.info[tg.ref].att = S.info[tg.ref].att.concat(list);
            change();
          } else {
            ui.pend = ui.pend.concat(list);
            ui.pendFor = tg.ref;
            saveState = "Uploaded, tap Save";
            render();
          }
        })
        .catch(function (err) {
          saveState = "Upload failed, try again";
          render();
        });
      return;
    }
    if (t.dataset.hf) {
      ui.hf = ui.hf || {};
      ui.hf[t.dataset.hf] = t.value;
      return;
    }
    if (t.dataset.w) {
      if (ui.w) {
        ui.w[t.dataset.w] = t.value;
        wcalc();
      }
      return;
    }
    if (t.dataset.lf) {
      if (ui.l) ui.l[t.dataset.lf] = t.value;
      return;
    }
    if (t.dataset.cm) {
      return;
    }
    if (t.dataset.cs) {
      return;
    }
    if (t.dataset.tr) {
      return;
    }
    if (t.dataset.we) {
      if (ui.we) ui.we[t.dataset.we] = t.value;
      return;
    }
    if (t.dataset.bf) {
      if (ui.b) ui.b[t.dataset.bf] = t.value;
      return;
    }
    if (t.dataset.stock) {
      var sp = t.dataset.stock.split("|"),
        q = parseFloat(String(t.value).replace(",", "."));
      if (isNaN(q)) {
        delete S.stock[sp[1]];
      } else setStock(sp[0], sp[1], q);
      change();
      return;
    }
    if (t.dataset.xstock) {
      var xi = S.extraStock[+t.dataset.xstock],
        q2 = parseFloat(String(t.value).replace(",", "."));
      if (isNaN(q2)) {
        xi.qty = "";
      } else {
        xi.qty = q2;
        xi.on = today();
        xi.usedAtSet = 0;
        (xi.cat === "both" ? ["albert", "milly"] : [xi.cat || "albert"]).forEach(function (ck) {
          var dd0 = peek(S.cats[ck], today());
          if (xi.check && dd0 && dd0.checks && dd0.checks[xi.check]) xi.usedAtSet++;
        });
      }
      change();
      return;
    }
    if (t.dataset.prof) {
      S.profiles[t.dataset.prof] = t.value;
      change();
      return;
    }
    if (t.dataset.plan) {
      S.cats[t.dataset.plan].plan = t.value;
      change();
      return;
    }
    if (t.dataset.notes) {
      S.notes[t.dataset.notes] = t.value;
      change();
      return;
    }
    if (t.dataset.info) {
      var pp = t.dataset.info.split(".");
      S.info[pp[0]][pp[1]] = t.value.trim();
      change();
      return;
    }
    if (t.dataset.amt) {
      var n0 = parseFloat(String(t.value).replace(",", "."));
      if (isNaN(n0) || n0 < 0) n0 = 0;
      var dz = day();
      if (t.dataset.amt === "food") dz.f[t.dataset.k] = fmt(n0);
      else if (t.dataset.amt === "treat") dz.treats = Math.round(n0);
      else dz.play[S.playTypes[+t.dataset.k]] = Math.round(n0);
      change();
      return;
    }
    if (!S) return;
    var c = cat();
    if (t.dataset.a === "note") {
      day().note = t.value;
      change();
    } else if (t.dataset.s) {
      var k = t.dataset.s,
        v = t.value;
      if (k === "checks")
        c.checks = v
          .split("\n")
          .map(function (x) {
            return x.trim();
          })
          .filter(Boolean);
      else {
        var n = parseFloat(v.replace(",", "."));
        if (!isNaN(n) && n >= 0) c[k] = n;
      }
      change();
    } else if (t.dataset.pt) {
      S.playTypes = t.value
        .split("\n")
        .map(function (x) {
          return x.trim();
        })
        .filter(Boolean);
      change();
    } else if (t.dataset.fd != null) {
      var f = c.foods[+t.dataset.fd],
        fk = t.dataset.fk;
      if (fk === "kcal") {
        var q = parseFloat(t.value.replace(",", "."));
        if (!isNaN(q) && q > 0) f.kcal = q;
      } else if (fk === "name") {
        f.name = t.value.trim() || f.name;
      } else f.kind = t.value;
      change();
    }
  });

  function wcalc() {
    var W = ui.w;
    if (!W) return;
    var me = parseFloat(String(W.me).replace(",", "."));
    ["albert", "milly"].forEach(function (k) {
      var el = document.getElementById("res-" + k),
        cm = document.getElementById("cmp-" + k);
      if (!el) return;
      var tot = parseFloat(String(W[k]).replace(",", "."));
      if (isNaN(me) || isNaN(tot)) {
        el.textContent = "";
        cm.textContent = "";
        return;
      }
      var cw = tot - me;
      if (cw < 1 || cw > 20) {
        el.textContent = "Check numbers";
        el.style.color = "var(--bad)";
        cm.textContent = "";
        return;
      }
      el.style.color = "";
      el.textContent = "= " + cw.toFixed(2) + " kg";
      var prev = sorted(S.cats[k])
        .filter(function (x) {
          return x.d < W.d;
        })
        .pop();
      cm.textContent = prev
        ? (cw < prev.kg ? "Down " : cw > prev.kg ? "Up " : "Same as ") +
          (cw !== prev.kg ? Math.round(Math.abs(cw - prev.kg) * 1000) + " g since " : "") +
          short(prev.d) +
          " (" +
          prev.kg.toFixed(2) +
          " kg)"
        : "";
    });
  }

  document.addEventListener("focusout", function () {
    setTimeout(function () {
      if (needRender && !busy()) render();
    }, 50);
  });

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.dataset.sy && ui.sy) {
      ui.sy[t.dataset.sy] = t.value;
      return;
    }
    if (t.dataset.cm && ui.cm) {
      ui.cm[t.dataset.cm] = t.value;
      return;
    }
    if (t.dataset.cs && ui.cs) {
      ui.cs[t.dataset.cs] = t.value;
      return;
    }
    if (t.dataset.tr && ui.tr) {
      ui.tr[t.dataset.tr] = t.value;
      if (t.dataset.tr === "d" && TT[ui.tr.type].days && t.value) {
        ui.tr.next = addDays(t.value, TT[ui.tr.type].days);
        var nx = document.querySelector("[data-tr=next]");
        if (nx) nx.value = ui.tr.next;
      }
      return;
    }
    if (t.dataset.we && ui.we) {
      ui.we[t.dataset.we] = t.value;
      return;
    }
    if (t.dataset.lf && ui.l) {
      ui.l[t.dataset.lf] = t.value;
      return;
    }
    if (t.dataset.bf && ui.b) {
      ui.b[t.dataset.bf] = t.value;
      return;
    }
    if (t.dataset.w && ui.w) {
      ui.w[t.dataset.w] = t.value;
      wcalc();
      return;
    }
    if (t.dataset.ff && ui.f) ui.f[t.dataset.ff] = t.value;
    if (t.dataset.vf && ui.v) ui.v[t.dataset.vf] = t.value;
    if (t.dataset.hf) {
      ui.hf = ui.hf || {};
      ui.hf[t.dataset.hf] = t.value;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && ui.modal) {
      ui.modal = null;
      ui.f = null;
      render();
    }
  });

  document.addEventListener("input", function (e) {
    if (e.target && e.target.id === "qsrch") {
      ui.sq = e.target.value;
      var r = document.getElementById("qres");
      if (r) r.innerHTML = searchResults(ui.sq);
    }
  });
