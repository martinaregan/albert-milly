/* 02-weight-maths: Weight statistics, rate of loss, feeding maths and the weekly check-in rules (checkin, setDry). */
  function stats(c) {
    var w = sorted(c);
    if (!w.length) return null;
    var first = w[0],
      last = w[w.length - 1],
      r = {
        first: first,
        last: last,
        lost: first.kg - last.kg,
        pct: ((first.kg - last.kg) / first.kg) * 100,
        toGo: last.kg - c.target
      };
    var ref = null;
    for (var i = w.length - 2; i >= 0; i--) {
      if (daysBetween(w[i].d, last.d) >= 5) {
        ref = w[i];
        break;
      }
    }
    if (ref) {
      var days = daysBetween(ref.d, last.d);
      r.rate = ((((ref.kg - last.kg) / ref.kg) * 100) / days) * 7;
      r.kgWeek = ((ref.kg - last.kg) / days) * 7;
    }
    if (r.kgWeek > 0 && r.toGo > 0) {
      r.eta = addDays(last.d, Math.round((r.toGo / r.kgWeek) * 7));
    }
    return r;
  }

  function status(r, c) {
    if (!r) return ["neutral", "No weigh-ins yet"];
    if (r.last.kg <= c.target) return ["ok", "Target reached"];
    if (r.rate == null) return ["neutral", "Need 2 weigh-ins 5+ days apart"];
    if (r.rate > 1.5) return ["bad", "Too fast (" + r.rate.toFixed(1) + "%/wk), check with vet"];
    if (r.rate >= 0.5) return ["ok", "On track (" + r.rate.toFixed(1) + "%/wk)"];
    if (r.rate > 0) return ["warn", "Slow (" + r.rate.toFixed(1) + "%/wk)"];
    return daysBetween(r.first.d, r.last.d) < 21
      ? ["neutral", "No change yet, give it a few weeks"]
      : ["warn", "Not losing yet"];
  }

  function feed(c) {
    var r = stats(c),
      dry = firstOf(c, "dry"),
      wet = firstOf(c, "wet");
    var rer = 70 * Math.pow(c.target, 0.75),
      lo = 0.8 * rer,
      hi = rer;
    if (c.kcalLo && c.kcalHi) {
      lo = +c.kcalLo;
      hi = +c.kcalHi;
    }
    var wetK = wet ? c.wetAllowance * wet.kcal : 0,
      dryK = dry ? (c.dryAllowance * dry.kcal) / 100 : 0;
    var o = { lo: lo, hi: hi, wetK: wetK, plan: wetK + dryK, dry: dry, wet: wet };
    if (dry) {
      o.dLo = Math.max(0, (lo - wetK) / (dry.kcal / 100));
      o.dHi = Math.max(0, (hi - wetK) / (dry.kcal / 100));
    }
    var st = r && r.rate != null && r.last.kg > c.target ? r.rate : null,
      cur = c.dryAllowance;
    if (st == null)
      o.step =
        "Keep the current amounts until there are 2 weigh-ins at least 5 days apart. The scale tells you more than any formula.";
    else if (st > 1.5) {
      o.next = Math.ceil((cur * 1.1) / 5) * 5;
      o.step = "Losing too fast. Go up to about " + o.next + " g dry a day and ring the vet.";
    } else if (st >= 0.5) o.step = "Rate is good. Keep feeding exactly this.";
    else {
      o.next = Math.max(Math.floor((cur * 0.9) / 5) * 5, o.dLo ? Math.ceil(o.dLo / 5) * 5 : 0);
      o.step =
        o.plan <= lo
          ? "Loss is slow but the plan is already at the low end. Check for extra food before cutting, and ask the vet."
          : "Loss is slow. If it stays like this for 2 weeks, drop dry to about " +
            o.next +
            " g a day (roughly 10% less), after checking for extras.";
    }
    return o;
  }

  function intervals(c) {
    var w = sorted(c),
      out = [];
    var j = w.length - 1;
    while (j > 0) {
      var i = j - 1;
      while (i >= 0 && daysBetween(w[i].d, w[j].d) < 5) i--;
      if (i < 0) break;
      var dd = daysBetween(w[i].d, w[j].d);
      out.push({
        from: w[i],
        to: w[j],
        rate: ((((w[i].kg - w[j].kg) / w[i].kg) * 100) / dd) * 7,
        g: Math.round((w[i].kg - w[j].kg) * 1000)
      });
      j = i;
    }
    return out;
  }

  function checkin(k) {
    var c = S.cats[k],
      w = sorted(c);
    if (!w.length) return null;
    var last = w[w.length - 1],
      iv = intervals(c),
      fd = feed(c),
      vet = !!(c.kcalLo && c.kcalHi),
      cur = c.dryAllowance;
    if (last.kg <= c.target)
      return {
        tone: "ok",
        head: c.name + " has reached " + c.target + " kg",
        tx: "Ask the vet about switching to maintenance amounts. Keep weighing weekly."
      };
    if (!iv.length)
      return {
        tone: "neutral",
        head: c.name + ": first weigh-in logged",
        tx: "Keep feeding exactly " + cur + " g dry. Next Saturday's weigh-in gives the first real number."
      };
    var pf = c.planFrom || "",
      ivp = iv.filter(function (x) {
        return !pf || x.from.d >= pf;
      });
    if (!ivp.length) {
      var r0 = iv[0];
      return {
        tone: "neutral",
        head: c.name + ": new amount, first week",
        tx:
          (r0.g >= 0 ? "Down " + r0.g + " g" : "Up " + -r0.g + " g") +
          " since " +
          short(r0.from.d) +
          ", mostly before the change to " +
          cur +
          " g on " +
          short(pf) +
          ". Stay at " +
          cur +
          " g; next weigh-in shows how it's working."
      };
    }
    iv = ivp;
    var r = iv[0],
      slow = 0;
    for (var i = 0; i < iv.length && iv[i].rate < 0.5; i++) slow++;
    var ch =
      (r.g >= 0 ? "Down " + r.g + " g" : "Up " + -r.g + " g") +
      " since " +
      short(r.from.d) +
      " (" +
      (r.rate >= 0 ? "" : "+") +
      Math.abs(r.rate).toFixed(1) +
      "% a week)";
    if (r.rate > 1.5) {
      var up = Math.ceil((cur * 1.1) / 5) * 5;
      return {
        tone: "warn",
        head: c.name + " is losing too fast",
        tx: ch + ". Go up to " + up + " g dry and ring the vet.",
        apply: vet ? null : up
      };
    }
    if (r.rate >= 0.5)
      return {
        tone: "ok",
        head: c.name + " is on track",
        tx: ch + ". Keep feeding exactly " + cur + " g dry."
      };
    if (slow < 2)
      return {
        tone: "neutral",
        head: c.name + ": slow week",
        tx:
          ch +
          ". One slow week is normal scale noise. Stay at " +
          cur +
          " g and check nothing extra is being eaten."
      };
    if (vet)
      return {
        tone: "warn",
        head: c.name + ": slow " + slow + " weeks running",
        tx:
          ch +
          ". " +
          c.name +
          "'s amounts are set with the vet, so mention it to them before changing anything."
      };
    var nx = fd.next || Math.floor((cur * 0.9) / 5) * 5;
    if (nx >= cur)
      return {
        tone: "warn",
        head: c.name + ": slow " + slow + " weeks running",
        tx: ch + ". The plan is already at the lowest safe amount. Check for extra food, then ask the vet."
      };
    return {
      tone: "warn",
      head: c.name + ": slow " + slow + " weeks running",
      tx: ch + ". Time to drop dry from " + cur + " g to " + nx + " g a day.",
      apply: nx
    };
  }

  function setDry(k, g) {
    var c = S.cats[k],
      old = c.dryAllowance;
    c.dryAllowance = g;
    c.planFrom = today();
    var dry = firstOf(c, "dry"),
      wet = firstOf(c, "wet");
    c.plan = String(c.plan || "")
      .split("\n")
      .map(function (l) {
        if (/drop to|below|go up|without asking/i.test(l)) return l;
        l = l.replace(new RegExp("\\b" + old + " g\\b", "g"), g + " g");
        if (/kcal/.test(l) && dry) {
          var kc = Math.round((g * dry.kcal) / 100 + (wet ? c.wetAllowance * wet.kcal : 0));
          l = l.replace(/About \d+ kcal/, "About " + kc + " kcal");
        }
        return l;
      })
      .join("\n");
    c.vet = c.vet || [];
    c.vet.push({
      id: uid(),
      d: today(),
      clinic: "",
      reason: "Food change: " + old + " g → " + g + " g dry",
      notes: "Changed from the weekly check-in.",
      next: "",
      email: "",
      att: []
    });
  }
