/* 20-start: Swipes between tabs, swipe to delete, start-up, background sync, offline support. Must stay last. */
  var TABS = ["today", "weight", "health", "calendar", "fights", "stock", "money", "info"],
    sw = null;

  document.addEventListener(
    "touchstart",
    function (e) {
      var t = e.target;
      if (ui.modal || t.closest("nav,input,textarea,select,.cal,svg,.modal,.swr")) {
        sw = null;
        return;
      }
      var p = e.touches[0];
      sw = { x: p.clientX, y: p.clientY, t: Date.now() };
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    function (e) {
      if (!sw) return;
      var p = e.changedTouches[0],
        dx = p.clientX - sw.x,
        dy = p.clientY - sw.y;
      var quick = Date.now() - sw.t < 600;
      sw = null;
      if (!quick || Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
      var TT = TABS.filter(tabOn),
        i = TT.indexOf(ui.tab);
      if (i < 0) return;
      var ni = i + (dx < 0 ? 1 : -1);
      if (ni < 0 || ni >= TT.length) return;
      ui.tab = TT[ni];
      render();
      window.scrollTo(0, 0);
    },
    { passive: true }
  );

  (function () {
    var sr = null;
    function mv(e) {
      if (!sr) return;
      var x = e.touches[0].clientX - sr.x0,
        y = e.touches[0].clientY - sr.y0;
      if (!sr.lock) {
        if (Math.abs(x) < 8 && Math.abs(y) < 8) return;
        sr.lock = Math.abs(x) > Math.abs(y) * 1.2 && x < 0 ? "h" : "v";
        if (sr.lock === "v") {
          sr.row.removeEventListener("touchmove", mv);
          sr = null;
          return;
        }
        window.__hsw = true;
        var r = sr.row;
        r.style.position = "relative";
        r.style.transition = "none";
        var lb = document.createElement("div");
        lb.className = "swdel";
        lb.textContent = "🗑 Delete";
        r.appendChild(lb);
        sr.lab = lb;
      }
      e.preventDefault();
      sr.dx = Math.min(0, x);
      var d = sr.dx < -200 ? -200 + (sr.dx + 200) * 0.3 : sr.dx;
      sr.row.style.transform = "translate3d(" + d + "px,0,0)";
      if (sr.lab) sr.lab.classList.toggle("go", sr.dx < -90);
    }
    document.addEventListener(
      "touchstart",
      function (e) {
        var row = e.target.closest && e.target.closest(".swr");
        if (!row || e.touches.length !== 1 || document.querySelector(".modal")) {
          sr = null;
          return;
        }
        sr = { row: row, x0: e.touches[0].clientX, y0: e.touches[0].clientY, dx: 0, lock: null, lab: null };
        row.addEventListener("touchmove", mv, { passive: false });
      },
      { passive: true }
    );
    function end() {
      if (!sr) return;
      var o = sr;
      sr = null;
      o.row.removeEventListener("touchmove", mv);
      setTimeout(function () {
        window.__hsw = false;
      }, 0);
      if (o.lock !== "h") return;
      var r = o.row;
      if (o.dx < -90) {
        r.style.transition = "transform .2s ease-in,opacity .2s";
        r.style.transform = "translate3d(-110%,0,0)";
        r.style.opacity = "0";
        setTimeout(function () {
          var snap = JSON.stringify(S),
            b = document.createElement("button");
          b.dataset.a = r.dataset.del;
          b.dataset.v = r.dataset.id;
          b.style.display = "none";
          document.body.appendChild(b);
          b.click();
          b.remove();
          toast("Deleted", function () {
            S = JSON.parse(snap);
            change();
          });
        }, 200);
      } else {
        r.style.transition = "transform .25s cubic-bezier(.2,.8,.2,1)";
        r.style.transform = "";
        setTimeout(function () {
          if (o.lab) o.lab.remove();
          r.style.transition = "";
        }, 260);
      }
    }
    document.addEventListener("touchend", end, { passive: true });
    document.addEventListener("touchcancel", end, { passive: true });
  })();

  loadLang(render);
  render();

  (function () {
    var m = location.search.match(/[?&]log=(breakfast|dinner)/);
    if (!m) return;
    var kd = m[1] === "breakfast" ? "dry" : "wet";
    try {
      history.replaceState(null, "", location.pathname);
    } catch (e) {}
    if (!GH) {
      setTimeout(function () {
        toast("Set up syncing in this browser first (⚙️), then the shortcut works");
      }, 600);
      return;
    }
    var go = function () {
      if (!S) return;
      ui.day = today();
      ui.tab = "today";
      logUsual("both", kd);
      render();
    };
    sync().then(go, go);
  })();

  setTimeout(function () {
    if (GH && !S) {
      ui.gherr =
        "Still cannot load your data. Check your internet, or re-enter the access key (Only select repositories → albert-milly-data, Contents: Read and write).";
      GH = null;
      render();
    }
  }, 12000);

  window.__ls = 0;

  window.addEventListener(
    "scroll",
    function () {
      window.__ls = Date.now();
    },
    { passive: true }
  );

  function calmRender() {
    if (Date.now() - window.__ls < 1500 || window.__touching) {
      clearTimeout(calmRender.t);
      calmRender.t = setTimeout(calmRender, 900);
      return;
    }
    if (needRender && !busy()) render();
  }

  document.addEventListener(
    "touchstart",
    function () {
      window.__touching = true;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    function () {
      window.__touching = false;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchcancel",
    function () {
      window.__touching = false;
    },
    { passive: true }
  );

  if (GH) {
    sync();
    setInterval(function () {
      if (document.visibilityState === "visible") sync().then(calmRender);
    }, 20000);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && GH) sync();
  });

  window.addEventListener("online", function () {
    if (GH) {
      sync();
      push();
    }
  });

  if ("serviceWorker" in navigator && location.protocol === "https:")
    navigator.serviceWorker.register("sw.js").catch(function () {});
})();
