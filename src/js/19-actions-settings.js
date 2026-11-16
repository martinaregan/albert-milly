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
    rp = (
      document.getElementById("ghrepo")
        ? document.getElementById("ghrepo").value
        : "martinaregan/albert-milly-data"
    )
      .trim()
      .split("/");
  if (!tok) {
    ui.gherr = "Paste your access key first.";
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
  try {
    localStorage.removeItem(LS + "-gh");
    localStorage.removeItem(LS + "-cache");
  } catch (e) {}
  GH = null;
  S = null;
  ui.modal = null;
  render();
};
