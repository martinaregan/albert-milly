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
    rv = ((document.getElementById("ghrepo") || {}).value || "").trim().replace(/^https?:\/\/github\.com\//, ""),
    who = ((document.getElementById("ghname") || {}).value || ui.who || "").trim() || "Me",
    err = function (m) {
      ui.gherr = m;
      ui.ghform = { tok: tok, who: who, repo: rv };
      render();
    },
    hd = { Authorization: "Bearer " + tok, Accept: "application/vnd.github+json" },
    login = "";
  if (!tok) return err("Paste your access key first.");
  if (/^ghp_/.test(tok) === false && /^github_pat_|^gh[ousr]_/.test(tok) === false)
    return err("That doesn't look like an access key. It should start with github_pat_.");
  document.getElementById("gherr").textContent = "Checking…";
  // 1. Is the key valid, and whose account is it?
  fetch("https://api.github.com/user", { headers: hd, cache: "no-store" })
    .then(function (r) {
      if (r.status === 401) throw "That key didn't work: it's wrong, expired or was deleted. Make a new one with step 3.";
      if (!r.ok) throw "Could not reach GitHub. Check your internet connection.";
      return r.json();
    })
    .then(function (u) {
      login = u.login || "";
      var rp = (rv || "cat-data").split("/");
      if (rp.length === 1) rp = [login, rp[0]];
      if (!rp[0] || !rp[1]) throw "Fill in the repository name (like cat-data).";
      // 2. Can it see the repository, and is it private?
      return fetch("https://api.github.com/repos/" + rp[0] + "/" + rp[1], { headers: hd, cache: "no-store" }).then(
        function (r) {
          if (r.status === 404)
            throw (
              "Can't see the repository " +
              rp.join("/") +
              ". Check the name, and that the key has it under Repository access → Only select repositories."
            );
          if (!r.ok) throw "Could not reach GitHub. Check your internet connection.";
          return r.json().then(function (j) {
            if (j.private === false)
              throw "That repository is public, so anyone could read your cats' data. On GitHub open it › Settings › Danger zone › Change visibility › Private, then try again.";
            return rp;
          });
        }
      );
    })
    .then(function (rp) {
      var keep = GH,
        wasLocal = GH && GH.local && S;
      GH = { token: tok, owner: rp[0], repo: rp[1], who: who };
      // 3. Read the data (or find there isn't any yet).
      return pull().then(
        function (p) {
          try {
            localStorage.setItem(LS + "-gh", JSON.stringify(GH));
          } catch (x) {}
          ui.gherr = "";
          ui.ghform = null;
          ui.connect = false;
          INVITE = null;
          var local = wasLocal ? S : null,
            hasLogs =
              local &&
              ["albert", "milly"].some(function (k) {
                return local.cats[k].weights.length || Object.keys(local.cats[k].days || {}).length;
              });
          if (p) {
            // Data already there: it wins, and anything logged on this phone is added to it.
            S = hasLogs ? merge3({}, p.data, local) : p.data;
            migrate();
            BASE = p.data;
            SHA = p.sha;
            dirty = !eq(S, BASE);
          } else if (local) {
            // New repository: move this phone's data up.
            BASE = null;
            SHA = null;
            dirty = true;
          } else {
            S = null;
            return starter();
          }
          persist();
          setStatus(dirty ? "Saving…" : "Synced");
          render();
          if (dirty) push();
          toast(wasLocal ? "Connected. Your data is now on GitHub too" : "Connected");
        },
        function (x) {
          GH = keep;
          throw x && x.auth ? "The key can't read the data. Give it Contents: Read and write (step 3)." : keyErr(x);
        }
      );
    })
    .catch(function (m) {
      err(typeof m === "string" ? m : "Something went wrong. Try again.");
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

// No-account mode: data stays on this phone until GitHub is connected.
ACT["startLocal"] = function () {
  var nm = ((document.getElementById("lname") || {}).value || "").trim() || "Me";
  GH = { local: true, who: nm };
  try {
    localStorage.setItem(LS + "-lastbackup", String(Date.now()));
    localStorage.setItem(LS + "-gh", JSON.stringify(GH));
  } catch (x) {}
  S = null;
  sync();
};

ACT["connGh"] = function () {
  ui.connect = true;
  ui.gherr = "";
  render();
  window.scrollTo(0, 0);
};

ACT["connBack"] = function () {
  ui.connect = false;
  ui.gherr = "";
  render();
};

// Restore from a backup file
ACT["restore"] = function () {
  var i = document.getElementById("restoreIn");
  if (i) i.click();
};

ACT["restore2"] = function () {
  if (!ui.restore) return;
  S = ui.restore;
  ui.restore = null;
  migrate();
  ui.modal = null;
  change();
  toast("Backup restored");
};

ACT["erase"] = function () {
  ui.modal = function () {
    return confirmBox(
      "Erase all of the cats' data on this phone? It can't be undone. Download a backup first if you might want it.",
      "erase2",
      "x"
    );
  };
  render();
};

ACT["erase2"] = function () {
  try {
    Object.keys(localStorage).forEach(function (k) {
      if (k.indexOf(LS) === 0) localStorage.removeItem(k);
    });
  } catch (x) {}
  GH = null;
  S = null;
  ui.modal = null;
  render();
};

ACT["tabtog"] = function (e, t, a, v) {
  S.tabsOff = S.tabsOff || [];
  var i = S.tabsOff.indexOf(v);
  if (i >= 0) S.tabsOff.splice(i, 1);
  else S.tabsOff.push(v);
  change();
};

ACT["unitset"] = function (e, t, a, v) {
  try {
    localStorage.setItem(LS + "-unit", v);
  } catch (x) {}
  render();
};
