/* 17-settings: The Settings tab (Cats, This phone, Data & sync) and backup. */
  function backup() {
    var name = "albert-milly-backup-" + today() + ".json",
      blob = new Blob([JSON.stringify(S, null, 1)], { type: "application/json" });
    try {
      var file = new File([blob], name, { type: "application/json" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: "Albert & Milly backup" }).catch(function () {});
        return;
      }
    } catch (e) {}
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
  }

  function vSettings() {
    var raw = vSettings0(),
      tp = document.createElement("div");
    tp.innerHTML = raw;
    var G = { Cats: [], Phone: [], Data: [] };
    [].slice.call(tp.children).forEach(function (el) {
      var t = (el.querySelector("h2") || {}).textContent || "";
      var g = /badge|feeding them|Shortcut/i.test(t)
        ? "Phone"
        : /Backup|Connection/i.test(t)
          ? "Data"
          : "Cats";
      G[g].push(el.outerHTML);
    });
    G.Phone.push(
      '<div class="card"><h2>📱 Lock screen shortcut</h2><div class="note" style="margin:0">Shortcuts app › + › Open URLs › paste <b>martinaregan.github.io/albert-milly/?log=breakfast</b> (or ?log=dinner). First open the app once in Safari and connect, because Shortcuts opens links in Safari.</div></div>'
    );
    return ["Cats", "Phone", "Data"]
      .map(function (g) {
        return (
          '<div class="sgh">' +
          { Cats: "Cats", Phone: "This phone", Data: "Data & sync" }[g] +
          "</div>" +
          G[g].join("")
        );
      })
      .join("");
  }

  function vSettings0() {
    var c = cat();
    return (
      '<div class="card"><h2>📷 Cat photos</h2><div class="note" style="margin:0 0 10px">Used instead of the drawn faces everywhere in the app. A close-up of the face works best.</div><div class="row" style="gap:8px;flex-wrap:wrap">' +
      ["albert", "milly"]
        .map(function (k) {
          return (
            '<span class="row" style="gap:8px">' +
            spot(k).replace('class="spot"', 'class="spot" style="width:40px;height:40px"') +
            upBtn(
              "catphoto",
              k,
              (S.cats[k].photo ? "Change " : "Add ") + esc(S.cats[k].name) + "'s photo",
              "image/*"
            ) +
            (S.cats[k].photo ? '<button class="x" data-a="rmphoto" data-v="' + k + '">Remove</button>' : "") +
            "</span>"
          );
        })
        .join("") +
      "</div></div>" +
      '<div class="card"><h2>🔴 App icon badge</h2><div class="note" style="margin:0 0 10px">Shows a number on the app icon for today\'s open must-dos: breakfast (after 7:00), dinner (after 20:00) and Saturday\'s weigh-in. It updates when the app opens. Only works from the home screen app.</div><button class="b s" data-a="badgeon">' +
      (window.Notification && Notification.permission === "granted" ? "✓ Badge is on" : "Turn on the badge") +
      "</button></div>" +
      '<div class="card"><h2>👥 Someone else feeding them?</h2><div class="note" style="margin:0">On their phone: open martinaregan.github.io/albert-milly, add it to the home screen, paste the same access key and type their name. Everything they log shows their name, and the app stops a second dinner.</div></div>' +
      '<div class="card"><h2>💾 Backup</h2><div class="note" style="margin:0 0 10px">Everything (both cats, all logs, notes, costs) as one file you can keep in Files, iCloud or email to yourself. Photos stay on GitHub.</div><button class="b s p" data-a="backup">Download a backup</button></div>' +
      '<div class="card"><h2>🔗 Connection</h2><div class="kv"><span class="k">Data</span><span class="v">' +
      esc(GH.owner + "/" + GH.repo) +
      '</span></div><div class="kv"><span class="k">This phone</span><span class="v">' +
      esc(GH.who || "") +
      '</span></div><div class="kv"><span class="k">Status</span><span class="v">' +
      esc(saveState) +
      '</span></div><div class="row" style="margin-top:10px"><button class="b s" data-a="syncnow">Sync now</button><button class="b s ghost" data-a="ghout">Disconnect this phone</button></div><div class="note">App version ' +
      APPV +
      "</div></div>" +
      '<div class="card"><h2>' +
      esc(c.name) +
      '\'s plan</h2><label class="l">Target weight (kg)</label><input data-s="target" inputmode="decimal" value="' +
      c.target +
      '">' +
      '<div class="grid2"><div><label class="l">Dry allowance (g/day, total)</label><input data-s="dryAllowance" inputmode="decimal" value="' +
      c.dryAllowance +
      '"></div><div><label class="l">Wet allowance (per day)</label><input data-s="wetAllowance" inputmode="decimal" value="' +
      c.wetAllowance +
      '"></div>' +
      '<div><label class="l">Treats allowed per day</label><input data-s="treatAllowance" inputmode="decimal" value="' +
      c.treatAllowance +
      '"></div><div><label class="l">kcal per treat</label><input data-s="treatKcal" inputmode="decimal" value="' +
      c.treatKcal +
      '"></div></div></div>' +
      '<div class="card" id="foodscard"><h2>Foods</h2>' +
      c.foods
        .map(function (f, i) {
          return (
            '<div class="food"><input data-fd="' +
            i +
            '" data-fk="name" value="' +
            esc(f.name) +
            '"><div class="grid2" style="margin-top:6px"><select data-fd="' +
            i +
            '" data-fk="kind"><option value="dry"' +
            (f.kind === "dry" ? " selected" : "") +
            '>Dry</option><option value="wet"' +
            (f.kind === "wet" ? " selected" : "") +
            '>Wet</option></select><input data-fd="' +
            i +
            '" data-fk="kcal" inputmode="decimal" value="' +
            f.kcal +
            '"></div><div class="row between"><span class="mute small">' +
            (f.kind === "dry" ? "kcal per 100 g" : "kcal per pouch/can") +
            '</span><button class="x" data-a="delfood" data-v="' +
            i +
            '">Remove</button></div></div>'
          );
        })
        .join("") +
      '<button class="b s" style="margin-top:8px" data-a="addfood">+ Add a food</button><div class="note">Calories are on the pack ("metabolisable energy", usually in kcal/kg: divide by 10 for per 100 g). The suggestion uses the first dry and first wet food in this list.</div></div>' +
      '<div class="card"><h2>Daily checklist (' +
      esc(c.name) +
      ')</h2><textarea rows="4" data-s="checks">' +
      esc(c.checks.join("\n")) +
      '</textarea><div class="note">One per line. Each item shows when it was last ticked, handy for supplements on alternate days.</div></div>' +
      '<div class="card"><h2>Play types (both cats)</h2><textarea rows="5" data-pt="1">' +
      esc(S.playTypes.join("\n")) +
      "</textarea></div>" +
      '<div class="card small mute">Rate is worked out between the latest weigh-in and the most recent one at least 5 days earlier. Everything syncs to this page, so it\'s the same on your phone and computer.</div>'
    );
  }
