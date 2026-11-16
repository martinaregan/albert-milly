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
