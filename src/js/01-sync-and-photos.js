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
        if (r.status === 401 || r.status === 403) throw { auth: 1 };
        if (r.status === 404) throw { noaccess: 1 };
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
    if (!GH || !S || pushing || !dirty) return;
    pushing = true;
    var snap = JSON.parse(JSON.stringify(S));
    api("data.json", {
      method: "PUT",
      body: JSON.stringify({
        message: "Update from " + (GH.who || "phone"),
        content: b64e(JSON.stringify(snap, null, 1)),
        sha: SHA || undefined
      })
    })
      .then(function (r) {
        if (r.status === 409 || r.status === 422) return "conflict";
        if (r.status === 401 || r.status === 403) throw { auth: 1 };
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
            ? "Access key not working"
            : navigator.onLine === false
              ? "Offline, will sync"
              : "Not synced yet, retrying"
        );
        setTimeout(push, 15000);
      });
  }

  function sync() {
    if (!GH || pushing) return Promise.resolve();
    return pull()
      .then(function (p) {
        if (!p) {
          if (S) {
            dirty = true;
            push();
          }
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
      ? "This key can't see your data. Make a new key and under Repository access choose Only select repositories → albert-milly-data, then Permissions → Contents: Read and write."
      : e && e.auth
        ? "That key didn't work (wrong or expired). Make a new one and paste it here."
        : "Could not reach GitHub. Check your internet connection.";
  }

  var APPV = "25";

  function setupView() {
    var g = GH || {};
    return (
      '<div class="hero duo-h" style="margin-top:20px"><div class="vs">' +
      spot("albert") +
      "<b>&amp;</b>" +
      spot("milly") +
      '</div><div style="text-align:center;font-size:24px;font-weight:900">Albert &amp; Milly</div><div class="sub" style="text-align:center;margin-top:4px">Connect this phone to your data</div></div>' +
      '<div class="card"><h2>One-time setup</h2><div class="pl">1. Tap <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener" style="color:#b9a6ff"><b>Create access key</b></a> and sign in to GitHub.</div>' +
      '<div class="pl">2. Name it after this phone (e.g. <i>My iPhone</i>). Expiration: the longest option.</div><div class="pl">3. Repository access: <b>Only select repositories</b> → <b>albert-milly-data</b>.</div>' +
      '<div class="pl">4. Permissions → Repository permissions → <b>Contents: Read and write</b>.</div><div class="pl">5. Tap <b>Generate token</b>, copy it and paste it below.</div>' +
      '<label class="l">Access key</label><input id="ghtok" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="github_pat_…"><label class="l">Your name</label><input id="ghname" autocomplete="name" placeholder="Shown next to everything you log" value="' +
      esc(ui.who || "") +
      '">' +
      '<details style="margin-top:10px"><summary class="mute small">Advanced</summary><label class="l">Data repository</label><input id="ghrepo" value="' +
      esc((g.owner || "martinaregan") + "/" + (g.repo || "albert-milly-data")) +
      '"></details>' +
      '<button class="b p w" style="margin-top:14px;padding:14px" data-a="ghconnect">Connect</button><div class="note" id="gherr" style="color:var(--bad);font-weight:700">' +
      esc(ui.gherr || "") +
      '</div><div class="note">Version ' +
      APPV +
      "</div></div>"
    );
  }
