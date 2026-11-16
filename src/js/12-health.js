/* 12-health: The Health tab: symptoms, breathing counter, poo vs food, vet questions, vet notes, vet summary, worming and flea, play timer. */
  function vqSection(k) {
    var c = S.cats[k],
      q = c.vq || [],
      open = q.filter(function (x) {
        return !x.done;
      }),
      done = q.filter(function (x) {
        return x.done;
      });
    return (
      '<div class="hsec"><h2>❓ Questions for the vet</h2>' +
      (open.length
        ? open
            .map(function (x) {
              return (
                '<div class="vqr"><button class="tick" data-a="vqdone" data-v="' +
                x.id +
                '" aria-label="Mark asked"></button><div class="u-flex1"><div>' +
                esc(x.t) +
                '</div><div class="small mute">Added ' +
                short(x.d) +
                '</div></div><button class="x" data-a="vqdel" data-v="' +
                x.id +
                '" aria-label="Delete">✕</button></div>'
              );
            })
            .join("")
        : '<div class="small mute u-mb6">Nothing yet. Add things as they come up and they\'ll be on the vet summary.</div>') +
      '<div class="addrow"><input id="vq-' +
      k +
      '" placeholder="e.g. ask about the cough after running"><button class="b p" data-a="vqadd">Add</button></div>' +
      (done.length
        ? '<details class="u-mt6"><summary class="small mute">Asked (' +
          done.length +
          ")</summary>" +
          done
            .map(function (x) {
              return (
                '<div class="vqr done"><button class="tick" data-a="vqdone" data-v="' +
                x.id +
                '">✓</button><div class="u-flex1">' +
                esc(x.t) +
                '</div><button class="x" data-a="vqdel" data-v="' +
                x.id +
                '">✕</button></div>'
              );
            })
            .join("") +
          "</details>"
        : "") +
      "</div>"
    );
  }

  function rrChart(c) {
    var r = (c.rr || [])
      .slice()
      .sort(function (a, b) {
        return a.d + a.m < b.d + b.m ? -1 : 1;
      })
      .slice(-14);
    if (r.length < 2) return "";
    var W = 520,
      H = 120,
      P = 28,
      mx = Math.max(
        45,
        Math.max.apply(
          0,
          r.map(function (x) {
            return x.bpm;
          })
        ) + 5
      ),
      mn = 10;
    function X(i) {
      return P + (i / (r.length - 1)) * (W - P - 10);
    }
    function Y(v) {
      return 8 + ((mx - v) / (mx - mn)) * (H - 26);
    }
    return (
      '<svg viewBox="0 0 ' +
      W +
      " " +
      H +
      '" width="100%" style="margin-top:8px"><rect x="' +
      P +
      '" y="' +
      Y(mx) +
      '" width="' +
      (W - P - 10) +
      '" height="' +
      (Y(30) - Y(mx)) +
      '" fill="color-mix(in srgb,var(--warn) 12%,transparent)"/><line x1="' +
      P +
      '" x2="' +
      (W - 10) +
      '" y1="' +
      Y(30) +
      '" y2="' +
      Y(30) +
      '" stroke="var(--warn)" stroke-dasharray="5 4" stroke-width="2"/><text x="2" y="' +
      (Y(30) + 4) +
      '">30</text><text x="2" y="' +
      (Y(20) + 4) +
      '">20</text>' +
      '<polyline fill="none" stroke="' +
      c.color +
      '" stroke-width="3" stroke-linejoin="round" points="' +
      r
        .map(function (x, i) {
          return X(i) + "," + Y(x.bpm);
        })
        .join(" ") +
      '"/>' +
      r
        .map(function (x, i) {
          return (
            '<circle cx="' +
            X(i) +
            '" cy="' +
            Y(x.bpm) +
            '" r="4.5" fill="' +
            (x.bpm > 30 ? "var(--bad)" : c.color) +
            '"/>'
          );
        })
        .join("") +
      '<text x="' +
      P +
      '" y="' +
      (H - 2) +
      '">' +
      short(r[0].d) +
      '</text><text x="' +
      (W - 10) +
      '" y="' +
      (H - 2) +
      '" text-anchor="end">' +
      short(r[r.length - 1].d) +
      "</text></svg>"
    );
  }

  function rrSection(k) {
    var c = S.cats[k],
      r = (c.rr || []).slice().sort(function (a, b) {
        return a.d + a.m < b.d + b.m ? 1 : -1;
      }),
      last = r[0];
    var avg =
      r.slice(0, 7).reduce(function (m, x) {
        return m + x.bpm;
      }, 0) / Math.max(1, Math.min(7, r.length));
    var flag = last
      ? last.bpm > 40
        ? '<div class="rrflag bad">Over 40 breaths a minute while asleep. Call the vet today, and go straight away if he\'s breathing with his mouth open or his belly is heaving.</div>'
        : last.bpm > 30
          ? '<div class="rrflag">Over 30 while asleep. Recount later today; if it stays over 30, tell the vet.</div>'
          : ""
      : "";
    return (
      '<div class="hsec"><div class="row between"><h2 class="u-m0">🫁 Sleeping breathing rate</h2><button class="b s p" data-a="rrnew">Count now</button></div>' +
      (last
        ? '<div class="grid2 u-mt8"><div class="stat"><span class="mute">Last</span><b style="color:' +
          (last.bpm > 30 ? "var(--bad)" : "inherit") +
          '">' +
          last.bpm +
          '</b><span class="mute small">per min · ' +
          short(last.d) +
          '</span></div><div class="stat"><span class="mute">Average</span><b>' +
          Math.round(avg) +
          '</b><span class="mute small">last ' +
          Math.min(7, r.length) +
          " counts</span></div></div>" +
          flag +
          rrChart(c) +
          '<details style="margin-top:6px" data-open="rra-' +
          k +
          '" data-lazy' +
          isOpen("rra-" + k, false) +
          '><summary class="small mute">All counts (' +
          r.length +
          ")</summary>" +
          (!lazyOpen("rra-" + k)
            ? ""
            : r
                .map(function (x) {
                  return (
                    '<div class="row between swr" data-del="rrdel" data-id="' +
                    x.id +
                    '" style="padding:7px 0;border-top:1px solid var(--line)"><span>' +
                    short(x.d) +
                    " " +
                    esc(x.m || "") +
                    (x.n ? " · " + esc(x.n) : "") +
                    "</span><span><b>" +
                    x.bpm +
                    '</b>/min <button class="x" data-a="rrdel" data-v="' +
                    x.id +
                    '">✕</button></span></div>'
                  );
                })
                .join("")) +
          "</details>"
        : '<div class="small mute u-mt6">Count while ' +
          esc(c.name) +
          " is fast asleep, not purring or dreaming. Under 30 a minute is normal. A few counts a week builds a picture the vet can use.</div>") +
      "</div>"
    );
  }

  function rrSheet() {
    var R = ui.rr,
      c = S.cats[R.k],
      sec = R.start ? Math.min(30, Math.floor((Date.now() - R.start) / 1000)) : 0;
    var body = R.done
      ? '<div class="rrbig"><b>' +
        R.taps * 2 +
        '</b><span>breaths a minute</span></div><div class="note u-ta-center">' +
        R.taps +
        " breaths in 30 seconds × 2</div>"
      : '<div class="note u-mt0">Watch ' +
        esc(c.name) +
        '\'s side rise and fall. Tap once for every breath in (one rise and fall = one tap). The 30-second timer starts on your first tap.</div><button class="rrtap" data-a="rrtap"><span id="rrc">' +
        R.taps +
        '</span><small id="rrt">' +
        (R.start ? 30 - sec + "s left" : "Tap to start") +
        "</small></button>" +
        '<details class="u-mt10"><summary class="small mute">Counted another way? Type it in</summary><div class="addrow"><input id="rrman" inputmode="numeric" placeholder="breaths per minute"><button class="b" data-a="rrman">Use</button></div></details>';
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><div class="row between u-nowrap"><h2 class="u-m0">🫁 ' +
      esc(c.name) +
      ' asleep</h2><button class="x" data-a="rrx" aria-label="Close">✕</button></div>' +
      body +
      (R.done
        ? '<div class="row u-mt14"><button class="b p" data-a="rrsave">Save</button><button class="b" data-a="rrnew">Count again</button></div>'
        : "") +
      "</div></div>"
    );
  }

  function pooFood(k) {
    var c = S.cats[k],
      since = addDays(today(), -45),
      P = (S.litter || []).filter(function (x) {
        return x.who === c.name && x.type === "Poo" && x.cons && x.d >= since;
      });
    if (P.length < 3)
      return (
        '<div class="hsec"><h2>💩 Poo vs food</h2><div class="small mute">Needs at least 3 poos with a consistency logged. ' +
        P.length +
        " so far.</div></div>"
      );
    function soft(q) {
      return /mushy|liquid|soft/i.test(q);
    }
    var T = {};
    P.forEach(function (p) {
      var seen = {};
      [addDays(p.d, -1), p.d].forEach(function (d) {
        var x = peek(c, d);
        if (!x) return;
        c.foods.forEach(function (f) {
          if (((x.f || {})[f.id] || 0) > 0) seen[f.name.split(" (")[0]] = 1;
        });
        if (x.treats > 0) seen["Treats"] = 1;
        if ((x.checks || {})["Probiotic"] === false) seen["No probiotic"] = 1;
      });
      Object.keys(seen).forEach(function (n) {
        T[n] = T[n] || { n: 0, s: 0 };
        T[n].n++;
        if (soft(p.cons)) T[n].s++;
      });
    });
    var base =
        P.filter(function (p) {
          return soft(p.cons);
        }).length / P.length,
      rows = Object.keys(T)
        .filter(function (n) {
          return T[n].n >= 2;
        })
        .sort(function (a, b) {
          return T[b].s / T[b].n - T[a].s / T[a].n;
        });
    return (
      '<div class="hsec"><h2>💩 Poo vs food · 45 days</h2><div class="small mute u-mb8">' +
      P.length +
      " poos, " +
      Math.round(base * 100) +
      "% soft or mushy overall. Each food shows how often a poo within a day of eating it was soft.</div>" +
      (rows.length
        ? rows
            .map(function (n) {
              var r = T[n].s / T[n].n,
                hi = r > base + 0.2 && T[n].n >= 3;
              return (
                '<div class="pfr"><span>' +
                esc(n) +
                '</span><div class="bar' +
                (hi ? " over" : "") +
                '" style="flex:1;margin:0 10px"><div style="width:' +
                Math.max(3, r * 100) +
                '%"></div></div><b>' +
                T[n].s +
                "/" +
                T[n].n +
                "</b></div>"
              );
            })
            .join("")
        : '<div class="small mute">Not enough food logged around those poos yet.</div>') +
      '<div class="note">Early days: with only a few poos, one bad day swings everything. A food that stays well above the overall rate after a few weeks is worth mentioning to the vet.</div></div>'
    );
  }

  function symWiz() {
    var y = ui.sy,
      steps = ["cat", "t", "done"],
      st = steps[y.step];
    var catL = ["albert", "milly"].map(function (k) {
      return [
        k,
        '<span class="u-d-flex u-ai-center u-gap10">' +
          spot(k).replace('class="spot"', 'class="spot" style="width:30px;height:30px"') +
          esc(S.cats[k].name) +
          "</span>"
      ];
    });
    var body =
      st === "cat"
        ? wizBig(catL, y.cat, "syx", "cat")
        : st === "t"
          ? wizBig(
              HT.map(function (x) {
                return [x, esc(x)];
              }),
              y.t,
              "syx",
              "t"
            )
          : sumRow("Which cat?", y.cat ? S.cats[y.cat].name : "", "sygo", 0) +
            sumRow("What happened?", y.t, "sygo", 1) +
            '<div class="grid2 u-mt10"><div><label class="l">Date</label><input type="date" data-sy="d" value="' +
            y.d +
            '" max="' +
            today() +
            '"></div><div><label class="l">Time</label><input type="time" data-sy="m" value="' +
            y.m +
            '"></div></div>' +
            '<label class="l">Details (optional)</label><textarea rows="2" data-sy="n" placeholder="How long, after eating, at rest…">' +
            esc(y.n) +
            "</textarea>" +
            (ui.pend.length ? thumbs(ui.pend, "pend") : "") +
            '<div class="u-mt10">' +
            upBtn("pend", "health", "📷 Add photo or video", "image/*,video/*").replace(
              'class="b s"',
              'class="b w upbig"'
            ) +
            "</div>" +
            '<button class="b p w u-mt14 u-p16 u-fs17" data-a="sysave">Save symptom</button>';
    return wizFrame(
      "Log a symptom",
      y.step,
      steps.length,
      { cat: "Which cat?", t: "What happened?", done: "All good?" }[st],
      body,
      "syback"
    );
  }

  function vHealth() {
    var c = cat(),
      since = addDays(today(), -30),
      hf = ui.hf || (ui.hf = {});
    var h = !ui.hedit
      ? '<div class="row u-gap8 u-mb10 u-nowrap"><button class="b u-flex1 u-p12" data-a="vrep">📋 Vet summary for ' +
        esc(c.name) +
        '</button><button class="b u-p12 sosb" data-a="sos" aria-label="When to call a vet">🚨 Urgent?</button></div><button class="symbtn fbtn" data-a="hnew">🩺 Log a symptom</button>'
      : '<details class="card flog" id="hform" data-open="hform" open><summary><span class="symbtn">✎ Edit symptom</span></summary><div class="u-mt6"><label class="l">Which cat?</label><div class="seg u-cols1fr-1fr u-m0">' +
        ["albert", "milly"]
          .map(function (k) {
            return (
              '<button data-a="cat" data-v="' +
              k +
              '" class="' +
              (ui.cat === k ? "on" : "") +
              '">' +
              spot(k).replace(
                'class="spot"',
                'class="spot" style="width:22px;height:22px;vertical-align:middle"'
              ) +
              " " +
              esc(S.cats[k].name) +
              "</button>"
            );
          })
          .join("") +
        '</div><label class="l">What</label><select id="ht" data-hf="t">' +
        HT.map(function (t) {
          return "<option" + (hf.t === t ? " selected" : "") + ">" + t + "</option>";
        }).join("") +
        "</select>" +
        '<div class="grid2"><div><label class="l">Date</label><input type="date" id="hd" data-hf="d" value="' +
        (hf.d || today()) +
        '" max="' +
        today() +
        '"></div><div><label class="l">Time</label><input type="time" id="hm" data-hf="m" value="' +
        (hf.m || new Date().toTimeString().slice(0, 5)) +
        '"></div></div>' +
        '<label class="l">Details</label><textarea id="hn" data-hf="n" rows="2" placeholder="How long, after eating, at rest…">' +
        esc(hf.n || "") +
        "</textarea>" +
        (ui.pendFor === "health" && ui.pend.length ? thumbs(ui.pend, "pend") : "") +
        '<div class="row u-mt10">' +
        upBtn("pend", "health", "📷 Photo / video", "image/*,video/*") +
        '<button class="b p" data-a="addh">' +
        (ui.hedit ? "Update" : "Save") +
        "</button>" +
        (ui.hedit ? '<button class="b" data-a="hcancel">Cancel</button>' : "") +
        "</div></div></details>" +
        "";
    h += ["albert", "milly"]
      .map(function (k) {
        var c = S.cats[k],
          h = "",
          P = { today: "", trends: "", vet: "" };
        var recent = c.health.filter(function (e) {
            return e.d >= since;
          }),
          counts = {};
        recent.forEach(function (e) {
          counts[e.t] = (counts[e.t] || 0) + 1;
        });
        P.trends +=
          '<div class="hsec"><h2>Last 30 days</h2>' +
          (recent.length ? hbars(counts) : '<span class="mute">Nothing logged</span>') +
          '<button class="b w u-mt10" data-a="vet">📋 Summary to send the vet</button></div>';
        P.trends +=
          '<div class="hsec list"><h2>Symptom history</h2>' +
          (c.health.length
            ? c.health
                .slice()
                .sort(function (a, b) {
                  return a.d + a.m < b.d + b.m ? 1 : -1;
                })
                .map(function (e) {
                  return (
                    '<div class="it"><div class="row between"><b>' +
                    esc(e.t) +
                    '</b><span class="mute small">' +
                    short(e.d) +
                    " " +
                    esc(e.m || "") +
                    '<button class="x" data-a="hedit" data-v="' +
                    e.id +
                    '">Edit</button><button class="x" data-a="delh" data-v="' +
                    e.id +
                    '">✕</button></span></div>' +
                    (e.n ? '<div class="small">' + esc(e.n) + "</div>" : "") +
                    (e.att.length ? thumbs(e.att) : "") +
                    "</div>"
                  );
                })
                .join("")
            : '<span class="mute">Nothing yet</span>') +
          "</div>";
        var lt = S.litter.filter(function (x) {
          return x.d === today() && x.who === c.name;
        });
        P.today +=
          '<div class="hsec"><h2>Poo &amp; pee today · 💩 ' +
          lt.filter(function (x) {
            return x.type === "Poo";
          }).length +
          " · 💧 " +
          lt.filter(function (x) {
            return x.type === "Pee";
          }).length +
          "</h2>" +
          (lt.length ? '<div class="list">' + lt.map(litterLine).join("") + "</div>" : "") +
          '<div class="row u-mt8"><button class="b" data-a="lnew" data-v="Poo" data-k="today">💩 Log poo</button><button class="b" data-a="lnew" data-v="Pee" data-k="today">💧 Log pee</button></div><div class="note">Tap Log poo, then 📷 Take a photo.</div></div>';
        var ls = litterSummary(c);
        P.trends +=
          '<div class="hsec"><h2>Poo &amp; pee, last 30 days</h2>' +
          (ls
            ? '<div class="grid2"><div class="stat"><span class="mute">Poos</span><b>' +
              ls.poo +
              '</b><span class="mute small">' +
              fmt(ls.poo / ls.days) +
              ' per logged day</span></div><div class="stat"><span class="mute">Pees</span><b>' +
              ls.pee +
              '</b><span class="mute small">' +
              fmt(ls.pee / ls.days) +
              " per logged day</span></div></div>" +
              (Object.keys(ls.cs).length ? "<h3>Poo consistency</h3>" + hbars(ls.cs) : "") +
              (Object.keys(ls.sm).length ? "<h3>Smell</h3>" + hbars(ls.sm) : "") +
              (Object.keys(ls.fl).length
                ? "<h3>⚠️ Unusual</h3>" + hbars(ls.fl)
                : '<p class="small mute">Nothing unusual logged.</p>')
            : '<span class="mute small">Nothing logged yet.</span>') +
          '<details style="margin-top:8px" data-open="lall-' +
          k +
          '" data-lazy' +
          isOpen("lall-" + k, false) +
          '><summary class="mute small">All entries</summary>' +
          (lazyOpen("lall-" + k)
            ? '<div class="list">' +
              S.litter
                .filter(function (x) {
                  return x.who === c.name;
                })
                .sort(function (a, b) {
                  return a.d + a.m < b.d + b.m ? 1 : -1;
                })
                .slice(0, 60)
                .map(function (x) {
                  return (
                    '<div class="mute small u-mt6">' + short(x.d) + "</div>" + litterLine(x)
                  );
                })
                .join("") +
              "</div>"
            : "") +
          "</details></div>";
        P.today += rrSection(k);
        P.trends += pooFood(k);
        P.vet += vqSection(k);
        P.vet +=
          '<div class="hsec"><div class="row between"><h2 class="u-m0">Vet notes &amp; files</h2><button class="b s p" data-a="vnew">+ Add</button></div>';
        P.vet +=
          '<div class="u-mt6">' +
          (c.vet.length
            ? c.vet
                .slice()
                .sort(function (a, b) {
                  return (a.d || "0") < (b.d || "0") ? 1 : -1;
                })
                .map(function (v) {
                  return (
                    '<details class="fit" data-open="vet' +
                    v.id +
                    '"' +
                    isOpen("vet" + v.id, false) +
                    '><summary><div class="row between u-nowrap u-gap8"><b class="ell">' +
                    esc(v.reason || "Vet note") +
                    '</b><span class="mute small u-flex-none">' +
                    (v.d ? short(v.d) + " " + parse(v.d).getFullYear() : "No date") +
                    "</span></div>" +
                    (v.next
                      ? '<div class="small u-mt2">Follow-up ' + short(v.next) + "</div>"
                      : "") +
                    '</summary><div class="u-pt6">' +
                    (v.clinic ? '<div class="small mute">' + esc(v.clinic) + "</div>" : "") +
                    (v.notes
                      ? '<div class="small u-ws-pre-wrap">' + esc(v.notes) + "</div>"
                      : "") +
                    (v.email
                      ? '<details><summary class="small mute">Email</summary><div class="small u-ws-pre-wrap">' +
                        esc(v.email) +
                        "</div></details>"
                      : "") +
                    (v.att.length ? thumbs(v.att) : "") +
                    '<div class="row u-jc-flex-end u-mt6"><button class="x" data-a="vedit" data-v="' +
                    v.id +
                    '">Edit</button></div></div></details>'
                  );
                })
                .join("")
            : '<span class="mute">No vet notes yet</span>') +
          "</div></div>";
        var htb = (ui.htab && ui.htab[k]) || "today";
        h =
          '<div class="seg htabs">' +
          [
            ["today", "Today"],
            ["trends", "Trends"],
            ["vet", "Vet"]
          ]
            .map(function (o) {
              return (
                '<button class="' +
                (htb === o[0] ? "on" : "") +
                '" data-a="htab" data-v="' +
                o[0] +
                '">' +
                o[1] +
                "</button>"
              );
            })
            .join("") +
          "</div>" +
          P[htb];
        var lt0 = S.litter.filter(function (x) {
            return x.d === today() && x.who === c.name;
          }),
          hs = c.health.filter(function (e) {
            return e.d >= since;
          }).length;
        return (
          '<details class="catcard catd" data-open="hc-' +
          k +
          '"' +
          isOpen("hc-" + k, false) +
          '><summary class="head" style="--g:var(--g-' +
          k +
          ')">' +
          spot(k) +
          "<div><b>" +
          esc(c.name) +
          "</b><span>Today 💩 " +
          lt0.filter(function (x) {
            return x.type === "Poo";
          }).length +
          " · 💧 " +
          lt0.filter(function (x) {
            return x.type === "Pee";
          }).length +
          " · " +
          hs +
          " symptom" +
          (hs === 1 ? "" : "s") +
          " in 30 days</span></div></summary>" +
          h.replace(/data-a="/g, 'data-cat="' + k + '" data-a="') +
          "</details>"
        );
      })
      .join("");
    h += healthIssues();
    h += treatJoint();
    return h;
  }

  function vetSheet() {
    var v = ui.v;
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">' +
      (v.isNew ? "New vet note" : "Edit vet note") +
      "</h2>" +
      '<div class="grid2"><div><label class="l">Date</label><input type="date" data-vf="d" value="' +
      esc(v.d) +
      '"></div><div><label class="l">Follow-up</label><input type="date" data-vf="next" value="' +
      esc(v.next) +
      '"></div></div>' +
      '<label class="l">Reason / title</label><input data-vf="reason" value="' +
      esc(v.reason) +
      '" placeholder="Weight check, cough…">' +
      '<label class="l">Vet / clinic</label><input data-vf="clinic" value="' +
      esc(v.clinic) +
      '">' +
      '<label class="l">What the vet said</label><textarea rows="4" data-vf="notes">' +
      esc(v.notes) +
      "</textarea>" +
      '<label class="l">Email (paste it here)</label><textarea rows="4" data-vf="email" placeholder="Paste the vet\'s email">' +
      esc(v.email) +
      "</textarea>" +
      '<label class="l">Files</label>' +
      (v.att.length ? thumbs(v.att, "v") : "") +
      '<div class="row u-mt8">' +
      upBtn("vet", "", "📎 PDF, photo or screenshot", "image/*,application/pdf") +
      "</div>" +
      '<div class="note">For an email with attachments: save the PDFs to Files on your iPhone and add them here, or screenshot the email.</div>' +
      '<div class="row u-mt14"><button class="b p" data-a="vsave">Save</button><button class="b" data-a="close">Cancel</button>' +
      (v.isNew
        ? ""
        : '<button class="b u-bg-var---bad u-c-fff" data-a="vdel">Delete</button>') +
      "</div></div></div>"
    );
  }

  function vetText() {
    var c = cat(),
      r = stats(c),
      since = addDays(today(), -30),
      L = [];
    L.push(c.name + " - summary for the vet (" + short(since) + " to " + short(today()) + ")", "");
    if (r) {
      L.push(
        "Weight: " +
          wt(r.first.kg) +
          " (" +
          short(r.first.d) +
          ") → " +
          wt(r.last.kg) +
          " (" +
          short(r.last.d) +
          "), " +
          r.pct.toFixed(1) +
          "% lost. Target " +
          wt(c.target, "t") +
          "."
      );
      if (r.rate != null)
        L.push(
          "Recent rate: " + r.rate.toFixed(2) + "% per week (" + Math.round(r.kgWeek * 1000) + " g/week)."
        );
    }
    L.push(
      "Plan: " +
        c.foods
          .map(function (f) {
            return f.name;
          })
          .join(", ") +
        ". Daily allowance " +
        c.dryAllowance +
        " g dry + " +
        c.wetAllowance +
        " wet."
    );
    var ds = Object.keys(c.days).filter(function (d) {
        return d >= since;
      }),
      n = ds.length;
    if (n) {
      var t = { dry: 0, wet: 0, kcal: 0, play: 0 },
        tr = 0;
      ds.forEach(function (d) {
        var x = dayTotals(c, c.days[d]);
        for (var k in t) t[k] += x[k];
        tr += c.days[d].treats || 0;
      });
      L.push(
        "Logged intake (avg over " +
          n +
          " days): " +
          Math.round(t.dry / n) +
          " g dry, " +
          fmt(t.wet / n) +
          " wet, " +
          fmt(tr / n) +
          " treats, about " +
          Math.round(t.kcal / n) +
          " kcal. Play avg " +
          Math.round(t.play / n) +
          " min/day."
      );
    }
    var hs = c.health
      .filter(function (e) {
        return e.d >= since;
      })
      .sort(function (a, b) {
        return a.d < b.d ? -1 : 1;
      });
    L.push("", "Symptoms:");
    L.push(
      hs.length
        ? hs
            .map(function (e) {
              return "- " + short(e.d) + " " + (e.m || "") + ": " + e.t + (e.n ? " (" + e.n + ")" : "");
            })
            .join("\n")
        : "- nothing logged"
    );
    ["Worming", "Flea"].forEach(function (ty) {
      var l = lastTreat(c, ty);
      if (l)
        L.push(
          (ty === "Flea" ? "Flea treatment" : "Worming") +
            ": last " +
            short(l.d) +
            (l.product ? " (" + l.product + (l.dose ? ", " + l.dose : "") + ")" : "") +
            (l.next ? ", next due " + short(l.next) : "") +
            "."
        );
    });
    var ls = litterSummary(c);
    if (ls) {
      L.push(
        "",
        "Poo and pee (30 days, " +
          ls.days +
          " days logged): " +
          ls.poo +
          " poos, " +
          ls.pee +
          " pees." +
          (Object.keys(ls.cs).length
            ? " Poo: " +
              Object.keys(ls.cs)
                .map(function (k) {
                  return k.toLowerCase() + " x" + ls.cs[k];
                })
                .join(", ") +
              "."
            : "") +
          (Object.keys(ls.fl).length
            ? " Unusual: " +
              Object.keys(ls.fl)
                .map(function (k) {
                  return k.toLowerCase() + " x" + ls.fl[k];
                })
                .join(", ") +
              "."
            : "")
      );
    }
    var fs = S.fights.filter(function (f) {
      return f.d >= since;
    });
    if (fs.length) L.push("", "Fights between " + S.cats.albert.name + " and " + S.cats.milly.name + ": " + fs.length + " in 30 days.");
    return L.join("\n");
  }

  function tGet() {
    try {
      return JSON.parse(localStorage.getItem(LS + "-timer") || "null");
    } catch (e) {
      return null;
    }
  }

  function tSet(o) {
    try {
      if (o) localStorage.setItem(LS + "-timer", JSON.stringify(o));
      else localStorage.removeItem(LS + "-timer");
    } catch (e) {}
  }

  function mmss(ms) {
    ms = Math.max(0, ms);
    var s2 = Math.floor(ms / 1000);
    return String(Math.floor(s2 / 60)).padStart(2, "0") + ":" + String(s2 % 60).padStart(2, "0");
  }

  function timerBanner() {
    var T = tGet();
    if (!T) return "";
    var el = Date.now() - T.start,
      txt = T.dur ? mmss(T.dur * 60000 - el) + " left" : mmss(el);
    return (
      '<div class="card u-b2-solid-var---accent u-pos-sticky u-top-calc-env-safe-area-inset-top-34 u-z4"><div class="row between"><div>' +
      spot(T.cat) +
      " <b>" +
      esc(T.type) +
      '</b><div class="big u-font-variant-numeric-tabular-nums" id="tmr">' +
      txt +
      '</div><div class="mute small">' +
      (T.dur ? T.dur + " min timer" : "Playing… tap Stop when done") +
      '</div></div><div class="row u-fd-column u-ai-stretch"><button class="b p" data-a="tstop">Stop &amp; log</button><button class="b s" data-a="tcancel">Cancel</button></div></div></div>'
    );
  }

  function playSheet() {
    var P = ui.pl,
      c = cat();
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">🧶 Log play for ' +
      esc(c.name) +
      "</h2>" +
      '<label class="l">1. What did you play?</label><div class="wizc">' +
      S.playTypes
        .map(function (p) {
          return (
            '<button class="wizb' +
            (P.type === p ? " on" : "") +
            '" data-a="plt" data-v="' +
            esc(p) +
            '">' +
            esc(p) +
            (P.type === p ? " <span>✓</span>" : "") +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      (P.type
        ? '<label class="l u-mt14">2. How long?</label><div class="grid3">' +
          [5, 10, 15, 20, 30]
            .map(function (m) {
              return (
                '<button class="b' +
                (P.min === m ? " p" : "") +
                '" data-a="plm" data-v="' +
                m +
                '">' +
                m +
                " min</button>"
              );
            })
            .join("") +
          (tGet() ? "" : '<button class="b" data-a="plstart">⏱ Timer</button>') +
          "</div>"
        : "") +
      (P.type && P.min
        ? '<button class="b p w u-mt14 u-p16 u-fs17" data-a="plsave">Add ' +
          P.min +
          " min of " +
          esc(P.type) +
          "</button>"
        : "") +
      '<button class="b w u-mt10" data-a="close">Cancel</button></div></div>'
    );
  }

  function timerSheet() {
    var i = ui.tk,
      p = S.playTypes[i];
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">⏱ ' +
      esc(p) +
      " timer for " +
      esc(cat().name) +
      "</h2><p class=\"mute small\">Pick a length. You'll get a beep when time's up (keep the page open), and the minutes are added to today automatically.</p>" +
      '<div class="grid3">' +
      [5, 10, 15, 20, 30]
        .map(function (m) {
          return '<button class="b" data-a="tstart" data-v="' + m + '">' + m + " min</button>";
        })
        .join("") +
      '<button class="b" data-a="tstart" data-v="0">Stopwatch</button></div>' +
      '<button class="b w u-mt12" data-a="close">Cancel</button></div></div>'
    );
  }

  var actx = null;

  function beep() {
    try {
      if (!actx) return;
      [0, 0.35, 0.7].forEach(function (t0) {
        var o = actx.createOscillator(),
          g = actx.createGain();
        o.frequency.value = 880;
        o.connect(g);
        g.connect(actx.destination);
        g.gain.setValueAtTime(0.25, actx.currentTime + t0);
        g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + t0 + 0.3);
        o.start(actx.currentTime + t0);
        o.stop(actx.currentTime + t0 + 0.3);
      });
    } catch (e) {}
  }

  function tLog(T, mins) {
    var c = S.cats[T.cat],
      ds = iso(new Date(T.start)),
      d = day(c, ds);
    d.play[T.type] = (d.play[T.type] || 0) + mins;
    tSet(null);
    change();
  }

  setInterval(function () {
    var T = tGet();
    if (!T) return;
    var el = Date.now() - T.start,
      e = document.getElementById("tmr");
    if (T.dur && el >= T.dur * 60000) {
      beep();
      if (e) e.textContent = "Done!";
      tLog(T, T.dur);
      return;
    }
    if (e) e.textContent = T.dur ? mmss(T.dur * 60000 - el) + " left" : mmss(el);
  }, 1000);

  function vetReport() {
    var c = cat(),
      k = ui.cat,
      t = today(),
      per = ui.vrper || 30,
      since = addDays(t, -per),
      S2 = [],
      w = sorted(c);
    function sec(h, lines) {
      if (lines.length) S2.push([h, lines]);
    }
    var prof = (S.profiles && S.profiles[k]) || "",
      age = (prof.match(/Age\s*([^\n]+)/i) || [])[1],
      reg = prof.match(/Registered as (\w+)/);
    sec("About", [
      c.name + (age ? ", age " + age : "") + (reg ? " (registered as " + reg[1] + ")" : ""),
      "Covers " + short(since) + " to " + short(t) + " " + t.slice(0, 4)
    ]);
    var wl = w.map(function (x, i) {
      var p = w[i - 1];
      return (
        short(x.d) +
        ": " +
        wt(x.kg) +
        (p ? " (" + (x.kg - p.kg >= 0 ? "+" : "−") + wg((x.kg - p.kg) * 1000) + ")" : "")
      );
    });
    if (w.length)
      wl.push(
        "Target " + wt(c.target, "t") + ", " + wt(Math.max(0, w[w.length - 1].kg - c.target)) + " to go"
      );
    sec(
      "Questions to ask",
      (c.vq || [])
        .filter(function (x) {
          return !x.done;
        })
        .map(function (x) {
          return x.t;
        })
    );
    sec("Weight", wl);
    var fl = [];
    c.foods
      .filter(function (f) {
        return f.main;
      })
      .forEach(function (f) {
        fl.push("Plan: " + (f.kind === "dry" ? c.dryAllowance + " g " : c.wetAllowance + " × ") + f.name);
      });
    var dl = [],
      ks = 0,
      kn = 0;
    for (var i = Math.min(per, 14); i >= 1; i--) {
      var dd = addDays(t, -i),
        x = peek(c, dd);
      if (!x) continue;
      var tt = dayTotals(c, x),
        parts = [];
      c.foods.forEach(function (f) {
        var a = (x.f || {})[f.id];
        if (a) parts.push(fmt(a) + (f.kind === "dry" ? " g " : " × ") + f.name.split(" (")[0]);
      });
      if (x.treats) parts.push(x.treats + " treat" + (x.treats > 1 ? "s" : ""));
      var ref = Object.keys(x.react || {}).filter(function (f) {
        return x.react[f] === "no" || x.react[f] === "some";
      });
      if (parts.length) {
        dl.push(
          short(dd) +
            ": " +
            parts.join(", ") +
            " · ~" +
            Math.round(tt.kcal) +
            " kcal" +
            (ref.length ? " · left some food" : "")
        );
        ks += tt.kcal;
        kn++;
      }
    }
    if (kn) fl.push("Average logged: ~" + Math.round(ks / kn) + " kcal a day over " + kn + " days");
    sec("Food (last 14 days)", fl.concat(dl));
    var sup = c.checks.filter(function (q) {
      return S.extraStock.some(function (x) {
        return x.check === q;
      });
    });
    if (sup.length) sec("Supplements", [sup.join(", ") + " (daily)"]);
    var rrs = (c.rr || [])
      .filter(function (x) {
        return x.d >= since;
      })
      .sort(function (a, b) {
        return a.d + a.m < b.d + b.m ? -1 : 1;
      });
    if (rrs.length) {
      var ra =
        rrs.reduce(function (m, x) {
          return m + x.bpm;
        }, 0) / rrs.length;
      sec(
        "Sleeping breathing rate",
        [
          "Average " +
            Math.round(ra) +
            " breaths/min over " +
            rrs.length +
            " counts (highest " +
            Math.max.apply(
              0,
              rrs.map(function (x) {
                return x.bpm;
              })
            ) +
            ")"
        ].concat(
          rrs.map(function (x) {
            return short(x.d) + (x.m ? " " + x.m : "") + ": " + x.bpm + "/min" + (x.n ? " · " + x.n : "");
          })
        )
      );
    }
    sec(
      "Symptoms",
      c.health
        .filter(function (x) {
          return x.d >= since;
        })
        .sort(function (a, b) {
          return a.d + a.m < b.d + b.m ? -1 : 1;
        })
        .map(function (x) {
          return short(x.d) + (x.m ? " " + x.m : "") + ": " + x.t + (x.n ? " · " + x.n : "");
        })
    );
    var notes = [];
    for (var j = per; j >= 0; j--) {
      var nd = addDays(t, -j),
        nx = peek(c, nd);
      if (
        nx &&
        nx.note &&
        /cough|wheez|breath|vomit|sick|diarr|poo|stomach|sneez|limp|letharg/i.test(nx.note)
      )
        notes.push(short(nd) + ": " + nx.note);
    }
    sec("Day notes about health", notes);
    var L = (S.litter || []).filter(function (x) {
        return x.who === c.name && x.d >= since;
      }),
      poo = L.filter(function (x) {
        return x.type === "Poo";
      }),
      pee = L.filter(function (x) {
        return x.type !== "Poo";
      });
    var cc = {};
    poo.forEach(function (x) {
      var q = x.cons || "Not noted";
      cc[q] = (cc[q] || 0) + 1;
    });
    var ll = [];
    if (poo.length)
      ll.push(
        poo.length +
          " poos: " +
          Object.keys(cc)
            .map(function (q) {
              return cc[q] + "× " + q;
            })
            .join(", ")
      );
    if (pee.length) ll.push(pee.length + " pees logged");
    poo
      .slice()
      .sort(function (a, b) {
        return a.d + a.m < b.d + b.m ? -1 : 1;
      })
      .forEach(function (x) {
        var nn = (x.n || "").replace(/ ?Logged from chat\.?/, "").trim();
        ll.push(
          short(x.d) +
            (x.m ? " " + x.m : "") +
            ": " +
            (x.cons || "consistency not noted") +
            (x.smell ? ", " + x.smell.toLowerCase() : "") +
            ((x.extra || []).length ? ", " + x.extra.join(", ") : "") +
            (nn ? " · " + nn : "")
        );
      });
    sec("Poo & pee", ll);
    sec(
      "Worming & flea",
      ["Worming", "Flea"]
        .map(function (ty) {
          var l = lastTreat(c, ty);
          return l
            ? ty +
                ": last " +
                short(l.d) +
                " " +
                l.d.slice(0, 4) +
                (l.product ? " (" + l.product + ")" : "") +
                (l.next ? ", next " + short(l.next) + " " + l.next.slice(0, 4) : "")
            : "";
        })
        .filter(Boolean)
    );
    sec(
      "Vet history",
      c.vet
        .slice()
        .sort(function (a, b) {
          return (a.d || "0") < (b.d || "0") ? 1 : -1;
        })
        .map(function (v) {
          return (v.d ? short(v.d) + " " + v.d.slice(0, 4) + ": " : "") + (v.reason || "Vet note");
        })
    );
    ui.vrtext =
      c.name +
      " · vet summary\n\n" +
      S2.map(function (x) {
        return (
          x[0].toUpperCase() +
          "\n" +
          x[1]
            .map(function (l) {
              return "- " + l;
            })
            .join("\n")
        );
      }).join("\n\n");
    return (
      '<div class="modal vrm" data-a="close"><div class="sheet vrep" data-stop="1"><div class="row between u-nowrap"><h2 class="u-m0">📋 ' +
      esc(c.name) +
      ' · vet summary</h2><button class="x noprint" data-a="close">✕</button></div>' +
      '<div class="seg noprint u-cols-repeat-3-1fr u-m10-0">' +
      [
        [30, "30 days"],
        [90, "90 days"],
        [365, "1 year"]
      ]
        .map(function (o) {
          return (
            '<button class="' +
            (per === o[0] ? "on" : "") +
            '" data-a="vrper" data-v="' +
            o[0] +
            '">' +
            o[1] +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      S2.map(function (x) {
        return (
          '<h3 class="u-m14-0-4">' +
          esc(x[0]) +
          '</h3><ul class="kvl u-pl18">' +
          x[1]
            .map(function (l) {
              return "<li>" + esc(l) + "</li>";
            })
            .join("") +
          "</ul>"
        );
      }).join("") +
      '<div class="row noprint u-mt16"><button class="b p" data-a="vrshare">Share</button><button class="b" data-a="vrprint">Print / PDF</button><button class="b" data-a="close">Close</button></div></div></div>'
    );
  }

  var TT = { Worming: { ic: "🐛", days: 182 }, Flea: { ic: "🛡️", days: 30 }, Other: { ic: "💉", days: 0 } };

  function lastTreat(c, type) {
    return c.treat
      .filter(function (x) {
        return x.type === type;
      })
      .sort(function (a, b) {
        return a.d < b.d ? 1 : -1;
      })[0];
  }

  function treatDue(c, type) {
    var l = lastTreat(c, type);
    if (!l || !l.next) return null;
    return { next: l.next, days: daysBetween(today(), l.next) };
  }

  function treatPill(c, ty) {
    var du = treatDue(c, ty),
      l = lastTreat(c, ty);
    return {
      cls: du ? (du.days < 0 ? "bad" : du.days <= 14 ? "warn" : "ok") : "neutral",
      txt: du
        ? du.days < 0
          ? "overdue " + -du.days + "d"
          : du.days === 0
            ? "due today"
            : "in " + du.days + " days"
        : l
          ? "no next date"
          : "not logged"
    };
  }

  function wormDose(c) {
    var w = sorted(c),
      kg = w.length ? w[w.length - 1].kg : null;
    if (!kg) return "";
    return kg > 12
      ? "over 12 kg: ask the vet"
      : kg > 8
        ? "1½ tablets (8 to 12 kg band)"
        : kg > 4
          ? "1 tablet (4 to 8 kg band)"
          : kg >= 2
            ? "½ tablet (2 to 4 kg band)"
            : "small cat tablets: ask the vet";
  }

  function healthIssues() {
    var t = today(),
      since = addDays(t, -30);
    function sect(k) {
      var lines = String(S.profiles[k] || "").split("\n"),
        out = [],
        on = false;
      lines.forEach(function (l) {
        var x = l.trim();
        if (/:$/.test(x) && !/^-/.test(x)) {
          on = /^health/i.test(x);
          return;
        }
        if (on && x) out.push(x.replace(/^[-•*]\s*/, ""));
      });
      return out;
    }
    var rows = ["albert", "milly"]
      .map(function (k) {
        var c = S.cats[k],
          w = sorted(c),
          lw = w.length ? w[w.length - 1].kg : null,
          items = sect(k).map(function (x) {
            return ["🩺", x];
          });
        if (lw && c.target && lw - c.target > 0.05)
          items.push(["⚖️", wt(lw - c.target) + " to lose"]);
        var sy = {};
        (c.health || [])
          .filter(function (e) {
            return e.d >= since;
          })
          .forEach(function (e) {
            sy[e.t] = (sy[e.t] || 0) + 1;
          });
        Object.keys(sy).forEach(function (x) {
          items.push(["📈", x + " ×" + sy[x] + " this month"]);
        });
        var bl = S.litter.filter(function (l) {
          return l.d >= since && l.who === c.name && bad(l);
        }).length;
        if (bl) items.push(["⚠️", bl + " poo/pee to check this month"]);
        return (
          '<div class="hiss"><div class="hissh">' +
          spot(k).replace('class="spot"', 'class="spot" style="width:24px;height:24px"') +
          "<b>" +
          esc(c.name) +
          "</b></div>" +
          (items.length
            ? "<ul>" +
              items
                .map(function (x) {
                  return "<li><span>" + x[0] + "</span>" + esc(x[1]) + "</li>";
                })
                .join("") +
              "</ul>"
            : '<div class="mute small">Nothing ongoing</div>') +
          "</div>"
        );
      })
      .join("");
    return (
      '<div class="card hissc"><div class="row between u-nowrap"><h2 class="u-m0">Keep an eye on</h2><button class="b s ghost" data-a="tab" data-v="info">Edit in Info</button></div>' +
      rows +
      "</div>"
    );
  }

  function treatJoint() {
    var cats = ["albert", "milly"],
      types = ["Worming", "Flea"];
    function tile(k, ty) {
      var c = S.cats[k],
        l = lastTreat(c, ty),
        du = treatDue(c, ty),
        st = du ? (du.days < 0 ? "bad" : du.days <= 7 ? "warn" : "ok") : "none",
        big = du ? (du.days < 0 ? -du.days + "d over" : du.days === 0 ? "Today" : du.days + " days") : "-",
        unit = du
          ? du.days < 0
            ? "days over"
            : du.days === 0
              ? "due"
              : "day" + (du.days === 1 ? "" : "s")
          : "not logged";
      return (
        '<button class="ttile ' +
        st +
        '" data-a="trnew" data-cat="' +
        k +
        '" data-v="' +
        ty +
        '"><span class="tbig">' +
        big +
        '</span><span class="tunit">' +
        unit +
        '</span><span class="tsub">' +
        (du ? "next " + short(du.next) : l ? "last " + short(l.d) : "tap to log") +
        "</span></button>"
      );
    }
    var h =
      '<div class="card"><h2>Worming &amp; flea</h2><div class="tgrid"><span></span><span class="tcol">🐛 Worming</span><span class="tcol">🛡️ Flea</span>' +
      cats
        .map(function (k) {
          return (
            '<span class="tcat">' +
            spot(k).replace('class="spot"', 'class="spot" style="width:24px;height:24px"') +
            "<b>" +
            esc(S.cats[k].name) +
            "</b></span>" +
            types
              .map(function (ty) {
                return tile(k, ty);
              })
              .join("")
          );
        })
        .join("") +
      "</div>" +
      "";
    var all = [];
    cats.forEach(function (k) {
      S.cats[k].treat.forEach(function (x) {
        all.push([k, x]);
      });
    });
    all.sort(function (a, b) {
      return a[1].d < b[1].d ? 1 : -1;
    });
    if (all.length)
      h +=
        '<details class="nf" data-open="trhist"' +
        isOpen("trhist", false) +
        '><summary><span>📋 History &amp; edit <span class="nfc">' +
        all.length +
        '</span></span></summary><div class="list">' +
        all
          .map(function (p) {
            var k = p[0],
              x = p[1];
            return (
              '<div class="it"><div class="row between u-nowrap u-gap8"><span>' +
              spot(k).replace(
                'class="spot"',
                'class="spot" style="width:22px;height:22px;vertical-align:middle"'
              ) +
              " <b>" +
              (TT[x.type] ? TT[x.type].ic : "💉") +
              " " +
              esc(x.product || x.type) +
              '</b></span><span class="mute small u-flex-none">' +
              short(x.d) +
              '<button class="x" data-a="tredit" data-cat="' +
              k +
              '" data-v="' +
              x.id +
              '">Edit</button><button class="x" data-a="trdel" data-cat="' +
              k +
              '" data-v="' +
              x.id +
              '">✕</button></span></div><div class="small mute">' +
              esc(
                [x.dose ? "Dose: " + x.dose : "", x.next ? "next " + short(x.next) : "", x.n]
                  .filter(Boolean)
                  .join(" · ")
              ) +
              "</div></div>"
            );
          })
          .join("") +
        "</div></details>";
    return h + "</div>";
  }

  function treatCard(c) {
    var wd = wormDose(c);
    function hist(list) {
      return list.length
        ? '<details class="u-mt10"><summary class="mute small">History (' +
            list.length +
            ')</summary><div class="list">' +
            list
              .map(function (x) {
                return (
                  '<div class="it"><div class="row between"><b>' +
                  TT[x.type].ic +
                  " " +
                  esc(x.product || x.type) +
                  '</b><span class="mute small">' +
                  short(x.d) +
                  '<button class="x" data-a="tredit" data-v="' +
                  x.id +
                  '">Edit</button><button class="x" data-a="trdel" data-v="' +
                  x.id +
                  '">✕</button></span></div><div class="small mute">' +
                  esc(
                    [x.type, x.dose ? "Dose: " + x.dose : "", x.next ? "next " + short(x.next) : "", x.n]
                      .filter(Boolean)
                      .join(" · ")
                  ) +
                  "</div></div>"
                );
              })
              .join("") +
            "</div></details>"
        : "";
    }
    function byType(ty) {
      return c.treat
        .filter(function (x) {
          return x.type === ty;
        })
        .sort(function (a, b) {
          return a.d < b.d ? 1 : -1;
        });
    }
    var guide = {
      Worming:
        "European parasite guidelines (ESCCAP) say indoor cats that don't hunt or mix with other cats need worming 1 to 2 times a year, so every 6 months is the default here. Cat hotel stays and lead walks add a bit of risk, so ask the vet if they'd go every 3 months." +
        (wd
          ? "<br><br><b>Milbemax dose at " +
            sorted(c).slice(-1)[0].kg.toFixed(2) +
            " kg:</b> " +
            wd +
            ". Other brands have different bands, so check the pack against the latest weigh-in."
          : ""),
      Flea: "Depends on the product (usually 1 or 3 months). Indoor cats are lower risk but can still get fleas from shoes, other pets or the cat hotel, so ask the vet whether they want it regular or only if fleas turn up."
    };
    var h = ["Worming", "Flea"]
      .map(function (ty) {
        var du = treatDue(c, ty),
          l = lastTreat(c, ty),
          p = treatPill(c, ty),
          nm = ty === "Flea" ? "Flea" : "Worming";
        var cls = du ? (du.days < 0 ? "bad" : du.days <= 7 ? "warn" : "ok") : "neutral",
          txt = du
            ? du.days < 0
              ? "Overdue by " + -du.days + " days"
              : du.days === 0
                ? "Due today"
                : "Due in " + du.days + " days"
            : l
              ? "No next date"
              : "Not logged yet";
        return (
          '<details class="card tcd" data-open="treat-' +
          ty +
          '"' +
          isOpen("treat-" + ty, false) +
          '><summary><div class="row between u-nowrap"><h2 class="u-m0">' +
          TT[ty].ic +
          " " +
          nm +
          '</h2><span class="pill ' +
          cls +
          '">' +
          txt +
          "</span></div></summary>" +
          '<div class="u-mt10"><div class="small mute">' +
          (l
            ? "Last: " +
              short(l.d) +
              (l.product ? " · " + esc(l.product) : "") +
              (l.dose ? " · " + esc(l.dose) : "")
            : "Nothing logged yet") +
          "</div>" +
          '<button class="b s p" style="margin-top:10px" data-a="trnew" data-v="' +
          ty +
          '">Log ' +
          (ty === "Flea" ? "flea" : "worming") +
          "</button></div>" +
          hist(byType(ty)) +
          '<details class="u-mt10"><summary class="mute small">How often' +
          (ty === "Worming" ? ", and how much" : "") +
          " for " +
          esc(c.name) +
          '</summary><div class="small u-mt6 u-lh1_5">' +
          guide[ty] +
          "</div></details></details>"
        );
      })
      .join("");
    var oth = byType("Other");
    return (
      h +
      '<div class="u-m4-0-12">' +
      (oth.length
        ? '<div class="card u-mb8">' +
          hist(oth).replace('style="margin-top:10px"', "") +
          "</div>"
        : "") +
      '<button class="b s ghost" data-a="trnew" data-v="Other">💉 Log other treatment</button></div>'
    );
  }

  function treatSheet() {
    var r = ui.tr,
      c = cat();
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">' +
      TT[r.type].ic +
      " " +
      (r.id ? "Edit " : "Log ") +
      (r.type === "Flea" ? "flea treatment" : r.type === "Worming" ? "worming" : "treatment") +
      " · " +
      esc(c.name) +
      "</h2>" +
      '<label class="l">Product</label><input data-tr="product" value="' +
      esc(r.product) +
      '" placeholder="e.g. Milbemax, Bravecto, Advocate">' +
      '<label class="l">Dose / amount</label><input data-tr="dose" value="' +
      esc(r.dose) +
      '" placeholder="e.g. 1 tablet, 0.5 tablet, 1 pipette 0.8 ml">' +
      '<div class="grid2"><div><label class="l">Given on</label><input type="date" data-tr="d" value="' +
      esc(r.d) +
      '" max="' +
      today() +
      '"></div><div><label class="l">Next due</label><input type="date" data-tr="next" value="' +
      esc(r.next) +
      '"></div></div>' +
      (r.type !== "Other"
        ? '<div class="row u-gap6 u-mt8 u-wrap"><span class="small mute">Next one in:</span>' +
          [
            [30, "1 month"],
            [91, "3 months"],
            [182, "6 months"]
          ]
            .map(function (o) {
              return (
                '<button class="chip' +
                (r.next && r.d && daysBetween(r.d, r.next) === o[0] ? " on" : "") +
                '" data-a="trint" data-v="' +
                o[0] +
                '">' +
                o[1] +
                "</button>"
              );
            })
            .join("") +
          "</div>"
        : "") +
      (r.type === "Worming" && wormDose(c)
        ? '<div class="note">Milbemax for ' +
          esc(c.name) +
          " at the latest weight: " +
          wormDose(c) +
          ".</div>"
        : "") +
      '<label class="l">Notes</label><textarea rows="2" data-tr="n" placeholder="Weight band on the pack, how it went…">' +
      esc(r.n) +
      "</textarea>" +
      '<div class="row u-mt14"><button class="b p" data-a="trsave">Save</button><button class="b" data-a="close">Cancel</button></div></div></div>'
    );
  }
