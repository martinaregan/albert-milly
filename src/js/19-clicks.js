/* 19-clicks: one click handler: finds the tapped data-a="action" and runs ACT[action] (see the 19-actions-*.js files). Plus small shared helpers. */
document.addEventListener("click", function (e) {
  var t = e.target.closest("[data-a]");
  if (!t) return;
  if (t.classList.contains("modal") && e.target.closest("[data-stop]")) return;
  var a = t.dataset.a,
    v = t.dataset.v;
  if (S && t.dataset.cat && S.cats[t.dataset.cat]) ui.cat = t.dataset.cat;
  var c = S ? cat() : null;
  if (a === "view" || a === "pick") e.preventDefault();
  var fn = ACT[a];
  if (fn) fn(e, t, a, v, c);
});

function confirmBox(msg, act, v) {
  var lab =
    { ghout2: "Disconnect", cstop: "Stop", restore2: "Restore", erase2: "Erase" }[act] || "Delete";
  return (
    '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><p>' +
    esc(msg) +
    '</p><div class="row"><button class="b" style="background:var(--bad);color:#fff" data-a="' +
    act +
    '" data-v="' +
    v +
    '">' +
    lab +
    '</button><button class="b" data-a="close">Cancel</button></div></div></div>'
  );
}

function num(id) {
  var x = parseFloat(String(document.getElementById(id).value).replace(",", "."));
  return isNaN(x) ? null : x;
}

function flash(id) {
  var el = document.getElementById(id) || document.querySelector('[data-w="' + id + '"]');
  if (!el) return;
  el.style.borderColor = "var(--bad)";
  el.focus();
}
