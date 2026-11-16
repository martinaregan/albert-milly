/* 14-info: The Info tab: contacts, profiles, bookings. */
  function infoField(sec, key, label, type) {
    var v = S.info[sec][key] || "";
    return (
      '<label class="l">' +
      label +
      "</label>" +
      (type === "area"
        ? '<textarea rows="3" data-info="' + sec + "." + key + '">' + esc(v) + "</textarea>"
        : '<input data-info="' +
          sec +
          "." +
          key +
          '" value="' +
          esc(v) +
          '"' +
          (type === "num" ? ' inputmode="decimal"' : type ? ' type="' + type + '"' : "") +
          ">")
    );
  }

  function contactLinks(o) {
    var out = [];
    if (o.phone)
      out.push('<a href="tel:' + esc(o.phone.replace(/\s/g, "")) + '">📞 ' + esc(o.phone) + "</a>");
    if (o.email) out.push('<a href="mailto:' + esc(o.email) + '">✉️ ' + esc(o.email) + "</a>");
    if (o.address)
      out.push(
        '<a href="https://maps.apple.com/?q=' +
          encodeURIComponent(o.address) +
          '" target="_blank" rel="noopener">📍 Map</a>'
      );
    return out.length
      ? '<div class="row small u-mt8 u-gap14">' + out.join("") + "</div>"
      : "";
  }

  function fmtText(t) {
    var lines = (t || "").split("\n").filter(function (x) {
      return x.trim();
    });
    if (!lines.length) return '<div class="pl mute">Nothing yet. Tap Edit to add.</div>';
    var out = "",
      ul = false;
    lines.forEach(function (l) {
      var b = l.match(/^\s*[-•*]\s+(.*)$/);
      if (b) {
        if (!ul) {
          out += '<ul class="rvl">';
          ul = true;
        }
        out += "<li>" + esc(b[1]) + "</li>";
        return;
      }
      if (ul) {
        out += "</ul>";
        ul = false;
      }
      var hd = l.match(/^\s*([^:]{1,40}):\s*$/);
      if (hd) {
        out += '<div class="rvh">' + esc(hd[1]) + "</div>";
        return;
      }
      var m = l.match(/^([A-Z][A-Za-z /()]{1,26}):\s*(.*)$/);
      out += m
        ? '<div class="kv"><span class="k">' +
          esc(m[1]) +
          '</span><span class="v">' +
          esc(m[2]) +
          "</span></div>"
        : '<div class="pl">' + esc(l) + "</div>";
    });
    if (ul) out += "</ul>";
    return out;
  }

  function editBtn(key) {
    return (
      '<button class="b s ghost" data-a="tedit" data-v="' +
      key +
      '">' +
      (ui.edit && ui.edit[key] ? "✓ Done" : "✎ Edit") +
      "</button>"
    );
  }

  function editing(key) {
    return !!(ui.edit && ui.edit[key]);
  }

  function ciRow(ic, label, val, href) {
    if (!val) return "";
    return href
      ? '<a class="ci" href="' +
          esc(href) +
          '" target="_blank" rel="noopener"><span class="ic">' +
          ic +
          '</span><span><span class="t">' +
          label +
          '</span><br><span class="val">' +
          esc(val) +
          "</span></span></a>"
      : '<div class="ci"><span class="ic">' +
          ic +
          '</span><span><span class="t">' +
          label +
          '</span><br><span class="val">' +
          esc(val) +
          "</span></span></div>";
  }

  function contactRows(o) {
    return (
      ciRow(
        "📍",
        "Address",
        o.address,
        o.address ? "https://maps.apple.com/?q=" + encodeURIComponent(o.address) : ""
      ) +
      ciRow("📞", "Phone", o.phone, o.phone ? "tel:" + o.phone.replace(/\s/g, "") : "") +
      ciRow("✉️", "Email", o.email, o.email ? "mailto:" + o.email : "")
    );
  }

  function infoSub(sec, o, name) {
    try {
      var t = today();
      if (sec === "hotel") {
        var nx = (S.info.bookings || [])
          .filter(function (b) {
            return b && b.from && (b.to || b.from) >= t;
          })
          .sort(function (a, b) {
            return a.from < b.from ? -1 : 1;
          })[0];
        if (nx)
          return (
            name +
            " · " +
            (nx.from <= t ? "staying now" : "next stay in " + daysBetween(t, nx.from) + " days")
          );
      }
      if (sec === "vet") {
        var lv = "";
        ["albert", "milly"].forEach(function (k) {
          (S.cats[k].vet || []).forEach(function (v) {
            if (v.d && v.d > lv) lv = v.d;
          });
        });
        if (lv) return name + " · last visit " + short(lv) + (o.phone ? " · " + o.phone : "");
      }
      if (sec === "insurance") {
        var tot =
          (parseFloat(String(o.premiumAlbert || "").replace(",", ".")) || 0) +
          (parseFloat(String(o.premiumMilly || "").replace(",", ".")) || 0);
        return name + (tot ? " · €" + tot.toFixed(2) + " a month" : " · 2 policies");
      }
    } catch (e) {}
    return o.name || o.clinic || o.provider ? name : "Tap to add details";
  }

  function infoCard(sec, title, fields, view, after) {
    var o = S.info[sec],
      key = "info-" + sec,
      sp = title.indexOf(" "),
      icon = title.slice(0, sp),
      name = title.slice(sp + 1),
      sub = o.name || o.clinic || o.provider || "Tap to add details",
      G =
        { hotel: "#f6a25e,#d4622a", vet: "#ffffff,#e7e5e4", insurance: "#52525b,#18181b" }[sec] ||
        "#64748b,#334155",
      ed = editing(key),
      nf = o.att && o.att.length ? o.att.length : 0;
    var h =
      '<details class="catcard catd icard" data-open="' +
      key +
      '"' +
      (ed ? " open" : isOpen(key, false)) +
      '><summary class="head"><span class="ihic" style="background:linear-gradient(135deg,' +
      G +
      ')">' +
      icon +
      '</span><div><em class="itype it-' +
      sec +
      '">' +
      esc(name) +
      "</em><b>" +
      esc(o.name || o.clinic || o.provider || name) +
      "</b><span>" +
      esc(
        infoSub(sec, o, name)
          .replace(name + " · ", "")
          .replace(name, "")
      ) +
      '</span><i class="ihint">📋 ' +
      ({
        hotel: "Address · phone · what to bring",
        vet: "Address · phone · visits",
        insurance: "Policies · numbers · premiums"
      }[sec] || "Details") +
      "</i></div></summary>" +
      '<div class="row u-jc-flex-end">' +
      editBtn(key) +
      "</div>" +
      (ed
        ? fields
            .map(function (f) {
              return infoField(sec, f[0], f[1], f[2]);
            })
            .join("")
        : '<div class="u-mt4">' + view(o) + "</div>");
    return (
      h +
      '<details class="nf" data-open="' +
      key +
      '-more"' +
      isOpen(key + "-more", false) +
      "><summary><span>📎 Notes &amp; files" +
      (nf ? ' <span class="nfc">' + nf + "</span>" : "") +
      "</span></summary>" +
      (o.notes ? fmtText(o.notes) : "") +
      (nf ? thumbs(o.att, "info-" + sec) : "") +
      '<div class="u-mt10">' +
      upBtn("info", sec, "📎 Add file", "image/*,application/pdf") +
      "</div>" +
      (after || "") +
      "</details></details>"
    );
  }

  function infoData() {
    var I = (S.info = S.info && typeof S.info === "object" ? S.info : {});
    if (!Array.isArray(I.bookings)) I.bookings = [];
    I.bookings = I.bookings.filter(function (b) {
      return b && typeof b === "object";
    });
    I.bookings.forEach(function (b) {
      if (!b.id) b.id = uid();
      if (!Array.isArray(b.cats)) b.cats = [];
      b.cats = b.cats.map(function (x) {
        var n = String(x).toLowerCase();
        return S.cats[n] ? S.cats[n].name : String(x);
      });
    });
    ["hotel", "vet", "insurance"].forEach(function (k) {
      if (!I[k] || typeof I[k] !== "object") I[k] = {};
    });
    if (!S.profiles || typeof S.profiles !== "object") S.profiles = {};
    return I;
  }

  function bookingTicket(b, I, t) {
    var from = b.from || "",
      to = b.to || from,
      n = from ? Math.max(1, daysBetween(from, to)) : 0,
      away = from && from > t ? daysBetween(t, from) : 0,
      now = from && from <= t && to >= t,
      cats = Array.isArray(b.cats) ? b.cats : [],
      done = b.status === "Confirmed" || b.status === "Paid",
      files = (Array.isArray(b.att) ? b.att.length : 0) + (b.notes ? 1 : 0);
    var d1 = from ? parse(from) : null,
      d2 = to ? parse(to) : null,
      mo = function (d) {
        return d.toLocaleDateString(LOC(), { month: "short" });
      },
      range = !from
        ? "No dates"
        : from === to
          ? d1.getDate() + " " + mo(d1)
          : d1.getDate() + (mo(d1) !== mo(d2) ? " " + mo(d1) : "") + "–" + d2.getDate() + " " + mo(d2);
    var nt = String(b.notes || ""),
      tm = function (re) {
        var m = nt.match(re);
        return m ? (m[1] + (m[2] ? "–" + m[2] : "")).replace(/\./g, ":") : "";
      },
      dt = b.dropTime || tm(/drop[\s-]*off[^\n]*?(\d{1,2}[:.]\d{2})(?:\s*(?:to|-|–)\s*(\d{1,2}[:.]\d{2}))?/i),
      pt = b.pickTime || tm(/pick[\s-]*up[^\n]*?(\d{1,2}[:.]\d{2})(?:\s*(?:to|-|–)\s*(\d{1,2}[:.]\d{2}))?/i),
      wd = function (d) {
        return d.toLocaleDateString(LOC(), { weekday: "short" });
      };
    var cost = parseFloat(String(b.cost || "").replace(",", ".")),
      est =
        !cost && n && I.hotel.rate
          ? n * (parseFloat(String(I.hotel.rate).replace(",", ".")) || 0) * Math.max(1, cats.length)
          : 0;
    return (
      '<button class="bkrow" data-a="bedit" data-v="' +
      esc(b.id) +
      '"><span class="bkd"><b>' +
      (away ? away : now ? "Now" : "✓") +
      "</b><small>" +
      (away ? "day" + (away > 1 ? "s" : "") + " to go" : now ? "away" : "done") +
      '</small></span><span class="bkm"><b>' +
      range +
      "</b><span>" +
      [n ? n + " night" + (n > 1 ? "s" : "") : "", b.place || I.hotel.name || ""]
        .filter(Boolean)
        .map(esc)
        .join(" · ") +
      (files ? " · 📎" : "") +
      "</span>" +
      (from && (dt || pt)
        ? '<span class="bkt">' +
          (dt ? "In " + wd(d1) + " " + esc(dt) : "") +
          (dt && pt ? " · " : "") +
          (pt ? "Out " + wd(d2) + " " + esc(pt) : "") +
          "</span>"
        : "") +
      '</span><span class="bkp"><b>' +
      (cost ? "€" + (cost % 1 ? cost.toFixed(2) : cost) : est ? "~€" + Math.round(est) : "€ ?") +
      '</b><small class="' +
      (done ? "bkok" : "") +
      '">' +
      esc(b.status || (est ? "estimate" : "no price")) +
      '</small><span class="bkc">' +
      cats
        .map(function (x) {
          var key = String(x).toLowerCase();
          return S.cats[key]
            ? spot(key).replace(
                'class="spot"',
                'class="spot" style="width:26px;height:26px;margin-left:-6px"'
              )
            : "";
        })
        .join("") +
      "</span></span></button>"
    );
  }

  function profText(t) {
    var lines = String(t || "")
        .split("\n")
        .filter(function (x) {
          return x.trim();
        }),
      secs = [],
      cur = null;
    if (!lines.length) return '<div class="pl mute">Nothing yet. Tap Edit to add.</div>';
    lines.forEach(function (l) {
      var hd = l.match(/^\s*([^:\-•*](?:[^:]|:(?=\d\d)){0,39}):\s*$/),
        b = l.match(/^\s*[-•*]\s+(.*)$/);
      if (hd) {
        cur = { k: hd[1].trim(), v: [] };
        secs.push(cur);
      } else {
        if (!cur) {
          cur = { k: "", v: [] };
          secs.push(cur);
        }
        cur.v.push(b ? b[1] : l.trim());
      }
    });
    return secs
      .map(function (x) {
        var v =
          x.v.length > 1
            ? '<ul class="kvl">' +
              x.v
                .map(function (i) {
                  return "<li>" + esc(i) + "</li>";
                })
                .join("") +
              "</ul>"
            : esc(x.v[0] || "");
        return x.k
          ? '<div class="kv"><span class="k">' + esc(x.k) + '</span><span class="v">' + v + "</span></div>"
          : '<div class="pl">' + v + "</div>";
      })
      .join("");
  }

  function profSub(c, k, last) {
    var t = String(S.profiles[k] || ""),
      age = c.born ? [0, ageOn(c, today())] : t.match(/Age\s+(\d+)/i),
      vac = t.match(/Vaccinated\s+(\d{1,2}\s+\w{3,9}(?:\s+\d{4})?)/i),
      bits = [];
    if (age) bits.push((c.bornGuess ? "~" : "") + age[1] + " yrs");
    if (last) bits.push(wt(last.kg));
    if (vac) bits.push("jabs " + vac[1].replace(/\s+\d{4}$/, ""));
    return esc(bits.join(" · ") || "target " + wt(c.target, "t"));
  }

  function profileCard(k) {
    var c = S.cats[k],
      w = sorted(c),
      last = w.length ? w[w.length - 1] : null;
    return (
      '<details class="catcard catd icomp" data-open="prof-' +
      k +
      '"' +
      isOpen("prof-" + k, false) +
      '><summary class="head" style="--g:var(--g-' +
      k +
      ')">' +
      spot(k) +
      '<div><em class="pkick">📋 Profile · health · food</em><b>' +
      esc(c.name) +
      "</b><span>" +
      profSub(c, k, last) +
      "</span>" +
      (function () {
        var m = String(S.profiles[k] || "").match(/Microchip\s*(?:no\.?|number)?[:\s]*(\d[\d\s]{8,})/i);
        return m
          ? '<span class="pchip">🔖 Chip ' +
              esc(m[1].replace(/\s/g, "").replace(/(\d{3})(?=\d)/g, "$1 ")) +
              "</span>"
          : "";
      })() +
      (c.born
        ? '<span class="pchip">🎂 ' +
          (c.bornGuess
            ? "Born around " + c.born.slice(0, 4)
            : parse(c.born).toLocaleDateString(LOC(), { day: "numeric", month: "short", year: "numeric" })) +
          " · " +
          esc(ageText(c)) +
          "</span>"
        : "") +
      "</div></summary>" +
      profText(S.profiles[k]) +
      '<div class="row u-jc-flex-end u-mt8">' +
      editBtn("prof") +
      "</div></details>"
    );
  }

  function vInfo() {
    var I = infoData(),
      t = today(),
      list = I.bookings.filter(function (b) {
        return b && b.id;
      }),
      end = function (b) {
        return b.to || b.from || "";
      };
    var up = list
        .filter(function (b) {
          return !end(b) || end(b) >= t;
        })
        .sort(function (a, b) {
          return (a.from || "") < (b.from || "") ? -1 : 1;
        }),
      past = list
        .filter(function (b) {
          return end(b) && end(b) < t;
        })
        .sort(function (a, b) {
          return (a.from || "") < (b.from || "") ? 1 : -1;
        });
    var h = "";
    if (editing("prof"))
      h +=
        '<div class="card"><div class="row between"><h2 class="u-m0">🐾 About the cats</h2>' +
        editBtn("prof") +
        '</div><div class="note">Start a line with "- " for a bullet point, and end a line with ":" to make it a heading.</div>' +
        ["albert", "milly"]
          .map(function (k) {
            return (
              '<label class="l">' +
              spot(k) +
              " " +
              esc(S.cats[k].name) +
              '</label><textarea rows="12" data-prof="' +
              k +
              '">' +
              esc(S.profiles[k] || "") +
              '</textarea><label class="l">' +
              spot(k) +
              " " +
              esc(S.cats[k].name) +
              ': feeding plan (shown on Food &amp; play)</label><textarea rows="10" data-plan="' +
              k +
              '">' +
              esc(S.cats[k].plan || "") +
              "</textarea>"
            );
          })
          .join("") +
        "</div>";
    else h += ["albert", "milly"].map(profileCard).join("");
    h +=
      '<div class="card"><div class="row between"><h2 class="u-m0">🏨 Bookings</h2><span class="row u-gap6"><button class="b s" data-a="sitter">📄 Care sheet</button><button class="b s p" data-a="bnew">+ Booking</button></span></div>' +
      (up.length
        ? up
            .map(function (b) {
              return bookingTicket(b, I, t);
            })
            .join("")
        : emptyState(
            "",
            "No trips coming up",
            "Add a cat hotel stay and the app plans food around it.",
            ""
          )) +
      (past.length
        ? '<details style="margin-top:10px" data-open="bk-past"' +
          isOpen("bk-past", false) +
          '><summary class="mute small">Past bookings (' +
          past.length +
          ")</summary>" +
          past
            .map(function (b) {
              return bookingTicket(b, I, t);
            })
            .join("") +
          "</details>"
        : "") +
      "</div>";
    h += infoCard(
      "hotel",
      "🏨 Cat hotel",
      [
        ["name", "Name"],
        ["address", "Address"],
        ["phone", "Phone", "tel"],
        ["email", "Email", "email"],
        ["notes", "Notes (departments, what to bring, rules)", "area"]
      ],
      function (o) {
        return contactRows(o);
      }
    );
    h += infoCard(
      "vet",
      "🏥 Vet",
      [
        ["clinic", "Clinic / vet"],
        ["address", "Address"],
        ["phone", "Phone", "tel"],
        ["email", "Email", "email"],
        ["hours", "Opening hours / emergency number"],
        ["notes", "Notes", "area"]
      ],
      function (o) {
        return contactRows(o) + ciRow("🕒", "Hours", o.hours);
      },
      '<div class="note">Visit notes, vet emails and test results are under Health for each cat.</div>'
    );
    h += infoCard(
      "insurance",
      "🛡️ Pet insurance",
      [
        ["provider", "Insurer"],
        ["policyAlbert", nmz("Albert: policy number")],
        ["premiumAlbert", nmz("Albert: € per month"), "num"],
        ["yearAlbert", nmz("Albert: insurance year")],
        ["policyMilly", nmz("Milly: policy number")],
        ["premiumMilly", nmz("Milly: € per month"), "num"],
        ["yearMilly", nmz("Milly: insurance year")],
        ["phone", "Claims phone", "tel"],
        ["email", "Claims email", "email"],
        ["notes", "Notes (excess, what's covered, how to claim)", "area"]
      ],
      function (o) {
        var tot =
          (parseFloat(String(o.premiumAlbert || "").replace(",", ".")) || 0) +
          (parseFloat(String(o.premiumMilly || "").replace(",", ".")) || 0);
        return (
          ["albert", "milly"]
            .map(function (k) {
              var K = k === "albert" ? "Albert" : "Milly",
                pm = o["premium" + K];
              return (
                '<div class="ci"><span class="ic">' +
                spot(k).replace('class="spot"', 'class="spot" style="width:28px;height:28px"') +
                '</span><span><span class="t">' +
                esc(S.cats[k].name) +
                ' policy</span><br><span class="val">' +
                esc(o["policy" + K] || "No policy number yet") +
                '</span><br><span class="small mute">' +
                (pm ? "€" + esc(pm) + " a month · " : "") +
                "Year: " +
                esc(o["year" + K] || "?") +
                "</span></span></div>"
              );
            })
            .join("") +
          (tot
            ? '<div class="kv"><span class="k">Total</span><span class="v"><b>€' +
              tot.toFixed(2) +
              " a month</b></span></div>"
            : "") +
          ciRow("📞", "Claims phone", o.phone, o.phone ? "tel:" + String(o.phone).replace(/\s/g, "") : "") +
          ciRow("✉️", "Claims email", o.email, o.email ? "mailto:" + o.email : "")
        );
      }
    );
    return h;
  }

  function bookSheet() {
    var b = ui.b;
    return (
      '<div class="modal" data-a="close"><div class="sheet" data-stop="1"><h2 class="u-mt0">' +
      (b.isNew ? "New booking" : "Edit booking") +
      "</h2>" +
      '<label class="l">Which cats</label><div class="chips">' +
      ["albert", "milly"]
        .map(function (ck) {
          var k = S.cats[ck].name;
          return (
            '<button class="chip' +
            (b.cats.indexOf(k) >= 0 ? " on" : "") +
            '" data-a="bcat" data-v="' +
            esc(k) +
            '">' +
            spot(ck) +
            " " +
            esc(k) +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="grid2"><div><label class="l">Drop off</label><input type="date" data-bf="from" value="' +
      esc(b.from) +
      '"></div><div><label class="l">Pick up</label><input type="date" data-bf="to" value="' +
      esc(b.to) +
      '"></div></div>' +
      '<label class="l">Where</label><input data-bf="place" value="' +
      esc(b.place) +
      '" placeholder="' +
      esc(S.info.hotel.name) +
      '">' +
      '<div class="grid2"><div><label class="l">Cost (€)</label><input data-bf="cost" inputmode="decimal" value="' +
      esc(b.cost) +
      '"></div><div><label class="l">Status</label><select data-bf="status">' +
      ["", "Requested", "Confirmed", "Paid"]
        .map(function (x) {
          return "<option" + (b.status === x ? " selected" : "") + ">" + x + "</option>";
        })
        .join("") +
      "</select></div></div>" +
      '<label class="l">Notes (rooms, food to bring, meds)</label><textarea rows="3" data-bf="notes">' +
      esc(b.notes) +
      "</textarea>" +
      '<label class="l">Confirmation / files</label>' +
      (b.att.length ? thumbs(b.att, "b") : "") +
      '<div class="u-mt6">' +
      upBtn("book", "", "📎 Add confirmation", "image/*,application/pdf") +
      "</div>" +
      '<div class="row u-mt14"><button class="b p" data-a="bsave">Save</button><button class="b" data-a="close">Cancel</button>' +
      (b.isNew
        ? ""
        : '<button class="b" style="background:var(--bad);color:#fff" data-a="bdel" data-v="' +
          b.id +
          '">Delete</button>') +
      "</div></div></div>"
    );
  }
