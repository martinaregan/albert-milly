/* 14b-sitter: The sitter sheet: one printable page for a cat hotel or sitter, built from the live plans, profiles and contacts. */
// Split "Heading:" + "- bullet" text (plans, profiles) into sections.
function secsOf(t) {
  var out = [],
    cur = null;
  String(t || "")
    .split("\n")
    .forEach(function (l) {
      if (!l.trim()) return;
      var hd = l.match(/^\s*([^:\-•*](?:[^:]|:(?=\d\d)){0,39}):\s*$/),
        b = l.match(/^\s*[-•*]\s+(.*)$/);
      if (hd) out.push((cur = { k: hd[1].trim(), v: [] }));
      else {
        if (!cur) out.push((cur = { k: "", v: [] }));
        cur.v.push(b ? b[1] : l.trim());
      }
    });
  return out;
}

// The current or next stay, if any.
function nextStay() {
  var t = today();
  return ((S.info && S.info.bookings) || [])
    .filter(function (b) {
      return b.from && (b.to || b.from) >= t;
    })
    .sort(function (a, b) {
      return a.from < b.from ? -1 : 1;
    })[0];
}

function sitterBlocks() {
  var st = nextStay(),
    B = [],
    I = S.info || {},
    longD = function (d) {
      return parse(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    };
  if (st)
    B.push({
      h: "Stay",
      l: [
        longD(st.from) + " to " + longD(st.to || st.from) + (st.place ? " at " + st.place : ""),
        (st.cats || []).length ? "Cats: " + st.cats.join(" and ") : ""
      ]
    });
  if (S.sitterNote)
    B.push({
      h: "Important",
      l: secsOf(S.sitterNote).reduce(function (a, s) {
        return a.concat((s.k ? [s.k + ":"] : []).concat(s.v));
      }, [])
    });
  ["albert", "milly"].forEach(function (k) {
    var c = S.cats[k],
      w = sorted(c),
      lw = w[w.length - 1],
      prof = secsOf((S.profiles || {})[k]),
      chip = String((S.profiles || {})[k] || "").match(/Microchip\s*(?:no\.?|number)?[:\s]*(\d[\d\s]{8,})/i),
      l = [];
    var about = [];
    if (c.born) about.push(ageText(c) + " old");
    if (lw) about.push((+lw.kg).toFixed(1) + " kg");
    if (chip) about.push("microchip " + chip[1].replace(/\s/g, ""));
    if (about.length) l.push(about.join(" · "));
    secsOf(c.plan)
      .filter(function (s) {
        return !/weight|goal/i.test(s.k);
      })
      .forEach(function (s) {
        l.push({
          h: s.k || "Food",
          v: s.v.filter(function (x) {
            return !/log .*in the app/i.test(x);
          })
        });
      });
    prof
      .filter(function (s) {
        return /personality|health|behaviour|likes/i.test(s.k);
      })
      .forEach(function (s) {
        l.push({ h: s.k, v: s.v });
      });
    ["Worming", "Flea"].forEach(function (ty) {
      var d = treatDue(c, ty);
      if (d && st && d.next >= st.from && d.next <= (st.to || st.from))
        l.push(ty + " treatment due " + longD(d.next) + " (product is packed)");
    });
    B.push({ h: c.name, k: k, l: l });
  });
  var v = I.vet || {};
  if (v.clinic || v.phone)
    B.push({
      h: "Vet",
      l: [
        v.clinic,
        v.address,
        v.phone ? "Phone " + v.phone : "",
        v.hours ? "Open: " + v.hours.replace(/\n/g, "; ") : ""
      ]
    });
  var ins = I.insurance || {};
  if (ins.provider || ins.policyAlbert || ins.policyMilly)
    B.push({
      h: "Insurance",
      l: [
        ins.provider,
        ins.policyAlbert ? S.cats.albert.name + ": policy " + ins.policyAlbert : "",
        ins.policyMilly ? S.cats.milly.name + ": policy " + ins.policyMilly : ""
      ]
    });
  B.forEach(function (b) {
    b.l = b.l.filter(function (x) {
      return x && (typeof x === "string" || x.v.length);
    });
  });
  return B;
}

function sitterText(B) {
  return (
    S.cats.albert.name +
    " & " +
    S.cats.milly.name +
    " · care sheet\n\n" +
    B.map(function (b) {
      return (
        b.h.toUpperCase() +
        "\n" +
        b.l
          .map(function (x) {
            return typeof x === "string"
              ? "- " + x
              : x.h +
                  ":\n" +
                  x.v
                    .map(function (y) {
                      return "  - " + y;
                    })
                    .join("\n");
          })
          .join("\n")
      );
    }).join("\n\n")
  );
}

function sitterSheet() {
  var B = sitterBlocks();
  ui.vrtext = sitterText(B);
  return (
    '<div class="modal vrm" data-a="close"><div class="sheet vrep sit" data-stop="1"><div class="row between u-nowrap"><h2 class="u-m0">📄 Care sheet</h2><button class="x noprint" data-a="close">✕</button></div>' +
    "<div class=\"note noprint\">For a cat hotel or sitter. It's built from the cats' plans, profiles and Info, so it's always up to date.</div>" +
    B.map(function (b) {
      return (
        '<div class="sitb' +
        (b.k ? " " + b.k : "") +
        '"><h3>' +
        (b.k ? spot(b.k) : "") +
        esc(b.h) +
        "</h3>" +
        b.l
          .map(function (x) {
            return typeof x === "string"
              ? '<p class="sitl">' + esc(x) + "</p>"
              : "<h4>" +
                  esc(x.h) +
                  "</h4><ul>" +
                  x.v
                    .map(function (y) {
                      return "<li>" + esc(y) + "</li>";
                    })
                    .join("") +
                  "</ul>";
          })
          .join("") +
        "</div>"
      );
    }).join("") +
    '<details class="noprint u-mt10"' +
    (S.sitterNote ? "" : " open") +
    '><summary class="mute small">Edit the important notes</summary><textarea data-sitnote="1" rows="7" placeholder="Keep them apart at mealtimes&#10;Milly is shy: give her a quiet room&#10;My phone: …">' +
    esc(S.sitterNote || "") +
    "</textarea></details>" +
    '<div class="row noprint u-mt16"><button class="b p" data-a="vrshare" data-v="Care sheet">Share</button><button class="b" data-a="vrprint">Print / PDF</button><button class="b" data-a="close">Close</button></div></div></div>'
  );
}
