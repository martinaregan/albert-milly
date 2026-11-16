/* 19-actions-settings: button actions for Connection, sync, backup, badge, cat photos. Each ACT["name"] runs when a data-a="name" button is tapped. */
ACT["backup"] = function (e, t, a, v, c) {
  backup();
};

ACT["badgeon"] = function (e, t, a, v, c) {
  if (window.Notification && Notification.requestPermission)
    Notification.requestPermission().then(function (p) {
      saveState = p === "granted" ? "Badge on" : "Badge needs notification permission";
      badge();
      render();
    });
  else {
    saveState = "Not supported here";
    render();
  }
};

ACT["rmphoto"] = function (e, t, a, v, c) {
  delete S.cats[v].photo;
  change();
};

ACT["ghwho"] = function (e, t, a, v, c) {
  ui.who = v;
  var tk = document.getElementById("ghtok").value;
  render();
  document.getElementById("ghtok").value = tk;
};

ACT["ghconnect"] = function (e, t, a, v, c) {
  var tok = document.getElementById("ghtok").value.trim(),
    rp = ((document.getElementById("ghrepo") || {}).value || "").trim().split("/");
  if (!tok) {
    ui.gherr = "Paste your access key first.";
    render();
    return;
  }
  if (rp.length !== 2 || !rp[0] || !rp[1]) {
    ui.gherr = "Fill in your data repository as owner/name.";
    render();
    return;
  }
  var cand = {
    token: tok,
    owner: rp[0],
    repo: rp[1],
    who: ((document.getElementById("ghname") || {}).value || ui.who || "").trim() || "Me"
  };
  var keep = GH;
  GH = cand;
  document.getElementById("gherr").textContent = "Connecting…";
  pull()
    .then(function (p) {
      try {
        localStorage.setItem(LS + "-gh", JSON.stringify(GH));
      } catch (e) {}
      ui.gherr = "";
      INVITE = null;
      S = null;
      BASE = null;
      SHA = null;
      dirty = false;
      if (p) {
        S = p.data;
        migrate();
        BASE = p.data;
        SHA = p.sha;
        dirty = !eq(S, BASE);
        persist();
      }
      setStatus("Synced");
      if (!p) return starter();
      render();
      if (dirty) push();
    })
    .catch(function (e) {
      GH = keep;
      ui.gherr = keyErr(e);
      render();
    });
};

ACT["syncnow"] = function (e, t, a, v, c) {
  setStatus("Syncing…");
  sync().then(function () {
    if (dirty) push();
  });
};

ACT["ghout"] = function (e, t, a, v, c) {
  ui.modal = function () {
    return confirmBox(
      "Disconnect this phone? Your data stays safe in GitHub; you'll need the access key to reconnect.",
      "ghout2",
      "x"
    );
  };
  render();
};

ACT["ghout2"] = function (e, t, a, v, c) {
  if (DEMO) return ACT.demoexit();
  try {
    localStorage.removeItem(LS + "-gh");
    localStorage.removeItem(LS + "-cache");
  } catch (e) {}
  GH = null;
  S = null;
  ui.modal = null;
  render();
};

ACT["demo"] = function () {
  location.href = location.pathname + "?demo";
};

ACT["demoexit"] = function () {
  location.href = location.pathname;
};

// Setup link + QR code so someone else can connect without typing the access key.
function inviteLink() {
  return (
    location.origin +
    location.pathname +
    "#k=" +
    encodeURIComponent(GH.token) +
    "&r=" +
    encodeURIComponent(GH.owner + "/" + GH.repo)
  );
}

function loadQR() {
  if (window.qrcode) return Promise.resolve();
  return new Promise(function (ok, no) {
    var sc = document.createElement("script");
    sc.src = "vendor/qrcode.min.js";
    sc.onload = ok;
    sc.onerror = no;
    document.head.appendChild(sc);
  });
}

