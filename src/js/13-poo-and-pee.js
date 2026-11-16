/* 13-poo-and-pee: Poo and pee logging and summaries. */
  function bad(x) {
    return (
      (x.type === "Poo" &&
        (x.cons === "Mushy, no shape" || x.cons === "Liquid" || x.cons === "Hard pellets")) ||
      (x.extra || []).length > 0 ||
      x.smell === "Really bad"
    );
  }

  function litterLine(x) {
    return (
      '<div class="it swr" data-del="ldel2" data-id="' +
      x.id +
      '"><div class="row between"><b>' +
      (x.type === "Poo" ? "💩" : "💧") +
      " " +
      esc(x.type) +
      (x.cons ? " · " + esc(x.cons) : "") +
      (bad(x) ? " ⚠️" : "") +
      '</b><span class="mute small">' +
      esc(x.m || "") +
      '<button class="x" data-a="ledit" data-v="' +
      x.id +
      '">Edit</button><button class="x" data-a="ldel" data-v="' +
      x.id +
      '">✕</button></span></div><div class="small mute">' +
      esc(
        [
          x.amt ? "Amount: " + x.amt.toLowerCase() : "",
          x.smell ? "smell: " + x.smell.toLowerCase() : "",
          (x.extra || []).join(", "),
          x.n
        ]
          .filter(Boolean)
          .join(" · ")
      ) +
      "</div>" +
      (x.att && x.att.length ? thumbs(x.att) : "") +
      "</div>"
    );
  }

  function litterSheet() {
    var l = ui.l;
    if (l.id || l.step == null) return litterFull();
    var steps = ["who"].concat(l.type === "Poo" ? ["cons"] : []).concat(["amt", "smell", "extra", "done"]);
    if (l.step >= steps.length) l.step = steps.length - 1;
    if (l.step < 0) l.step = 0;
    var st = steps[l.step],
      nm = l.type === "Poo" ? "💩 poo" : "💧 pee";
    function big(list, key, multi) {
      return (
        '<div class="wizc">' +
        list
          .map(function (x) {
            var on = multi ? l[key].indexOf(x) >= 0 : l[key] === x;
            return (
              '<button class="wizb' +
              (on ? " on" : "") +
              '" data-a="lc" data-k="' +
              key +
              '" data-v="' +
              esc(x) +
              '">' +
              esc(x) +
              (on ? " <span>✓</span>" : "") +
              "</button>"
            );
          })
          .join("") +
        "</div>"
      );
    }
    var Q = {
      who: [
        "Whose " + (l.type === "Poo" ? "poo" : "pee") + " is it?",
        big([S.cats.albert.name, S.cats.milly.name, "Not sure"], "who")
      ],
      cons: ["What did it look like?", big(PC, "cons")],
      amt: ["How much?" + (l.type === "Pee" ? " (clump size)" : ""), big(AMT, "amt")],
      smell: ["How did it smell?", big(SMELL, "smell")],
      extra: [
        "Anything unusual?",
        big(LX, "extra", true) +
          '<button class="b p w u-mt12 u-p14" data-a="lnext">' +
          (l.extra.length ? "Next" : "Nothing unusual") +
          "</button>"
      ],
      done: ["All good?", ""]
    };
    var h =
      '<div class="modal" data-a="close"><div class="sheet wiz" data-stop="1"><div class="row between u-nowrap"><span class="small mute u-fw800">Log ' +
      nm +
      " · " +
      (l.step + 1) +
      " of " +
      steps.length +
      '</span><button class="x" data-a="close">✕</button></div>' +
      '<div class="wizbar"><div style="width:' +
      Math.round(((l.step + 1) / steps.length) * 100) +
      '%"></div></div><h2 class="wizq">' +
      Q[st][0] +
      "</h2>" +
      Q[st][1];
    if (st === "done") {
      var rows = steps
        .slice(0, -1)
        .map(function (k, i) {
          var v =
            k === "extra"
              ? l.extra.length
                ? l.extra.join(", ")
                : "Nothing unusual"
              : l[k] || "Not answered";
          return (
            '<button class="wizsum" data-a="lgo" data-v="' +
            i +
            '"><span class="small mute">' +
            Q[k][0] +
            "</span><b>" +
            esc(v) +
            "</b></button>"
          );
        })
        .join("");
      h +=
        (l.pre
          ? '<div class="note u-m0-0-8">Filled in with what\'s usual for ' +
            esc(l.who) +
            " lately. Tap anything to change it.</div>"
          : "") +
        rows +
        '<div class="grid2 u-mt10"><div><label class="l">Date</label><input type="date" data-lf="d" value="' +
        l.d +
        '" max="' +
        today() +
        '"></div><div><label class="l">Time</label><input type="time" data-lf="m" value="' +
        l.m +
        '"></div></div>' +
        (GH
          ? '<button class="b w u-p14 u-mt10" data-a="pick" data-k="pend" data-v="litter" data-acc="image/*" data-cap="1">📷 ' +
            (ui.pend.length ? "Take another photo" : "Add a photo (optional)") +
            "</button>"
          : "") +
        (ui.pend.length ? thumbs(ui.pend, "pend") : "") +
        '<label class="l">Notes (optional)</label><textarea rows="2" data-lf="n">' +
        esc(l.n) +
        "</textarea>" +
        '<button class="b p w u-mt14 u-p16 u-fs17" data-a="lsave">Save ' +
        nm +
        "</button>";
    }
    if (l.step > 0) h += '<button class="b ghost u-mt10" data-a="lback">‹ Back</button>';
    return h + "</div></div>";
  }

  function litterFull() {
    var l = ui.l;
    function chips(list, key, multi) {
      return (
        '<div class="chips">' +
        list
          .map(function (x) {
            var on = multi ? l[key].indexOf(x) >= 0 : l[key] === x;
            return (
              '<button class="chip' +
              (on ? " on" : "") +
              '" data-a="lc" data-k="' +
              key +
              '" data-v="' +
              esc(x) +
              '">' +
              esc(x) +
              "</button>"
            );
          })
          .join("") +
        "</div>"
      );
    }
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">' +
      (l.id ? "Edit " : "Log ") +
      (l.type === "Poo" ? "💩 poo" : "💧 pee") +
      "</h2>" +
      (GH
        ? '<button class="b w u-p16 u-fs16 u-mb6" data-a="pick" data-k="pend" data-v="litter" data-acc="image/*" data-cap="1">📷 ' +
          (ui.pend.length ? "Take another photo" : "Take a photo") +
          "</button>"
        : "") +
      (ui.pend.length ? thumbs(ui.pend, "pend") : "") +
      '<label class="l">Whose?</label>' +
      chips([S.cats.albert.name, S.cats.milly.name, "Not sure"], "who") +
      '<label class="l">Poo or pee</label>' +
      chips(["Poo", "Pee"], "type") +
      '<div class="grid2"><div><label class="l">Date</label><input type="date" data-lf="d" value="' +
      l.d +
      '" max="' +
      today() +
      '"></div><div><label class="l">Time</label><input type="time" data-lf="m" value="' +
      l.m +
      '"></div></div>' +
      (l.type === "Poo" ? '<label class="l">Consistency</label>' + chips(PC, "cons") : "") +
      '<label class="l">Amount' +
      (l.type === "Pee" ? " (clump size)" : "") +
      "</label>" +
      chips(AMT, "amt") +
      '<label class="l">Smell</label>' +
      chips(SMELL, "smell") +
      '<label class="l">Anything unusual?</label>' +
      chips(LX, "extra", true) +
      '<label class="l">Notes</label><textarea rows="2" data-lf="n">' +
      esc(l.n) +
      "</textarea>" +
      '<div class="u-mt10">' +
      upBtn("pend", "litter", "🖼️ Choose from library", "image/*") +
      "</div>" +
      '<div class="row u-mt14"><button class="b p" data-a="lsave">Save</button><button class="b" data-a="close">Cancel</button></div></div></div>'
    );
  }

  function litterSummary(c) {
    var since = addDays(today(), -30),
      L = S.litter.filter(function (x) {
        return x.who === c.name && x.d >= since;
      });
    if (!L.length) return null;
    var days = Object.keys(
        L.reduce(function (o, x) {
          o[x.d] = 1;
          return o;
        }, {})
      ).length,
      po = L.filter(function (x) {
        return x.type === "Poo";
      }),
      pe = L.filter(function (x) {
        return x.type === "Pee";
      }),
      cs = {},
      fl = {},
      sm = {};
    po.forEach(function (x) {
      if (x.cons) cs[x.cons] = (cs[x.cons] || 0) + 1;
    });
    L.forEach(function (x) {
      if (x.smell) sm[x.smell] = (sm[x.smell] || 0) + 1;
      (x.extra || []).forEach(function (e) {
        fl[e] = (fl[e] || 0) + 1;
      });
    });
    return { days: days, poo: po.length, pee: pe.length, cs: cs, fl: fl, sm: sm };
  }
