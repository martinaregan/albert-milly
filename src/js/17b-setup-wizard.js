/* 17b-setup-wizard: First-run setup for new data: each cat's name, look, birthday, weight and target, food, and a suggested daily amount. Everything stays editable in Settings. */
  var SW_STEPS = ["name", "look", "weight", "food", "amount"];

  function swCat() {
    return ui.sw.cat === 0 ? "albert" : "milly";
  }

  // Suggested dry grams a day: resting energy at the target weight (70 × kg^0.75),
  // 80 to 100% of it when losing weight, about 100 to 120% when not, minus the wet food.
  function swSuggest(c) {
    var w = sorted(c),
      now = w.length ? w[w.length - 1].kg : c.target,
      losing = now > c.target + 0.05,
      rer = 70 * Math.pow(c.target || now, 0.75),
      lo = losing ? 0.8 * rer : rer,
      hi = losing ? rer : 1.2 * rer,
      dry = firstOf(c, "dry"),
      wet = firstOf(c, "wet"),
      wetK = wet ? (c.wetAllowance || 0) * (wet.kcal || 0) : 0,
      mid = (lo + hi) / 2,
      g = dry && dry.kcal ? Math.max(0, Math.round(((mid - wetK) / (dry.kcal / 100)) / 5) * 5) : 0;
    return { lo: Math.round(lo), hi: Math.round(hi), g: g, wetK: Math.round(wetK), losing: losing, now: now };
  }

  function setupWiz() {
    var s = ui.sw,
      k = swCat(),
      c = S.cats[k],
      st = SW_STEPS[s.step],
      n = SW_STEPS.length * 2 + 1,
      pos = s.cat * SW_STEPS.length + s.step + 1,
      body = "",
      q = "";
    if (s.intro) {
      return (
        '<div class="modal"><div class="sheet wiz" data-stop="1"><div class="vs u-mb10">' +
        spot("albert") +
        "<b>&amp;</b>" +
        spot("milly") +
        '</div><h2 class="wizq">Let\'s set up your two cats</h2><div class="pl">About two minutes: names, how they look, their weight and food. The app then works out a daily amount and tracks their progress. You can change everything later in Settings.</div>' +
        '<button class="b p w u-mt14 u-p14" data-a="swGo">Start</button><button class="b ghost w u-mt10" data-a="swSkip">Skip for now</button></div></div>'
      );
    }
    if (st === "name") {
      q = s.cat ? "And your second cat?" : "What's your first cat called?";
      body =
        '<input id="swname" maxlength="20" autocapitalize="words" value="' +
        esc(/^Cat [12]$/.test(c.name) ? "" : c.name) +
        '" placeholder="Name">' +
        '<label class="l">Birthday (if you know it)</label><input type="date" id="swborn" value="' +
        esc(c.born || "") +
        '"><label class="tickl u-mt6"><input type="checkbox" id="swguess"' +
        (c.bornGuess ? " checked" : "") +
        "> Only roughly</label>";
    } else if (st === "look") {
      q = "What does " + esc(c.name) + " look like?";
      body = coatCard(k).replace(/<h2>[^<]*<\/h2>/, "");
    } else if (st === "weight") {
      var w = sorted(c),
        now = w.length ? w[w.length - 1].kg : "";
      q = "How much does " + esc(c.name) + " weigh?";
      body =
        '<div class="grid2"><div><label class="l">Now (' + UL() + ')</label><input id="swnow" inputmode="decimal" value="' +
        (now ? wn(now) : "") +
        '"></div><div><label class="l">Target (' + UL() + ')</label><input id="swtarget" inputmode="decimal" value="' +
        (c.target ? wn(c.target) : "") +
        '"></div></div><div class="note">Not sure of the target? Ask your vet. If they\'re a healthy weight, put the same number twice. Safe weight loss is about 1% of their weight a week.</div>';
    } else if (st === "food") {
      var dry = firstOf(c, "dry") || {},
        wet = firstOf(c, "wet") || {};
      q = "What does " + esc(c.name) + " eat?";
      body =
        '<label class="l">Dry food</label><input id="swdry" placeholder="e.g. Royal Canin Indoor" value="' +
        esc(/^Example/.test(dry.name || "") ? "" : dry.name || "") +
        '"><label class="l">Calories per 100 g (on the bag)</label><input id="swdryk" inputmode="decimal" value="' +
        (dry.kcal || "") +
        '"><label class="l">Wet food</label><input id="swwet" placeholder="e.g. Whiskas pouch (85 g)" value="' +
        esc(/^Example/.test(wet.name || "") ? "" : wet.name || "") +
        '"><div class="grid2"><div><label class="l">Calories per pouch / can</label><input id="swwetk" inputmode="decimal" value="' +
        (wet.kcal || "") +
        '"></div><div><label class="l">How many a day</label><input id="swwetn" inputmode="decimal" value="' +
        (c.wetAllowance != null ? c.wetAllowance : 1) +
        '"></div></div><div class="note">Leave a food blank if they don\'t have it.</div>';
    } else if (st === "amount") {
      var g = swSuggest(c),
        wkg = Math.round(g.now * 10),
        weeks = g.losing ? Math.ceil(((g.now - c.target) * 1000) / wkg) : 0;
      q = "Daily food for " + esc(c.name);
      body =
        '<div class="pl">' +
        (g.losing
          ? "To lose weight safely, " + esc(c.name) + " needs about <b>" + g.lo + " to " + g.hi + " kcal a day</b>."
          : "To stay at a healthy weight, " + esc(c.name) + " needs about <b>" + g.lo + " to " + g.hi + " kcal a day</b>.") +
        (g.wetK ? " The wet food gives " + g.wetK + " kcal of that." : "") +
        "</div>" +
        (firstOf(c, "dry")
          ? '<label class="l">Dry food a day (g)</label><input id="swg" inputmode="decimal" value="' + g.g + '">'
          : "") +
        (g.losing
          ? '<div class="note">Aim: about ' +
            wg(wkg) +
            " a week (1%), so roughly " +
            weeks +
            " weeks to reach " +
            wt(c.target, "t") +
            ". Weigh every Saturday and the app checks the pace and suggests changes.</div>"
          : "") +
        '<div class="note">A starting point from the standard vet formula, not veterinary advice. Check it with your vet, especially for prescription diets.</div>';
    }
    return wizFrame(
      "Setup",
      pos - 1,
      n - 1,
      q,
      body + '<button class="b p w u-mt14 u-p14" data-a="swNext">' + (s.cat && st === "amount" ? "Finish" : "Next") + "</button>",
      "swBack"
    );
  }
