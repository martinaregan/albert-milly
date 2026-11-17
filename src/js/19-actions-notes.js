/* 19-actions-notes: Notes, reminders and notifications. */
ACT["noteNew"] = function () {
  var other = people().filter(function (n) {
    return n !== myName();
  });
  ui.nf = { text: "", to: other.length ? other.slice(0, 1) : [myName()], later: false, at: "" };
  ui.modal = noteSheet;
  render();
};

function keepNoteText() {
  var t = document.getElementById("ntext"),
    a = document.getElementById("nat");
  if (t) ui.nf.text = t.value;
  if (a) ui.nf.at = a.value;
}

ACT["noteTo"] = function (e, t, a, v) {
  keepNoteText();
  var i = ui.nf.to.indexOf(v);
  if (i >= 0) ui.nf.to.splice(i, 1);
  else ui.nf.to.push(v);
  render();
};

ACT["noteWhen"] = function (e, t, a, v) {
  keepNoteText();
  ui.nf.later = v === "1";
  if (ui.nf.later && !ui.nf.at) {
    var d = new Date(Date.now() + 36e5);
    d.setMinutes(0);
    ui.nf.at = iso(d) + "T" + ("0" + d.getHours()).slice(-2) + ":00";
  }
  render();
};

// Edit a note you wrote: same sheet, filled in. Changing the time or who it's for sends it again.
ACT["noteEdit"] = function (e, t, a, v) {
  var m = (S.msgs || []).filter(function (x) {
    return x.id === v;
  })[0];
  if (!m || m.from !== myName() || m.done) return;
  var at = "";
  if (m.at) {
    var d = new Date(m.at);
    at = iso(d) + "T" + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  }
  ui.nf = { id: m.id, text: m.text, to: (m.to || []).slice(), later: !!m.at, at: at };
  ui.modal = noteSheet;
  render();
};

ACT["noteSend"] = function () {
  keepNoteText();
  var f = ui.nf,
    txt = (f.text || "").trim();
  if (!txt) return toast("Write the note first");
  if (!f.to.length) return toast("Pick who it's for");
  var at = 0;
  if (f.later) {
    at = new Date(f.at).getTime();
    if (!at || isNaN(at)) return toast("Pick a time");
  }
  S.msgs = S.msgs || [];
  if (f.id) {
    var m = S.msgs.filter(function (x) {
      return x.id === f.id;
    })[0];
    if (!m) return;
    var added = f.to.some(function (n) {
        return (m.to || []).indexOf(n) < 0;
      }),
      moved = at !== (m.at || 0);
    if (txt === m.text && !added && !moved && f.to.length === (m.to || []).length) {
      ui.modal = null;
      return render();
    }
    m.text = txt;
    m.to = f.to.slice();
    m.at = at;
    m.edited = Date.now();
    // New time or a new person: let it go out again (the time is in the future, or it's for someone new).
    if (m.sent && (added || (moved && at > Date.now()))) {
      delete m.sent;
      notifyNext = true;
    }
    if (!m.sent) notifyNext = true;
    ui.modal = null;
    change();
    return toast(moved && at ? "Reminder moved to " + whenText(at) : "Saved");
  }
  S.msgs.push({ id: uid(), from: myName(), to: f.to.slice(), text: txt, at: at, created: Date.now(), done: false });
  ui.modal = null;
  notifyNext = true;
  change();
  toast(f.later ? "Reminder set for " + whenText(at) : "Sent");
};

ACT["noteDone"] = function (e, t, a, v) {
  var m = (S.msgs || []).filter(function (x) {
    return x.id === v;
  })[0];
  if (!m) return;
  m.done = true;
  m.doneBy = myName();
  m.doneAt = Date.now();
  if (m.from !== myName()) notifyNext = true;
  change();
};

ACT["noteDel"] = function (e, t, a, v) {
  S.msgs = (S.msgs || []).filter(function (x) {
    return x.id !== v;
  });
  change();
};

ACT["pushOn"] = function () {
  Notification.requestPermission()
    .then(function (p) {
      if (p !== "granted") throw "denied";
      return navigator.serviceWorker.ready;
    })
    .then(function (reg) {
      return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(S.pushPub) });
    })
    .then(function (sub) {
      var j = JSON.parse(JSON.stringify(sub)),
        me = myName(),
        id = "p" + j.endpoint.split("/").pop().slice(-16);
      j.id = id;
      S.push = S.push || {};
      S.push[me] = (S.push[me] || []).filter(function (s) {
        return s.endpoint !== j.endpoint;
      });
      S.push[me].push(j);
      try {
        localStorage.setItem(LS + "-pushid", id);
      } catch (x) {}
      change();
      toast("Notifications on");
    })
    .catch(function (x) {
      toast(x === "denied" ? "Notifications are blocked. Allow them in the iPhone Settings › Notifications" : "Couldn't turn them on");
    });
};

ACT["pushOff"] = function () {
  var id = localStorage.getItem(LS + "-pushid"),
    me = myName();
  S.push[me] = (S.push[me] || []).filter(function (s) {
    return s.id !== id;
  });
  navigator.serviceWorker.ready
    .then(function (reg) {
      return reg.pushManager.getSubscription();
    })
    .then(function (s) {
      if (s) s.unsubscribe();
    })
    .catch(function () {});
  change();
};
