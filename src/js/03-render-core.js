/* 03-render-core: render() and shared UI building blocks: open/closed sections, cat faces (spot), bottom bar fixes, wizard frames, the meal sheet. */
  function render() {
    if (S) infoData();
    if (ui.tab === "hows") ui.tab = "fights";
    if (ui.tab === "todo") ui.tab = "calendar";
    if (!GH || !S) {
      document.body.className = "albert duo";
      document.getElementById("root").innerHTML = !GH
        ? setupView()
        : '<div class="hero duo-h u-mt40 u-ta-center"><div class="vs">' +
          spot("albert") +
          "<b>&amp;</b>" +
          spot("milly") +
          '</div><div class="u-fs20 u-fw900">' +
          esc(saveState === "Synced" ? "Loading…" : saveState) +
          '</div></div><div class="row u-jc-center u-gap8"><button class="b" data-a="syncnow">Try again</button><button class="b ghost" data-a="ghout2">Re-enter access key</button></div><div class="note u-ta-center">Version ' +
          APPV +
          "</div>";
      return;
    }
    needRender = false;
    document.body.className = ui.cat;
    try {
      localStorage.setItem(LS + "-ui", JSON.stringify({ cat: ui.cat, tab: ui.tab, calWho: ui.calWho }));
    } catch (e) {}
    var h =
      '<header><h1>' + esc(S.cats.albert.name) + " &amp; " + esc(S.cats.milly.name) + "</h1>" + '<span class="row"><span class="save">' +
      esc(saveState) +
      '</span><button class="b s hb" data-a="srch" aria-label="Search">' +
      ico("search") +
      '</button><button class="b s hb" data-a="tab" data-v="settings" aria-label="Settings">' +
      ico("gear") +
      "</button></span></header>" +
      (DEMO
        ? '<div class="demo-bar"><span>Demo with made-up data. Nothing you change is saved.</span><button class="b s" data-a="demoexit">Exit</button></div>'
        : "");
    if (
      ["fights", "calendar", "info", "todo", "stock", "money", "hows", "weight", "health"].indexOf(ui.tab) < 0
    )
      h +=
        '<div class="switch">' +
        ["albert", "milly"]
          .map(function (k) {
            var c = S.cats[k],
              w = sorted(c),
              lw = w.length ? w[w.length - 1].kg.toFixed(2) + " kg" : "";
            return (
              '<button data-a="cat" data-v="' +
              k +
              '" class="' +
              (ui.cat === k ? "on" : "") +
              '">' +
              spot(k) +
              '<span><span class="nm">' +
              esc(c.name) +
              '</span><span class="wt">' +
              lw +
              " → " +
              c.target +
              ' kg</span><span class="swh">' +
              (ui.cat === k ? "Showing now" : "Tap to switch ›") +
              "</span></span></button>"
            );
          })
          .join("") +
        "</div>";
    h += {
      today: vToday,
      calendar: vCal,
      weight: vWeight,
      fights: vTogether,
      health: vHealth,
      settings: vSettings,
      info: vInfo,
      todo: vTodo,
      stock: vStock,
      money: vMoney,
      hows: vHows
    }[ui.tab]();
    if (["today", "fights", "health"].indexOf(ui.tab) >= 0 && !ui.modal)
      h += '<button class="fab" data-a="quick" aria-label="Quick log">+</button>';
    h +=
      '<nav><div class="navin">' +
      [
        [
          "today",
          '<i class="navtins"><svg class="navbowl" viewBox="0 0 30 22"><g fill="#8a5a33"><circle cx="9" cy="8" r="2.4"/><circle cx="13.5" cy="6.6" r="2.4"/><circle cx="18" cy="7.4" r="2.4"/><circle cx="22" cy="8.6" r="2.2"/><circle cx="11.5" cy="9.6" r="2"/><circle cx="16" cy="9.4" r="2.2"/><circle cx="20" cy="10" r="2"/></g><path d="M3 10h24l-2.2 8.2a3 3 0 0 1-2.9 2.3H8.1a3 3 0 0 1-2.9-2.3z" fill="#e8822f"/><rect x="2" y="9" width="26" height="2.6" rx="1.3" fill="#d4622a"/><path d="M13 14.6a1 1 0 1 1 2 0 1 1 0 1 1-2 0M11.6 15.8a.8.8 0 1 1 1.6 0 .8.8 0 1 1-1.6 0M15 15.8a.8.8 0 1 1 1.6 0 .8.8 0 1 1-1.6 0M13.3 17.8q.7-1.4 1.4 0q.6 1-.7 1t-.7-1z" fill="#fff"/></svg><b>🧶</b></i>',
          "Food & play"
        ],
        ["weight", '<i class="navwt">' + spot("milly") + '<b class="wscale"><b></b></b></i>', "Weight"],
        ["health", '<i class="navfaces navhl">' + spot("albert") + '<b class="nband">🩺</b></i>', "Health"],
        ["calendar", "📅", "Calendar"],
        [
          "fights",
          '<i class="navfaces">' + spot("albert") + spot("milly") + '<b class="nheart">❤</b></i>',
          "Friendship"
        ],
        [
          "stock",
          '<svg class="navtin" viewBox="0 0 34 28"><g transform="translate(1 4)"><rect x="0" y="2" width="15" height="20" rx="2.5" fill="#b9bec6"/><ellipse cx="7.5" cy="2.5" rx="7.5" ry="2.5" fill="#dfe3e8"/><ellipse cx="7.5" cy="2.5" rx="5.5" ry="1.4" fill="#c9ced5"/><path d="M4.5 2.3h6" stroke="#8d939b" stroke-width="1" stroke-linecap="round"/><rect x="0" y="9.0" width="15" height="10.0" fill="#e8822f"/><path d="M3.5 14.0q3-3 6 0q-3 3-6 0zM9.5 14.0l2.4-1.8v3.6z" fill="#fff"/><rect x="0" y="20.5" width="15" height="1.5" rx=".75" fill="#9aa0a8"/></g><g transform="translate(17 9)"><rect x="0" y="2" width="14" height="15" rx="2.5" fill="#b9bec6"/><ellipse cx="7.0" cy="2.5" rx="7.0" ry="2.5" fill="#dfe3e8"/><ellipse cx="7.0" cy="2.5" rx="5.0" ry="1.4" fill="#c9ced5"/><path d="M4.0 2.3h6" stroke="#8d939b" stroke-width="1" stroke-linecap="round"/><rect x="0" y="7.25" width="14" height="7.5" fill="#e8822f"/><path d="M3.0 11.0q3-3 6 0q-3 3-6 0zM9.0 11.0l2.4-1.8v3.6z" fill="#fff"/><rect x="0" y="15.5" width="14" height="1.5" rx=".75" fill="#9aa0a8"/></g></svg>',
          "Stock"
        ],
        [
          "money",
          '<svg class="navwal" viewBox="0 0 36 30"><path d="M2 15 L17 17 L17 29 L3 27.5 Q2 27.4 2 26.4Z" fill="#7a4a27"/><path d="M19 17 L34 15 L34 26.4 Q34 27.4 33 27.5 L19 29Z" fill="#7a4a27"/><path d="M3.5 16.4 L16 18 L16 27.6 L3.5 26.2Z" fill="#c8915e"/><path d="M20 18 L32.5 16.4 L32.5 26.2 L20 27.6Z" fill="#c8915e"/><path d="M5 20.2 L14.5 21.3M5 23.2 L14.5 24.3M21.5 21.3 L31 20.2M21.5 24.3 L31 23.2" stroke="#9c6a3e" stroke-width="1"/><rect x="16" y="16.6" width="4" height="12.6" rx="1" fill="#5c361b"/><g><ellipse cx="9" cy="6.5" rx="1.6" ry="1.2" fill="#333"/><ellipse cx="7.9" cy="5.2" rx="1.5" ry=".8" fill="#d6e4f0" transform="rotate(-35 7.9 5.2)"/><ellipse cx="10.1" cy="5.2" rx="1.5" ry=".8" fill="#d6e4f0" transform="rotate(35 10.1 5.2)"/></g><g><ellipse cx="26" cy="4" rx="1.6" ry="1.2" fill="#333"/><ellipse cx="24.9" cy="2.7" rx="1.5" ry=".8" fill="#d6e4f0" transform="rotate(-35 24.9 2.7)"/><ellipse cx="27.1" cy="2.7" rx="1.5" ry=".8" fill="#d6e4f0" transform="rotate(35 27.1 2.7)"/></g><path d="M10 9 q2 2 1 4.5 M25 6.5 q-2 2.5 -.5 5.5" stroke="#9aa" stroke-width=".8" fill="none" stroke-dasharray="1.2 1.2"/><g fill="#c9b79f"><circle cx="15" cy="13" r=".8"/><circle cx="18" cy="11.5" r=".6"/><circle cx="21" cy="13.2" r=".7"/><circle cx="17" cy="14.4" r=".5"/></g></svg>',
          "Costs"
        ],
        [
          "info",
          '<svg class="navpass" viewBox="0 0 24 30"><rect x="2" y="1" width="20" height="28" rx="3" fill="#1f4fa8"/><rect x="2" y="1" width="3" height="28" rx="1.5" fill="#163c82"/><path d="M8.5 13.5 9.2 8.6 11.6 10.7Q13 10.3 14.4 10.7L16.8 8.6 17.5 13.5Q18.2 16.4 16.6 18.3 15 20 13 20 11 20 9.4 18.3 7.8 16.4 8.5 13.5Z" fill="#f2c94c"/><rect x="8" y="23" width="10" height="1.6" rx=".8" fill="#f2c94c"/></svg>',
          "Info"
        ]
      ]
        .map(function (t) {
          return (
            '<button data-a="tab" data-v="' +
            t[0] +
            '" class="' +
            (ui.tab === t[0] ? "on" : "") +
            '"><span>' +
            t[1] +
            "</span>" +
            t[2] +
            "</button>"
          );
        })
        .join("") +
      "</div></nav>";
    if (ui.modal)
      h += ui
        .modal()
        .replace(
          'data-stop="1">',
          'data-stop="1"><button class="xbtn" data-a="close" aria-label="Close">✕</button>'
        );
    h += '<input type="file" id="fileIn" class="file">';
    var oldNav = document.querySelector(".navin"),
      navX = oldNav ? oldNav.scrollLeft : null;
    if (navX == null) {
      try {
        var sx = sessionStorage.getItem(LS + "-navx");
        if (sx != null) navX = +sx;
      } catch (e) {}
    }
    var rt = document.getElementById("root"),
      sy = window.scrollY || 0,
      sameTab = ui.lastTab === ui.tab;
    rt.style.minHeight = rt.offsetHeight + "px";
    (function () {
      var tmp = document.createElement("div");
      tmp.innerHTML = iconizeHTML(h);
      var pw = document.createElement("div");
      pw.id = "pg";
      [].slice.call(tmp.childNodes).forEach(function (n) {
        if (n.nodeType === 1 && n.matches("nav,.modal,.fab")) return;
        pw.appendChild(n);
      });
      tmp.insertBefore(pw, tmp.firstChild);
      var old = document.getElementById("pg");
      if (sameTab && old && old.parentNode === rt) {
        try {
          morphKids(rt, tmp);
        } catch (e) {
          rt.innerHTML = "";
          while (tmp.firstChild) rt.appendChild(tmp.firstChild);
        }
      } else {
        rt.innerHTML = "";
        while (tmp.firstChild) rt.appendChild(tmp.firstChild);
      }
    })();
    if (sameTab) {
      window.scrollTo(0, sy);
      requestAnimationFrame(function () {
        if (Math.abs((window.scrollY || 0) - sy) > 2) window.scrollTo(0, sy);
      });
    }
    rt.style.minHeight = "";
    var nv = document.querySelector(".navin"),
      act = nv && nv.querySelector(".on");
    if (nv) {
      if (navX != null) nv.scrollLeft = navX;
      if (act) {
        var l = act.offsetLeft,
          r = l + act.clientWidth,
          vl = nv.scrollLeft,
          vr = vl + nv.clientWidth;
        if (l < vl + 10) nv.scrollLeft = l - 10;
        else if (r > vr - 10) nv.scrollLeft = r - nv.clientWidth + 10;
      }
    }
    if (nv) {
      var navEl = nv.parentNode,
        edges = function () {
          navEl.classList.toggle("atstart", nv.scrollLeft < 4);
          navEl.classList.toggle("atend", nv.scrollLeft + nv.clientWidth >= nv.scrollWidth - 4);
        };
      edges();
      if (!nv.__sl) {
        nv.__sl = 1;
        nv.addEventListener(
          "scroll",
          function () {
            edges();
            try {
              sessionStorage.setItem(LS + "-navx", nv.scrollLeft);
            } catch (e) {}
          },
          { passive: true }
        );
      }
      if (!window.__navNudged && nv.scrollLeft < 4 && 0) {
        window.__navNudged = 1;
        setTimeout(function () {
          nv.scrollTo({ left: 110, behavior: "smooth" });
          setTimeout(function () {
            nv.scrollTo({ left: 0, behavior: "smooth" });
          }, 700);
        }, 900);
      }
    }
    try {
      var pgEl = document.getElementById("pg"),
        rmo = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (pgEl && pgEl.animate && !rmo) {
        if (ui.lastTab && ui.lastTab !== ui.tab) {
          var tdir = TABS.indexOf(ui.tab) >= TABS.indexOf(ui.lastTab) ? 1 : -1;
          pgEl.animate(
            [
              { transform: "translate3d(" + tdir * 24 + "px,0,0)", opacity: 0 },
              { transform: "translate3d(0,0,0)", opacity: 1 }
            ],
            { duration: 170, easing: "cubic-bezier(.2,.8,.2,1)" }
          );
        } else if (ui.lastCat && ui.lastCat !== ui.cat) {
          pgEl.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 140, easing: "ease-out" });
        }
      }
    } catch (e) {}
    ui.lastCat = ui.cat;
    ui.lastTab = ui.tab;
    fixNav();
    hydrate();
    badge();
    if (ui.tab === "weight") wcalc();
  }

  function fixNav() {
    fixNav.y = window.scrollY;
    try {
      fixNav2();
    } catch (e) {}
  }

  function fixNav2() {
    var n = document.querySelector("nav");
    if (!n) return;
    n.style.transform = "";
    var r = n.getBoundingClientRect(),
      vv = window.visualViewport,
      port = window.innerWidth <= window.innerHeight,
      full =
        navigator.standalone || (window.matchMedia && matchMedia("(display-mode: standalone)").matches)
          ? port
            ? screen.height
            : screen.width
          : 0,
      bottom = Math.max(window.innerHeight, vv ? vv.height + vv.offsetTop : 0, full),
      gap = bottom - r.bottom;
    if (document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (gap > 40 && gap < 260 && Math.abs(window.scrollY - (fixNav.y || 0)) < 2)
      n.style.transform = "translateY(" + gap + "px)";
  }

  ["resize", "orientationchange", "focusout", "pageshow"].forEach(function (ev) {
    window.addEventListener(ev, function () {
      setTimeout(fixNav, 350);
    });
  });

  if (window.visualViewport) {
    visualViewport.addEventListener("resize", function () {
      setTimeout(fixNav, 100);
    });
    0;
  }

  document.addEventListener("visibilitychange", function () {
    setTimeout(fixNav, 300);
  });

  function bar(val, max) {
    var over = max > 0 && val > max + 1e-9;
    var pct = max > 0 ? Math.min(100, (val / max) * 100) : val > 0 ? 100 : 0;
    return '<div class="bar' + (over ? " over" : "") + '"><div style="width:' + pct + '%"></div></div>';
  }

  function lastDone(c, k) {
    var ds = Object.keys(c.days)
      .filter(function (d) {
        return d < ui.day && c.days[d].checks && c.days[d].checks[k];
      })
      .sort();
    if (!ds.length) return "";
    var n = daysBetween(ds[ds.length - 1], ui.day);
    return '<br><span class="mute small">Last: ' + (n === 1 ? "yesterday" : n + " days ago") + "</span>";
  }

  function thumbs(att, rm) {
    return (
      '<div class="thumbs">' +
      att
        .map(function (a) {
          var k = a.path || a.id,
            x = rm
              ? '<button class="phx" data-a="phdel" data-k="' +
                rm +
                '" data-v="' +
                esc(k) +
                '" aria-label="Remove">✕</button>'
              : "";
          return (
            '<span class="tw">' +
            x +
            (/video/.test(a.type)
              ? '<a class="t tvid" href="#" data-a="view" data-v="' +
                esc(k) +
                '" data-k="video"><span class="play">▶</span></a>'
              : /^image\//.test(a.type)
                ? '<a class="t" href="#" data-a="view" data-v="' +
                  esc(k) +
                  '"><img data-ph="' +
                  esc(a.thumb || k) +
                  '" alt="" loading="lazy" decoding="async"></a>'
                : '<a class="t" data-phl="' +
                  esc(k) +
                  '" href="#" target="_blank" rel="noopener">' +
                  "📄<br>" +
                  esc((a.name || "file").slice(0, 18)) +
                  "</a>") +
            "</span>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function upBtn(kind, ref, label, acc) {
    return GH
      ? '<button class="b s" data-a="pick" data-k="' +
          kind +
          '" data-v="' +
          (ref || "") +
          '" data-acc="' +
          (acc || "image/*") +
          '">' +
          label +
          "</button>"
      : '<span class="mute small">Uploads need the synced page (open it from the Claude app or claude.ai).</span>';
  }

  function addables(c) {
    return c.checks.filter(function (k) {
      return S.extraStock.some(function (x) {
        return x.check === k;
      });
    });
  }

  function mealSheet() {
    var c = cat(),
      k = ui.mealKind,
      M = ui.meal,
      RXL = { all: ["😋", "Ate it all"], some: ["😐", "Some"], no: ["🙅", "Refused"] };
    var fs = c.foods
        .filter(function (f) {
          return k === "dry" ? f.kind === "dry" : f.kind !== "dry";
        })
        .sort(function (a, b) {
          return (b.main ? 1 : 0) - (a.main ? 1 : 0);
        }),
      mf = fs.filter(function (f) {
        return f.id === M.fid;
      })[0],
      dry = k === "dry";
    var h =
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">Add ' +
      (dry ? "dry" : "wet") +
      " food for " +
      esc(c.name) +
      '</h2><div class="row u-gap6 u-wrap">' +
      fs
        .map(function (f) {
          return (
            '<button class="chip' +
            (M.fid === f.id ? " on" : "") +
            '" data-a="mfood" data-v="' +
            f.id +
            '">' +
            (f.main ? "⭐ " : "") +
            esc(f.name) +
            "</button>"
          );
        })
        .join("") +
      "</div>";
    if (mf) {
      h +=
        '<label class="l u-mt12">How much? ' +
        (dry ? "(grams)" : "(cans/pouches)") +
        '</label><div class="row u-gap6 u-wrap u-ai-center"><input class="amt" id="mamt" inputmode="decimal" style="width:90px" value="' +
        esc(String(M.amt)) +
        '" placeholder="' +
        (dry ? "g" : "×") +
        '">' +
        (dry ? [10, 20, 25, 40, 50, 80] : [0.25, 0.5, 1])
          .map(function (s) {
            return (
              '<button class="chip' +
              (String(M.amt) === String(s) ? " on" : "") +
              '" data-a="mamt" data-v="' +
              s +
              '">' +
              (s === 0.25 ? "¼" : s === 0.5 ? "½" : s) +
              "</button>"
            );
          })
          .join("") +
        "</div>" +
        '<label class="l u-mt12">Did ' +
        esc(c.name) +
        ' eat it?</label><div class="row u-gap6 u-wrap">' +
        ["all", "some", "no"]
          .map(function (x) {
            return (
              '<button class="chip' +
              (M.rx === x ? " on" : "") +
              '" data-a="mrx" data-v="' +
              x +
              '">' +
              RXL[x][0] +
              " " +
              RXL[x][1] +
              "</button>"
            );
          })
          .join("") +
        "</div>";
      var ad = addables(c),
        dd = day(c),
        A = M.add || [];
      if (ad.length)
        h +=
          '<label class="l u-mt12">Added anything to it?</label><div class="row u-gap6 u-wrap">' +
          ad
            .map(function (x) {
              return (
                '<button class="chip' +
                (A.indexOf(x) >= 0 ? " on" : "") +
                '" data-a="madd" data-v="' +
                esc(x) +
                '">' +
                (A.indexOf(x) >= 0 ? "✓ " : "") +
                esc(x) +
                "</button>"
              );
            })
            .join("") +
          "</div>" +
          (ad.some(function (x) {
            return dd.checks && dd.checks[x];
          })
            ? '<div class="note">Already given today: ' +
              esc(
                ad
                  .filter(function (x) {
                    return dd.checks[x];
                  })
                  .join(", ")
              ) +
              "</div>"
            : "");
    }
    return (
      h +
      '<div class="row u-mt14"><button class="b p" data-a="mlog"' +
      (mf ? "" : ' disabled style="opacity:.4"') +
      '>Log meal</button><button class="b" data-a="close">Cancel</button></div></div></div>'
    );
  }

  function isOpen(k, def) {
    ui.open = ui.open || {};
    return (k in ui.open ? ui.open[k] : def) ? " open" : "";
  }

  function lazyOpen(k, dflt) {
    ui.open = ui.open || {};
    return k in ui.open ? ui.open[k] : !!dflt;
  }

  function spot(k) {
    if (S && S.cats && S.cats[k] && S.cats[k].photo && GH)
      return '<img class="spot" data-ph="' + esc(S.cats[k].photo) + '" alt="" data-sph="' + k + '">';
    var c = k === "albert" ? "#e8822f" : "#1e1e1e",
      patch =
        k === "albert"
          ? '<path d="M4.2 9.2 5 2.6 9.6 6.2Q12 5.4 14.4 6.2L19 2.6 19.8 9.2Q20.1 11.6 19.4 13.5Q18.2 12.6 16.7 11.9Q15.3 12.2 13.9 11.4L12 7.8 10.1 11.4Q8.7 12.2 7.3 11.9Q5.8 12.6 4.6 13.5Q3.9 11.6 4.2 9.2Z" fill="' +
            c +
            '"/><path d="M5.7 4.1 6.1 7.3 8.6 6.1Z" fill="#f2b29a"/><path d="M18.3 4.1 17.9 7.3 15.4 6.1Z" fill="#f2b29a"/><path d="M12 17.15Q10.9 16.95 9.9 17.9Q11.1 18.35 12 17.7Q12.9 18.35 14.1 17.9Q13.1 16.95 12 17.15Z" fill="' +
            c +
            '"/>'
          : '<path d="M5.7 4.1 6.1 7.3 8.6 6.1Z" fill="#f4b9c2"/><path d="M18.3 4.1 17.9 7.3 15.4 6.1Z" fill="#f4b9c2"/><path d="M7.6 6.6 9.6 6.2Q11.2 5.7 12.4 6.0Q12.2 8.0 10.8 8.9Q9.0 9.3 7.8 8.4Q7.3 7.6 7.6 6.6Z" fill="' +
            c +
            '"/><path d="M16.0 6.9Q18.6 6.6 19.8 9.2Q20.5 11.4 20.1 13.2Q18.7 12.3 17.7 10.9Q16.5 9.3 16.0 6.9Z" fill="' +
            c +
            '"/>';
    return (
      '<svg class="spot" viewBox="0 0 24 24" aria-label="' +
      k +
      '"><path d="M4.2 9.2 5 2.6 9.6 6.2Q12 5.4 14.4 6.2L19 2.6 19.8 9.2Q21 13.2 19 16.8 16.4 21 12 21 7.6 21 5 16.8 3 13.2 4.2 9.2Z" fill="#fff"/>' +
      patch +
      '<path d="M4.2 9.2 5 2.6 9.6 6.2Q12 5.4 14.4 6.2L19 2.6 19.8 9.2Q21 13.2 19 16.8 16.4 21 12 21 7.6 21 5 16.8 3 13.2 4.2 9.2Z" fill="none" stroke="#6b6560" stroke-width="1.1" stroke-linejoin="round"/>' +
      '<ellipse cx="9" cy="13.2" rx="1.1" ry="1.4" fill="' +
      (k === "milly" ? "#9cbf6a" : "#7f9686") +
      '"/><ellipse cx="15" cy="13.2" rx="1.1" ry="1.4" fill="' +
      (k === "milly" ? "#9cbf6a" : "#7f9686") +
      '"/><path d="M11.2 16h1.6l-.8 .9z" fill="#e88a9a"/></svg>'
    );
  }

  function wizFrame(title, step, n, q, body, backAct) {
    return (
      '<div class="modal" data-a="close"><div class="sheet wiz" data-stop="1"><div class="row between u-nowrap"><span class="small mute u-fw800">' +
      title +
      " · " +
      (step + 1) +
      " of " +
      n +
      '</span><button class="x" data-a="close">✕</button></div><div class="wizbar"><div style="width:' +
      Math.round(((step + 1) / n) * 100) +
      '%"></div></div><h2 class="wizq">' +
      q +
      "</h2>" +
      body +
      (step > 0
        ? '<button class="b ghost" style="margin-top:10px" data-a="' + backAct + '">‹ Back</button>'
        : "") +
      "</div></div>"
    );
  }

  function wizBig(list, cur, act, key) {
    return (
      '<div class="wizc">' +
      list
        .map(function (o) {
          var v = o[0],
            lab = o[1],
            on = cur === v;
          return (
            '<button class="wizb' +
            (on ? " on" : "") +
            '" data-a="' +
            act +
            '" data-k="' +
            key +
            '" data-v="' +
            esc(v) +
            '">' +
            lab +
            (on ? " <span>✓</span>" : "") +
            "</button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function sumRow(lbl, val, act, i) {
    return (
      '<button class="wizsum" data-a="' +
      act +
      '" data-v="' +
      i +
      '"><span class="small mute">' +
      lbl +
      "</span><b>" +
      esc(val || "Not answered") +
      "</b></button>"
    );
  }
