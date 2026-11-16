/* 00b-i18n: Languages. The app is written in English; tr() swaps the text of each screen for the chosen
   language just before it's shown, using lang/<code>.json: "t" (exact phrases) and "p" (patterns for phrases
   with numbers or names in them, as [regex, replacement]). Phrases with no translation stay in English. */
  var LANGS = [
    ["en", "English", "en-GB"],
    ["nl", "Nederlands", "nl-NL"]
    // Add a language: translate lang/nl.json's English keys into lang/<code>.json, then add it here.
  ];
  var LD = null; // loaded dictionary: { t: {}, p: [[RegExp, string]] }

  function lang() {
    try {
      return localStorage.getItem(LS + "-lang") || "en";
    } catch (e) {
      return "en";
    }
  }

  function LOC() {
    var l = lang();
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i][0] === l) return LANGS[i][2];
    return "en-GB";
  }

  function setDict(j) {
    LD = {
      t: j.t || {},
      p: (j.p || []).map(function (x) {
        // Replacements use \1, \2… for the matched parts.
        return [new RegExp("^" + x[0] + "$"), x[1]];
      })
    };
  }

  // Load the chosen language (kept on the phone so it works offline), then redraw.
  function loadLang(cb) {
    var l = lang();
    LD = null;
    document.documentElement.lang = l;
    if (l === "en") return cb && cb();
    try {
      var c = localStorage.getItem(LS + "-lang-" + l);
      if (c) setDict(JSON.parse(c));
    } catch (e) {}
    fetch("lang/" + l + ".json", { cache: "no-cache" })
      .then(function (r) {
        return r.ok ? r.text() : null;
      })
      .then(function (tx) {
        if (!tx) return;
        try {
          localStorage.setItem(LS + "-lang-" + l, tx);
        } catch (e) {}
        setDict(JSON.parse(tx));
        if (cb) cb();
      })
      .catch(function () {});
    if (cb && LD) cb();
  }

  // Apply a pattern; matched parts that are known phrases ("Night") get translated too.
  function pat(p, txt) {
    var m = txt.match(p[0]);
    return p[1].replace(/\\(\d)/g, function (a, n) {
      var g = m[+n] || "";
      return LD.t[g] != null ? LD.t[g] : g;
    });
  }

  function tr1(s) {
    var k = s.trim();
    if (!k || !/[A-Za-z]/.test(k)) return s;
    var out = LD.t[k];
    if (out == null) {
      // Keep emoji and symbols around the words: "🚨 Urgent?" -> "🚨 " + "Urgent?"
      var m = k.match(/^([^A-Za-z(]*?)([A-Za-z(][\s\S]*?)([\s:·,.…›‹]*)$/);
      if (m && m[1] + m[3]) {
        var mid = LD.t[m[2]];
        if (mid == null)
          for (var j = 0; j < LD.p.length; j++)
            if (LD.p[j][0].test(m[2])) {
              mid = pat(LD.p[j], m[2]);
              break;
            }
        if (mid != null) out = m[1] + mid + m[3];
      }
      if (out == null)
        for (var i = 0; i < LD.p.length; i++)
          if (LD.p[i][0].test(k)) {
            out = pat(LD.p[i], k);
            break;
          }
    }
    // "A · B · C": translate the parts one by one.
    if (out == null && k.indexOf(" · ") > 0) {
      var parts = k.split(" · "),
        any = false;
      parts = parts.map(function (x) {
        var y = tr1(x);
        if (y !== x) any = true;
        return y;
      });
      if (any) out = parts.join(" · ");
    }
    if (out == null) return s;
    return s.replace(k, function () {
      return out;
    });
  }

  // Translate an HTML string: text between tags, and placeholder / aria-label / title attributes.
  function tr(html) {
    if (!LD || !html) return html;
    return String(html)
      .replace(/>([^<>]+)</g, function (m, t) {
        // Look phrases up with &amp; and &#39; decoded ("To do & coming up"), then encode again.
        if (!/&(amp|#39|quot);/.test(t)) return ">" + tr1(t) + "<";
        var d = t.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
          o = tr1(d);
        return ">" + (o === d ? t : o.replace(/&/g, "&amp;").replace(/</g, "&lt;")) + "<";
      })
      .replace(/(placeholder|aria-label|title)="([^"]*)"/g, function (m, a, t) {
        return a + '="' + tr1(t) + '"';
      });
  }

  // Plain text (toasts, alerts).
  function trt(s) {
    return LD ? tr1(String(s)) : s;
  }
