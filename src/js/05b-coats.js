/* 05b-coats: Your cats, your colours. A coat (pattern + fur, eye and app colours) draws each cat's face and sets the app's colours. Cats without a coat keep the hand-drawn Albert and Milly faces. */
  var FUR = [
    ["Black", "#1e1e1e"],
    ["White", "#fbf8f4"],
    ["Ginger", "#e8822f"],
    ["Cream", "#f1d3a6"],
    ["Grey", "#8d9198"],
    ["Blue-grey", "#6f7d8c"],
    ["Brown", "#7a5233"],
    ["Chocolate", "#5a3a28"],
    ["Cinnamon", "#a8643a"],
    ["Fawn", "#cdb39a"],
    ["Silver", "#c7c9cc"],
    ["Seal", "#4a3628"]
  ];
  var EYES = [
    ["Green", "#8fbf5a"],
    ["Yellow", "#e2b93b"],
    ["Copper", "#c97a2b"],
    ["Blue", "#6aa7e0"],
    ["Hazel", "#a58b4a"]
  ];
  var THEMES = [
    "#e07a2e",
    "#c9453b",
    "#a24a6c",
    "#7a5af8",
    "#3f6fb5",
    "#2f8f8a",
    "#3e9a63",
    "#8a6a2e",
    "#3b3b3b"
  ];
  var COATS = [
    ["solid", "One colour"],
    ["bicolour", "Colour & white"],
    ["tuxedo", "Tuxedo"],
    ["tabby", "Tabby"],
    ["tortie", "Tortoiseshell"],
    ["calico", "Calico"],
    ["point", "Colourpoint"],
    ["van", "Van (mostly white)"]
  ];
  // Breed presets: pattern, main fur, second fur, eyes. Everything stays editable.
  var BREEDS = [
    ["Siamese", "point", "#f1e3cc", "#4a3628", "#6aa7e0"],
    ["Ragdoll", "point", "#f4ead9", "#6f7d8c", "#6aa7e0"],
    ["Birman", "point", "#f2e6d2", "#5a3a28", "#6aa7e0"],
    ["British Shorthair", "solid", "#6f7d8c", "", "#c97a2b"],
    ["Russian Blue", "solid", "#7d8a98", "", "#8fbf5a"],
    ["Bombay", "solid", "#1e1e1e", "", "#c97a2b"],
    ["Persian (white)", "solid", "#fbf8f4", "", "#6aa7e0"],
    ["Maine Coon", "tabby", "#8a6646", "#3b2a1c", "#e2b93b"],
    ["Norwegian Forest", "tabby", "#a9a6a0", "#4a4642", "#8fbf5a"],
    ["Bengal", "tabby", "#d9a35a", "#4a3020", "#8fbf5a"],
    ["Abyssinian", "tabby", "#b8703c", "#6a3a1c", "#a58b4a"],
    ["Scottish Fold", "solid", "#8d9198", "", "#c97a2b"],
    ["Sphynx", "solid", "#e8c4b0", "", "#8fbf5a"],
    ["Turkish Van", "van", "#e8822f", "", "#e2b93b"]
  ];

  var HEAD =
    "M4.2 9.2 5 2.6 9.6 6.2Q12 5.4 14.4 6.2L19 2.6 19.8 9.2Q21 13.2 19 16.8 16.4 21 12 21 7.6 21 5 16.8 3 13.2 4.2 9.2Z";

  function lum(h) {
    var n = parseInt(String(h).slice(1), 16);
    return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  }

  function mix(h, t, f) {
    var a = parseInt(h.slice(1), 16),
      b = parseInt(t.slice(1), 16),
      o = [16, 8, 0].map(function (s) {
        return Math.round(((a >> s) & 255) * (1 - f) + ((b >> s) & 255) * f);
      });
    return "#" + ((1 << 24) | (o[0] << 16) | (o[1] << 8) | o[2]).toString(16).slice(1);
  }

  // Face SVG for a coat. Patches are clipped to the head shape.
  function coatFace(co, label) {
    var a = co.a || "#8d9198",
      b = co.b || mix(a, "#000000", 0.45),
      W = "#fbf8f4",
      id = "cf" + (co.p || "solid") + a.slice(1) + b.slice(1),
      base = /^(bicolour|calico|van)$/.test(co.p) ? W : a,
      ear = lum(base) < 0.35 ? "#c98a95" : "#f2b29a",
      P = "";
    function blob(d, f) {
      P += '<path d="' + d + '" fill="' + f + '"/>';
    }
    if (co.p === "bicolour")
      blob(
        "M4.2 9.2 5 2.6 9.6 6.2Q12 5.4 14.4 6.2L19 2.6 19.8 9.2Q20.1 11.6 19.4 13.5Q18.2 12.6 16.7 11.9Q15.3 12.2 13.9 11.4L12 7.8 10.1 11.4Q8.7 12.2 7.3 11.9Q5.8 12.6 4.6 13.5Q3.9 11.6 4.2 9.2Z",
        a
      );
    if (co.p === "tuxedo")
      blob("M12 10.2Q9.6 12.6 9 16.2 8.8 19.2 12 21 15.2 19.2 15 16.2 14.4 12.6 12 10.2Z", W);
    if (co.p === "tabby") {
      P +=
        '<path d="M9.4 6.6 10.2 9.4M12 6 12 9.2M14.6 6.6 13.8 9.4M4.6 12.6 7.4 13.2M4.9 14.6 7.4 14.4M19.4 12.6 16.6 13.2M19.1 14.6 16.6 14.4" stroke="' +
        b +
        '" stroke-width="1.1" stroke-linecap="round" fill="none"/>';
    }
    if (co.p === "tortie") {
      blob("M3 6Q7 4 10.6 7.4 10.2 11 7 12.4 4.4 12.2 3 9Z", b);
      blob("M13.4 13.4Q17 11.6 21 13.6 20.2 18.4 15.6 20.2 13 17.6 13.4 13.4Z", b);
    }
    if (co.p === "calico") {
      blob("M3 2Q8 3 10.8 7.6 9.6 10.6 6.4 11.2 3.6 10.4 3 7Z", a);
      blob("M13.2 7Q16 3 21 2 21.4 9 19.6 12.4 16 12 13.2 7Z", b);
    }
    if (co.p === "point") {
      blob("M12 10Q7.6 10.4 7.4 14.4 8.4 19 12 19.6 15.6 19 16.6 14.4 16.4 10.4 12 10Z", b);
      blob("M4.2 9.2 5 2.6 9.6 6.2 7 7.4Z", b);
      blob("M19.8 9.2 19 2.6 14.4 6.2 17 7.4Z", b);
    }
    if (co.p === "van") {
      blob("M4.2 9.2 5 2.6 9.6 6.2Q9.6 8.6 7.6 9.4 5.6 9.8 4.2 9.2Z", a);
      blob("M19.8 9.2 19 2.6 14.4 6.2Q14.4 8.6 16.4 9.4 18.4 9.8 19.8 9.2Z", a);
    }
    var eye = co.e || "#8fbf5a",
      ln = lum(base) < 0.25 ? "#55504c" : "#6b6560";
    return (
      '<svg class="spot" viewBox="0 0 24 24" aria-label="' +
      esc(label || "") +
      '"><defs><clipPath id="' +
      id +
      '"><path d="' +
      HEAD +
      '"/></clipPath></defs><path d="' +
      HEAD +
      '" fill="' +
      base +
      '"/><g clip-path="url(#' +
      id +
      ')">' +
      P +
      '</g><path d="M5.7 4.1 6.1 7.3 8.6 6.1Z" fill="' +
      ear +
      '"/><path d="M18.3 4.1 17.9 7.3 15.4 6.1Z" fill="' +
      ear +
      '"/><path d="' +
      HEAD +
      '" fill="none" stroke="' +
      ln +
      '" stroke-width="1.1" stroke-linejoin="round"/><ellipse cx="9" cy="13.2" rx="1.1" ry="1.4" fill="' +
      eye +
      '"/><ellipse cx="15" cy="13.2" rx="1.1" ry="1.4" fill="' +
      eye +
      '"/><path d="M11.2 16h1.6l-.8 .9z" fill="#e88a9a"/></svg>'
    );
  }

  // App colour for a cat: the chosen theme, else the main fur if it's colourful, else a default.
  function themeOf(k) {
    var co = S && S.cats[k] && S.cats[k].coat;
    if (!co) return null;
    if (co.t) return co.t;
    var a = co.a || "#8d9198",
      n = parseInt(a.slice(1), 16),
      r = (n >> 16) & 255,
      g = (n >> 8) & 255,
      bl = n & 255,
      sat = Math.max(r, g, bl) - Math.min(r, g, bl);
    return sat > 70 && lum(a) < 0.75 ? a : k === "albert" ? "#3f6fb5" : "#a24a6c";
  }

  // Colours for charts and bars.
  function colOf(k) {
    return themeOf(k) || (k === "albert" ? "#e07a2e" : "var(--ink)");
  }

  var lastTheme = null;
  function applyTheme() {
    var css = "";
    ["albert", "milly"].forEach(function (k) {
      var t = themeOf(k);
      if (!t) return;
      var d = lum(t) > 0.6 ? mix(t, "#000000", 0.35) : t,
        on = "#fff";
      css +=
        ":root{--" +
        k +
        ":" +
        d +
        ";--g-" +
        k +
        ":linear-gradient(135deg," +
        mix(d, "#ffffff", 0.22) +
        " 0%," +
        d +
        " 60%," +
        mix(d, "#000000", 0.18) +
        " 100%)}" +
        (function () {
          // Dark-mode colours: for Automatic (inside the media query) and for a forced Dark setting.
          var dk = function (c) {
            return (
              ":root:where(" +
              c +
              "){--g-" +
              k +
              ":linear-gradient(135deg," +
              mix(d, "#000000", 0.55) +
              " 0%," +
              mix(d, "#000000", 0.65) +
              " 60%," +
              mix(d, "#000000", 0.72) +
              " 100%)}:where(html" +
              c +
              ") body." +
              k +
              "{--accent:" +
              mix(d, "#ffffff", 0.25) +
              "!important;--onaccent:#fff!important}"
            );
          };
          return "@media (prefers-color-scheme: dark){" + dk(":not(.light)") + "}" + dk(".dark");
        })() +
        "body." +
        k +
        "{--accent:" +
        d +
        "!important;--onaccent:" +
        on +
        "!important}";
    });
    if (css === lastTheme) return;
    lastTheme = css;
    var el = document.getElementById("cattheme");
    if (!el) {
      el = document.createElement("style");
      el.id = "cattheme";
      document.head.appendChild(el);
    }
    el.textContent = css;
  }

  // Photo colour picker: show the photo, tap the fur to pick colours.
  function hexOf(r, g, b) {
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  // White fur: pale and not colourful, or (in a dim photo) much paler than the other colour.
  function isWhite(h, other) {
    var n = parseInt(h.slice(1), 16),
      r = (n >> 16) & 255,
      g = (n >> 8) & 255,
      b = n & 255,
      grey = Math.max(r, g, b) - Math.min(r, g, b) < Math.max(45, Math.max(r, g, b) * 0.38);
    return grey && (lum(h) > 0.72 || (other && lum(h) - lum(other) > 0.3 && lum(h) > 0.4));
  }

  // Guess the pattern from the picked colours: [main, second?]
  function guessCoat(cols) {
    var a = cols[0],
      b = cols[1];
    if (!b) return { p: "solid", a: a };
    if (isWhite(a, b) && !isWhite(b, a)) {
      var t = a;
      a = b;
      b = t;
    }
    if (isWhite(b, a)) return { p: lum(a) < 0.25 ? "tuxedo" : "bicolour", a: lum(a) < 0.2 ? "#1e1e1e" : a };
    var warm = function (h) {
      var n = parseInt(h.slice(1), 16);
      return ((n >> 16) & 255) - (n & 255) > 50;
    };
    return { p: warm(a) !== warm(b) ? "tortie" : "tabby", a: a, b: b };
  }

  function pickSheet() {
    var pk = ui.pick,
      step = pk.cols.length;
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><div class="row between u-nowrap"><h2 class="u-m0">' +
      (step ? "Now a second colour" : "Tap their fur") +
      '</h2><button class="x" data-a="close">✕</button></div><div class="note">' +
      (step
        ? "Tap the white bits, stripes or patches. If they're all one colour, tap Done."
        : "Tap the main colour of " + esc(S.cats[pk.k].name) + "'s fur.") +
      '</div><div class="pkwrap"><img id="pkimg" src="' +
      pk.url +
      '" alt="" data-a="pktap"></div>' +
      '<div class="row between u-mt10"><span class="row u-gap6">' +
      pk.cols
        .map(function (c) {
          return '<i class="pkc" style="background:' + c + '"></i>';
        })
        .join("") +
      '</span><span class="row u-gap6">' +
      (step ? '<button class="b s ghost" data-a="pkundo">Undo</button>' : "") +
      '<button class="b s p" data-a="pkdone"' +
      (step ? "" : " disabled") +
      ">Done</button></span></div></div></div>"
    );
  }

  // Settings card: pattern, breed, colours, photo.
  function coatCard(k) {
    var c = S.cats[k],
      co = c.coat || null,
      cur = co || { p: "solid", a: "#8d9198" };
    function sw(list, field, val) {
      return (
        '<div class="sws">' +
        list
          .map(function (x) {
            var v = x[1] || x;
            return (
              '<button class="sw' +
              (String(val).toLowerCase() === v.toLowerCase() ? " on" : "") +
              '" style="background:' +
              v +
              '" data-a="coatset" data-v="' +
              field +
              "|" +
              v +
              '" aria-label="' +
              esc(x[0] || v) +
              '"></button>'
            );
          })
          .join("") +
        "</div>"
      );
    }
    var needsB = /^(tabby|tortie|calico|point)$/.test(cur.p);
    return (
      '<div class="card coatc"><h2>🎨 ' +
      esc(c.name) +
      "'s look</h2>" +
      '<div class="note u-m0-0-10">Pick a coat and the face and app colours follow. Or start from a photo or a breed.</div>' +
      '<div class="row u-gap8 u-mb10"><button class="b s p" data-a="coatphoto">📷 From a photo</button><select data-coatbreed="1"><option value="">Breed…</option>' +
      BREEDS.map(function (b) {
        return "<option" + (co && co.breed === b[0] ? " selected" : "") + ">" + esc(b[0]) + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="coats">' +
      (k === "albert" || k === "milly"
        ? '<button class="coat' +
          (!co ? " on" : "") +
          '" data-a="coatset" data-v="p|orig"><span class="cimg">' +
          spot0(k) +
          "</span><span>Original</span></button>"
        : "") +
      COATS.map(function (p) {
        return (
          '<button class="coat' +
          (co && co.p === p[0] ? " on" : "") +
          '" data-a="coatset" data-v="p|' +
          p[0] +
          '"><span class="cimg">' +
          coatFace({ p: p[0], a: cur.a, b: cur.b, e: cur.e }, p[1]) +
          "</span><span>" +
          esc(p[1]) +
          "</span></button>"
        );
      }).join("") +
      "</div>" +
      (co
        ? '<label class="l">Main fur</label>' +
          sw(FUR, "a", co.a || "") +
          (needsB
            ? '<label class="l">' +
              (co.p === "point" ? "Points" : co.p === "tabby" ? "Stripes" : "Patches") +
              "</label>" +
              sw(FUR, "b", co.b || "")
            : "") +
          '<label class="l">Eyes</label>' +
          sw(EYES, "e", co.e || "") +
          '<label class="l">App colour</label>' +
          sw(THEMES, "t", themeOf(k))
        : "") +
      '<input type="file" accept="image/*" id="coatIn" data-k="' +
      k +
      '" hidden></div>'
    );
  }