ACT["qrshow"] = function () {
  loadQR().then(
    function () {
      var q = qrcode(0, "M");
      q.addData(inviteLink());
      q.make();
      var svg = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
      ui.modal = function () {
        return (
          '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2>Add another phone</h2>' +
          '<div class="qr">' +
          svg +
          "</div>" +
          '<div class="note">Scan this with the other phone\'s camera, then add the app to its home screen. ' +
          "<b>The code contains your access key</b>, so only show it to people you'd trust with all the data, and don't screenshot or send it.</div>" +
          '<div class="row u-mt10"><button class="b s" data-a="qrcopy">Copy link instead</button><button class="b s ghost" data-a="close">Done</button></div></div></div>'
        );
      };
      render();
    },
    function () {
      toast("Couldn't load the QR code. Check your connection");
    }
  );
};

ACT["qrcopy"] = function () {
  var l = inviteLink();
  (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(
    function () {
      toast("Link copied. Paste it into Safari on the other phone");
    },
    function () {
      prompt("Copy this link", l);
    }
  );
};

// Coat / look: data-v is "field|value". "p|orig" goes back to the original drawing.
ACT["coatset"] = function (e, t, a, v, c) {
  var p = v.split("|"),
    cc = cat();
  if (p[0] === "p" && p[1] === "orig") delete cc.coat;
  else {
    cc.coat = cc.coat || { p: "solid", a: "#8d9198", e: "#8fbf5a" };
    cc.coat[p[0]] = p[1];
    if (p[0] === "p" && /^(tabby|tortie|calico|point)$/.test(p[1]) && !cc.coat.b)
      cc.coat.b = p[1] === "tortie" || p[1] === "calico" ? "#e8822f" : "#4a3628";
    if (p[0] !== "t") delete cc.coat.breed;
  }
  change();
};

ACT["coatphoto"] = function () {
  var i = document.getElementById("coatIn");
  if (i) i.click();
};

// Tap on the photo: average a small square of pixels under the finger.
ACT["pktap"] = function (e, t) {
  // The photo is letterboxed (object-fit: contain), so work out where it really sits.
  var r = t.getBoundingClientRect(),
    sc = Math.min(r.width / t.naturalWidth, r.height / t.naturalHeight),
    ox = r.left + (r.width - t.naturalWidth * sc) / 2,
    oy = r.top + (r.height - t.naturalHeight * sc) / 2,
    x = (e.clientX - ox) / sc,
    y = (e.clientY - oy) / sc;
  if (x < 0 || y < 0 || x > t.naturalWidth || y > t.naturalHeight) return;
  var
    s = Math.max(4, Math.round(t.naturalWidth / 60)),
    cv = document.createElement("canvas");
  cv.width = cv.height = s;
  var cx = cv.getContext("2d");
  cx.drawImage(t, x - s / 2, y - s / 2, s, s, 0, 0, s, s);
  var d = cx.getImageData(0, 0, s, s).data,
    m = [0, 0, 0],
    n = 0;
  for (var i = 0; i < d.length; i += 4) {
    m[0] += d[i];
    m[1] += d[i + 1];
    m[2] += d[i + 2];
    n++;
  }
  m = m.map(function (q) {
    return q / n;
  });
  // Photos indoors are usually dim: lift mid-tone fur so ginger looks ginger, but leave black black.
  var mx = Math.max(m[0], m[1], m[2]),
    f = mx > 45 && mx < 225 ? Math.min(1.6, 225 / mx) : 1;
  ui.pick.cols.push(
    hexOf.apply(
      null,
      m.map(function (q) {
        return Math.min(255, Math.round(q * f));
      })
    )
  );
  if (ui.pick.cols.length >= 2) return ACT.pkdone();
  render();
};

ACT["pkundo"] = function () {
  ui.pick.cols.pop();
  render();
};

ACT["pkdone"] = function () {
  var pk = ui.pick,
    g = guessCoat(pk.cols),
    cc = S.cats[pk.k],
    old = cc.coat || {};
  cc.coat = { p: g.p, a: g.a, b: g.b || "", e: old.e || "#8fbf5a" };
  if (old.t) cc.coat.t = old.t;
  URL.revokeObjectURL(pk.url);
  ui.pick = null;
  ui.modal = null;
  change();
  toast("Done. Check the pattern and eye colour below");
};
