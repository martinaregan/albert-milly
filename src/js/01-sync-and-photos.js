/* 01-sync-and-photos: Saving, syncing with the private GitHub data repo (pull, push, merge), photo upload with previews, the setup screen. */
  function change() {
    S.savedAt = Date.now();
    dirty = true;
    persist();
    saveState = "Saving…";
    render();
    clearTimeout(timer);
    timer = setTimeout(push, 1200);
  }

  function persist() {
    if (DEMO) return;
    try {
      localStorage.setItem(LS + "-cache", JSON.stringify({ S: S, BASE: BASE, SHA: SHA, dirty: dirty }));
    } catch (e) {}
  }

  function b64e(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function b64d(b) {
    return decodeURIComponent(escape(atob(String(b).replace(/\s/g, ""))));
  }

  function api(path, opt) {
    opt = opt || {};
    var h = {
      Authorization: "Bearer " + GH.token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
    var oh = opt.headers || {};
    for (var k in oh) h[k] = oh[k];
    return fetch(
      "https://api.github.com/repos/" + GH.owner + "/" + GH.repo + "/contents/" + path + (opt.q || ""),
      { method: opt.method || "GET", headers: h, body: opt.body, cache: "no-store" }
    );
  }

  function pull() {
    return api("data.json")
      .then(function (r) {
        if (r.status === 401 || r.status === 403) throw { auth: r.status };
        // 404 means either no access or no data.json yet. A brand-new repository is fine: start from starter.json.
        if (r.status === 404)
          return fetch("https://api.github.com/repos/" + GH.owner + "/" + GH.repo, {
            headers: { Authorization: "Bearer " + GH.token, Accept: "application/vnd.github+json" },
            cache: "no-store"
          }).then(function (rr) {
            if (!rr.ok) throw { noaccess: 1 };
            return null;
          });
        if (!r.ok) throw { http: r.status };
        return r.json();
      })
      .then(function (j) {
        if (!j) return null;
        return { data: JSON.parse(b64d(j.content)), sha: j.sha };
      });
  }

  function eq(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function keyOf(x) {
    return x && typeof x === "object"
      ? x.id != null
        ? "i:" + x.id
        : x.d != null
          ? "d:" + x.d
          : "j:" + JSON.stringify(x)
      : "p:" + JSON.stringify(x);
  }

  function merge3(b, l, r) {
    if (eq(l, r)) return l;
    if (l === undefined) return r;
    if (r === undefined) return l;
    if (eq(l, b)) return r;
    if (eq(r, b)) return l;
    if (Array.isArray(l) && Array.isArray(r)) {
      var bm = {},
        lm = {},
        rm = {},
        order = [];
      (Array.isArray(b) ? b : []).forEach(function (x) {
        bm[keyOf(x)] = x;
      });
      l.forEach(function (x) {
        var k = keyOf(x);
        lm[k] = x;
        order.push(k);
      });
      r.forEach(function (x) {
        var k = keyOf(x);
        rm[k] = x;
        if (!(k in lm)) order.push(k);
      });
      var out = [];
      order.forEach(function (k) {
        var B = bm[k],
          L = lm[k],
          R = rm[k];
        if (L !== undefined && R !== undefined) out.push(merge3(B, L, R));
        else if (L !== undefined) {
          if (B !== undefined && eq(B, L)) return;
          out.push(L);
        } else {
          if (B !== undefined && eq(B, R)) return;
          out.push(R);
        }
      });
      return out;
    }
    if (l && r && typeof l === "object" && typeof r === "object") {
      var o = {},
        ks = {};
      Object.keys(l)
        .concat(Object.keys(r))
        .forEach(function (k) {
          ks[k] = 1;
        });
      Object.keys(ks).forEach(function (k) {
        var B = b && typeof b === "object" ? b[k] : undefined;
        if (!(k in l)) {
          if (B !== undefined && eq(B, r[k])) return;
          o[k] = r[k];
          return;
        }
        if (!(k in r)) {
          if (B !== undefined && eq(B, l[k])) return;
          o[k] = l[k];
          return;
        }
        o[k] = merge3(B, l[k], r[k]);
      });
      return o;
    }
    return l;
  }

  var pushing = false,
    tries = 0,
    needRender = false;

  function busy() {
    var ae = document.activeElement;
    return !!ui.modal || !!(ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName));
  }

  function setStatus(t) {
    saveState = t;
    var el = document.querySelector(".save");
    if (el) el.textContent = t;
  }

  function push() {
    if (DEMO) {
      dirty = false;
      return setStatus("Demo");
    }
    // No-account mode: everything stays in this phone's saved copy.
    if (GH && GH.local) {
      dirty = false;
      persist();
      return setStatus("On this phone");
    }
    if (!GH || !S || pushing || !dirty) return;
    pushing = true;
    var snap = JSON.parse(JSON.stringify(S));
    api("data.json", {
      method: "PUT",
      body: JSON.stringify({
        message: "Update from " + (GH.who || "phone") + (notifyNext ? " [notify]" : ""),
        content: b64e(JSON.stringify(snap, null, 1)),
        sha: SHA || undefined
      })
    })
      .then(function (r) {
        if (r.status === 409 || r.status === 422) return "conflict";
        if (r.status === 401 || r.status === 403) throw { auth: r.status };
        if (!r.ok) throw { http: r.status };
        return r.json();
      })
      .then(function (res) {
        if (res === "conflict") {
          if (++tries > 4) throw { http: 409 };
          return pull().then(function (p) {
            if (p) {
              S = merge3(BASE, S, p.data);
              migrate();
              BASE = p.data;
              SHA = p.sha;
            }
            pushing = false;
            dirty = true;
            persist();
            push();
          });
        }
        tries = 0;
        notifyNext = false;
        SHA = res.content.sha;
        BASE = snap;
        dirty = !eq(S, snap);
        pushing = false;
        persist();
        setStatus(dirty ? "Saving…" : "Synced");
        if (dirty) setTimeout(push, 300);
      })
      .catch(function (e) {
        pushing = false;
        setStatus(
          e && e.auth
            ? e.auth === 403
              ? "Can't save: key needs Contents: Read and write"
              : "Access key expired or removed"
            : navigator.onLine === false
              ? "Offline, will sync"
              : "Not synced yet, retrying"
        );
        setTimeout(push, 15000);
      });
  }

  // Demo: load demo.json once and move its dates so the newest entries land on today.
  function loadDemo() {
    return fetch("demo.json", { cache: "no-cache" })
      .then(function (r) {
        return r.text();
      })
      .then(function (txt) {
        var anchor = (txt.match(/"demoAnchor":\s*"(\d{4}-\d\d-\d\d)"/) || [])[1] || today(),
          shift = daysBetween(anchor, today());
        if (shift)
          txt = txt.replace(/\b20\d\d-\d\d-\d\d\b/g, function (d) {
            return addDays(d, shift);
          });
        S = JSON.parse(txt);
        migrate();
        BASE = JSON.parse(txt);
        SHA = "demo";
        setStatus("Demo");
        render();
      })
      .catch(function () {
        setStatus("Could not load the demo");
        render();
      });
  }

  function starter() {
    return fetch("starter.json", { cache: "no-cache" })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        S = d;
        migrate();
        BASE = null;
        SHA = null;
        dirty = true;
        persist();
        render();
        push();
      });
  }

  function sync() {
    if (DEMO) return S ? Promise.resolve() : loadDemo();
    if (GH && GH.local) return S ? Promise.resolve() : starter();
    if (!GH || pushing) return Promise.resolve();
    return pull()
      .then(function (p) {
        if (!p) {
          if (S) {
            dirty = true;
            push();
          } else return starter();
          return;
        }
        if (p.sha === SHA && S) return;
        var first = !S,
          merged = S ? merge3(BASE, S, p.data) : p.data,
          changed = !eq(merged, S);
        S = merged;
        migrate();
        BASE = p.data;
        SHA = p.sha;
        dirty = !eq(S, BASE);
        persist();
        if (dirty) push();
        if (first || changed) {
          if (first) render();
          else {
            needRender = true;
            calmRender();
          }
        }
        setStatus(dirty ? "Saving…" : "Synced");
      })
      .catch(function (e) {
        setStatus(
          e && (e.auth || e.noaccess)
            ? "Access key not working"
            : S
              ? "Offline, showing saved copy"
              : "Could not load. Check connection"
        );
        if (!S) {
          if (e && (e.auth || e.noaccess)) {
            ui.gherr = keyErr(e);
            GH = null;
            try {
              localStorage.removeItem(LS + "-gh");
            } catch (x) {}
          }
          render();
        }
      });
  }

  var PH = {};

  function blobToB64(b) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () {
        res(String(fr.result).split(",")[1]);
      };
      fr.onerror = rej;
      fr.readAsDataURL(b);
    });
  }

  function mkThumb(blob) {
    return new Promise(function (res) {
      if (!/^image\//.test(blob.type || "image/jpeg")) {
        res(null);
        return;
      }
      var img = new Image(),
        url = URL.createObjectURL(blob);
      img.onload = function () {
        var sc = Math.min(1, 360 / Math.max(img.width, img.height)),
          cv = document.createElement("canvas");
        cv.width = Math.round(img.width * sc);
        cv.height = Math.round(img.height * sc);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        cv.toBlob(
          function (b) {
            URL.revokeObjectURL(url);
            res(b);
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = function () {
        res(null);
      };
      img.src = url;
    });
  }

  function putFile(path, blob) {
    return blobToB64(blob)
      .then(function (b64) {
        return api(path, { method: "PUT", body: JSON.stringify({ message: "Add " + path, content: b64 }) });
      })
      .then(function (r) {
        if (!r.ok) throw { http: r.status };
        try {
          PH[path] = URL.createObjectURL(blob);
          if (window.caches)
            caches.open("am-photos").then(function (c) {
              c.put(
                "https://photos.local/" + path,
                new Response(blob, { headers: { "Content-Type": blob.type || "image/jpeg" } })
              );
            });
        } catch (e) {}
      });
  }

  function ghUpload(blob, name) {
    var ty = blob.type || "image/jpeg",
      ext = /pdf/.test(ty)
        ? "pdf"
        : /png/.test(ty)
          ? "png"
          : /video/.test(ty)
            ? /quicktime/.test(ty)
              ? "mov"
              : "mp4"
            : "jpg",
      id = uid(),
      path = "photos/" + today() + "-" + id + "." + ext;
    if (/^image\//.test(ty))
      return putFile(path, blob)
        .then(function () {
          return mkThumb(blob);
        })
        .then(function (tb) {
          var o = { id: id, path: path, name: name, type: ty };
          if (!tb) return o;
          var tp = "photos/" + today() + "-" + id + "-t.jpg";
          return putFile(tp, tb).then(
            function () {
              o.thumb = tp;
              return o;
            },
            function () {
              return o;
            }
          );
        });
    return blobToB64(blob)
      .then(function (b64) {
        return api(path, { method: "PUT", body: JSON.stringify({ message: "Add " + path, content: b64 }) });
      })
      .then(function (r) {
        if (!r.ok) throw { http: r.status };
        try {
          PH[path] = URL.createObjectURL(blob);
          if (window.caches)
            caches.open("am-photos").then(function (c) {
              c.put("https://photos.local/" + path, new Response(blob, { headers: { "Content-Type": ty } }));
            });
        } catch (e) {}
        return { id: id, path: path, name: name, type: ty };
      });
  }

  function photoURL(path) {
    if (PH[path]) return Promise.resolve(PH[path]);
    var key = "https://photos.local/" + path;
    var fromCache = window.caches
      ? caches.open("am-photos").then(function (c) {
          return c.match(key);
        })
      : Promise.resolve(null);
    return fromCache
      .then(function (hit) {
        if (hit) return hit.blob();
        return api(path, { headers: { Accept: "application/vnd.github.raw" } })
          .then(function (r) {
            if (!r.ok) throw 0;
            return r.blob();
          })
          .then(function (bl) {
            if (window.caches)
              caches.open("am-photos").then(function (c) {
                c.put(key, new Response(bl));
              });
            return bl;
          });
      })
      .then(function (bl) {
        var ext = (path.split(".").pop() || "").toLowerCase(),
          ty = {
            mp4: "video/mp4",
            mov: "video/quicktime",
            jpg: "image/jpeg",
            png: "image/png",
            pdf: "application/pdf"
          }[ext];
        if (ty && bl.type !== ty) bl = new Blob([bl], { type: ty });
        PH[path] = URL.createObjectURL(bl);
        return PH[path];
      });
  }

  function hydrate() {
    if (!GH) return;
    document.querySelectorAll("[data-ph]").forEach(function (el) {
      var p = el.getAttribute("data-ph");
      if (!/^photos\//.test(p)) return;
      photoURL(p)
        .then(function (u) {
          el.src = u;
        })
        .catch(function () {});
    });
    document.querySelectorAll("[data-phv]").forEach(function (el) {
      var p = el.getAttribute("data-phv");
      if (!/^photos\//.test(p)) return;
      photoURL(p)
        .then(function (u) {
          el.src = u;
        })
        .catch(function () {});
    });
    document.querySelectorAll("[data-phl]").forEach(function (el) {
      var p = el.getAttribute("data-phl");
      if (!/^photos\//.test(p)) return;
      photoURL(p)
        .then(function (u) {
          el.href = u;
        })
        .catch(function () {});
    });
  }

  function keyErr(e) {
    return e && e.noaccess
      ? "This key can't see your data. Make a new key and under Repository access choose Only select repositories → your data repository, then Permissions → Contents: Read and write."
      : e && e.auth
        ? "That key didn't work (wrong or expired). Make a new one and paste it here."
        : "Could not reach GitHub. Check your internet connection.";
  }

  var APPV = "48";

  // Links that open GitHub with most of the form already filled in.
  var GH_NEW_REPO =
    "https://github.com/new?name=cat-data&visibility=private&description=" +
    encodeURIComponent("Private data for my cat app");
  var GH_NEW_KEY =
    "https://github.com/settings/personal-access-tokens/new?name=" +
    encodeURIComponent("Cat app on my phone") +
    "&description=" +
    encodeURIComponent("Lets the cat app read and save cat-data") +
    "&contents=write";

  function setupView() {
    var g = GH && !GH.local ? GH : {},
      inv = INVITE || {},
      ff = ui.ghform || {},
      host = location.hostname.match(/^([\w-]+)\.github\.io$/),
      mine = host && host[1] === "martinaregan",
      repo = inv.repo || (g.owner ? g.owner + "/" + g.repo : mine ? "martinaregan/albert-milly-data" : ""),
      showGh = !!(INVITE || ui.connect || g.owner || ui.gherr || ui.ghopen),
      lnk = function (href, txt) {
        return '<a href="' + href + '" target="_blank" rel="noopener" class="ghl">' + txt + " ›</a>";
      };
    return (
      '<div class="hero duo-h u-mt20"><div class="vs">' +
      spot("albert") +
      "<b>&amp;</b>" +
      spot("milly") +
      '</div><div class="u-ta-center u-fs24 u-fw900">' +
      (S && S.cats ? esc(S.cats.albert.name) + " &amp; " + esc(S.cats.milly.name) : "Albert &amp; Milly") +
      '</div><div class="sub u-ta-center u-mt4">Food, weight, health and friendship for two cats</div></div>' +
      (ui.connect
        ? '<button class="b ghost w u-mb12" data-a="connBack">‹ Back to the app</button>'
        : "") +
      (INVITE || ui.connect
        ? ""
        : '<div class="card"><h2>New here?</h2><div class="pl">Start straight away. Everything is saved on this phone, and you can connect GitHub later to back it up and share it with someone.</div>' +
          '<label class="l">Your name</label><input id="lname" autocomplete="given-name" placeholder="Shown next to what you log">' +
          '<button class="b p w u-mt14 u-p14" data-a="startLocal">Start</button><button class="b ghost w u-mt10" data-a="demo">Just looking? Try the demo</button></div>') +
      '<details class="card ghcard"' +
      (showGh ? " open" : "") +
      "><summary><h2 class=\"u-m0\">" +
      (INVITE ? "You've been invited" : ui.connect ? "Connect GitHub" : "Already set up, or sharing? Connect GitHub") +
      "</h2></summary>" +
      (INVITE
        ? '<div class="pl">The access key is already filled in. Type your name and tap <b>Connect</b>.</div>'
        : '<div class="note u-m0-0-10">Free. Your data goes in a private folder (a "repository") on your own GitHub account, so it syncs between phones and nobody else can see it.</div>' +
          '<ol class="ghsteps"><li>Make a free GitHub account if you don\'t have one. ' +
          lnk("https://github.com/signup", "Sign up") +
          "</li><li>Make a private repository for the data. The name and Private are filled in: just tap <b>Create repository</b>. " +
          lnk(GH_NEW_REPO, "Create it") +
          "</li><li>Make an access key. Most of it is filled in. Set <b>Expiration</b> to <b>No expiration</b> so it never stops working. Under <b>Repository access</b> choose <b>Only select repositories</b> and pick <b>cat-data</b>. Then tap <b>Generate token</b> and copy it. " +
          lnk(GH_NEW_KEY, "Create key") +
          "</li><li>Paste it here.</li></ol>") +
      '<label class="l">Access key</label><input id="ghtok" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="github_pat_…" value="' +
      esc(ff.tok || inv.token || "") +
      '"><label class="l">Your name</label><input id="ghname" autocomplete="given-name" placeholder="Shown next to what you log" value="' +
      esc(ff.who || (GH && GH.who) || ui.who || "") +
      '"><label class="l">Repository</label><input id="ghrepo" autocapitalize="off" spellcheck="false" placeholder="cat-data" value="' +
      esc(ff.repo != null ? ff.repo : repo) +
      '"><div class="note">Just the name is fine (cat-data). Use owner/name for someone else\'s.</div>' +
      '<button class="b p w u-mt14 u-p14" data-a="ghconnect">Connect</button><div class="note u-c-var---bad u-fw700" id="gherr">' +
      esc(ui.gherr || "") +
      "</div></details>" +
      '<div class="note u-ta-center">No server, no app account, no tracking. <a href="about/#privacy" class="u-c-b9a6ff">Privacy</a> · Version ' +
      APPV +
      "</div>"
    );
  }


