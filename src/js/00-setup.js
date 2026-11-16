/* 00-setup: App state (S = your data, ui = what is on screen), constants, data migration, date and number helpers. */
(function () {
  var ACT = {}; // button actions, filled in by the 19-actions-*.js files

  var LS = "am-tracker";

  var GH = null;

  try {
    GH = JSON.parse(localStorage.getItem(LS + "-gh") || "null");
  } catch (e) {}

  var S = null,
    BASE = null,
    SHA = null,
    dirty = false;

  try {
    var cache = JSON.parse(localStorage.getItem(LS + "-cache") || "null");
    if (cache && cache.S) {
      S = cache.S;
      BASE = cache.BASE;
      SHA = cache.SHA;
      dirty = !!cache.dirty;
    }
  } catch (e) {}

  // ?demo in the address opens made-up data (demo.json). Nothing is read from or saved to GitHub.
  var DEMO = /[?&]demo\b/.test(location.search);
  if (DEMO) {
    GH = { demo: true, who: "You" };
    S = BASE = SHA = null;
    dirty = false;
  }

  // A setup link (#k=key&r=owner/repo, made in Settings) fills in the setup screen.
  // It's in the # part so it never leaves the phone, and it's wiped from the address straight away.
  var INVITE = null;
  (function () {
    var m = location.hash.match(/[#&]k=([^&]+)(?:&r=([^&]+))?/);
    if (!m) return;
    try {
      history.replaceState(null, "", location.pathname + location.search);
    } catch (e) {}
    if (!GH) INVITE = { token: decodeURIComponent(m[1]), repo: decodeURIComponent(m[2] || "") };
  })();

  var ui = {
    cat: "albert",
    tab: "today",
    day: today(),
    month: today().slice(0, 7),
    modal: null,
    f: null,
    pend: []
  };

  var pending = false;

  try {
    var u = JSON.parse(localStorage.getItem(LS + "-ui") || "{}");
    if (u.cat) ui.cat = u.cat;
    ui.tab = "today";
    if (u.calWho) ui.calWho = u.calWho;
  } catch (e) {}

  var saveState = S ? (dirty ? "Saving…" : "Synced") : "Loading…",
    timer = null;

  if (S) migrate();

  var TRIG = [
    "Milly begging for food",
    "Mealtime / food around",
    "Milly close to him (bed, sofa)",
    "He was stalking or sniffing her",
    "Morning in bed",
    "Night",
    "I just got home",
    "No play yet today",
    "Door or room swap",
    "Noise or visitor",
    "No obvious reason"
  ];

  var SEV = ["Stare / stalk", "Chase / hiss", "Bite", "Full fight"];

  var WHERE = ["Bedroom", "Kitchen", "Hall", "Living room", "Bathroom", "Other"];

  var WHO = ["Albert", "Milly", "Not sure"];

  // Cat names can be changed. Built-in text says "Albert"/"Milly"; nmz() swaps in the current names.
  function nmz(s) {
    if (!S || !S.cats) return s;
    return String(s)
      .replace(/\bAlbert\b/g, "\u0001")
      .replace(/\bMilly\b/g, S.cats.milly.name)
      .replace(/\u0001/g, S.cats.albert.name);
  }

  // Tabs can be switched off in Settings (S.tabsOff). Food & play and Settings always stay.
  var TAB_NAMES = {
    weight: "Weight",
    health: "Health",
    calendar: "Calendar",
    fights: "Friendship",
    stock: "Stock",
    money: "Costs",
    info: "Info"
  };

  function tabOn(t) {
    return !S || !S.tabsOff || S.tabsOff.indexOf(t) < 0;
  }

  function keyOfName(n) {
    return S && n === S.cats.milly.name ? "milly" : S && n === S.cats.albert.name ? "albert" : null;
  }

  // Rename a cat everywhere its name is stored (poo/pee, fights, triggers, bookings).
  function renameCat(k, nn) {
    var old = S.cats[k].name;
    nn = String(nn || "").trim();
    if (!nn || nn === old || nn === S.cats[k === "albert" ? "milly" : "albert"].name) return false;
    var re = new RegExp("\\b" + old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
    S.cats[k].name = nn;
    (S.litter || []).forEach(function (x) {
      if (x.who === old) x.who = nn;
    });
    (S.fights || []).forEach(function (f) {
      if (f.who === old) f.who = nn;
      if (f.trig)
        f.trig = f.trig.map(function (t) {
          return t.replace(re, nn);
        });
    });
    ((S.info && S.info.bookings) || []).forEach(function (b) {
      b.cats = (b.cats || []).map(function (c) {
        return c === old ? nn : c;
      });
    });
    return true;
  }

  var PC = ["Hard pellets", "Firm, well formed", "Soft but formed", "Mushy, no shape", "Liquid"];

  var AMT = ["Small", "Normal", "Large"];

  var SMELL = ["Normal", "Strong", "Really bad"];

  var LX = ["Blood", "Mucus", "Outside the tray", "Straining", "Worms / bits", "Hair / fur"];

  var HT = [
    "Cough / wheeze episode",
    "Fast breathing at rest",
    "Heavy breathing",
    "Gagging",
    "Vomit",
    "Loose stool / diarrhoea",
    "Off food / skipped meal",
    "Other"
  ];

  function migrate() {
    if (!S.fights) S.fights = [];
    if (!S.calm) S.calm = [];
    if (!S.costs) S.costs = [];
    ["albert", "milly"].forEach(function (k) {
      if (!S.cats[k].treat) S.cats[k].treat = [];
    });
    if (!S.todos) S.todos = [];
    if (!S.stock) S.stock = {};
    if (!S.extraStock)
      S.extraStock = [
        { id: "x1", name: "Probiotic", qty: "", unit: "doses", check: "Probiotic", cat: "albert" },
        {
          id: "x2",
          name: "Digestive powder",
          qty: "",
          unit: "doses",
          check: "Digestive powder",
          cat: "albert"
        },
        { id: "x3", name: "Cat litter", qty: "", unit: "bags" }
      ];
    if (S.info && S.info.insurance && S.info.insurance.yearAlbert == null) {
      var In = S.info.insurance;
      In.policyAlbert = In.policyAlbert || In.policy || "";
      In.policyMilly = In.policyMilly || "";
      In.yearAlbert = "";
      In.yearMilly = "";
      In.notes = (In.notes || "").replace(
        /^Separate insurance years:[^\n]*\n?/,
        "Separate policies, one per cat.\n"
      );
    }
    if (!S.profiles) S.profiles = { albert: "", milly: "", ages: "" };
    if (!S.notes) S.notes = { bullying: "" };
    if (!S.litter) S.litter = [];
    if (!S.info)
      S.info = {
        insurance: {
          provider: "",
          policy: "",
          phone: "",
          email: "",
          notes: "Both cats on the same policy.",
          att: []
        },
        vet: { clinic: "", address: "", phone: "", email: "", hours: "", notes: "", att: [] },
        hotel: {
          name: "",
          address: "",
          phone: "",
          email: "",
          notes: "",
          att: []
        },
        bookings: []
      };
    if (!S.playTypes) S.playTypes = ["Wand", "Throwing & catching", "Fetch", "Basket play", "Lead walk"];
    ["albert", "milly"].forEach(function (k) {
      var c = S.cats[k];
      if (!c.vet) c.vet = [];
      if (c.treatKcal == null) c.treatKcal = 2;
      if (!c.foods) {
        c.foods = [
          { id: "dry1", name: c.dryFood || "Dry", kind: "dry", kcal: 370 },
          { id: "wet1", name: c.wetFood || "Wet", kind: "wet", kcal: 80 }
        ];
        Object.keys(c.days).forEach(function (d) {
          var x = c.days[d];
          x.f = { dry1: x.dry || 0, wet1: x.wet || 0 };
          if (typeof x.play === "number") x.play = x.play ? { Other: x.play } : {};
        });
      }
      Object.keys(c.days).forEach(function (d) {
        var x = c.days[d];
        if (!x.f) x.f = {};
        if (!x.play || typeof x.play === "number") x.play = {};
        if (!x.photos) x.photos = [];
        if (!x.checks) x.checks = {};
      });
      c.health.forEach(function (h) {
        if (!h.att) h.att = [];
      });
      c.vet.forEach(function (v) {
        if (!v.att) v.att = [];
      });
    });
    S.fights.forEach(function (f) {
      if (!f.att) f.att = [];
    });
  }

  function today() {
    return iso(new Date());
  }

  function iso(d) {
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function parse(s) {
    var p = s.split("-");
    return new Date(+p[0], p[1] - 1, +(p[2] || 1));
  }

  function addDays(s, n) {
    var d = parse(s);
    d.setDate(d.getDate() + n);
    return iso(d);
  }

  // Birthdays: c.born is "YYYY-MM-DD". bornGuess marks a date that's only roughly known.
  function ageOn(c, ds) {
    if (!c.born) return null;
    var a = +ds.slice(0, 4) - +c.born.slice(0, 4);
    return ds.slice(5) < c.born.slice(5) ? a - 1 : a;
  }

  function isBday(c, ds) {
    // A rough birth date only gives an age, no birthday on the calendar.
    return !!c.born && !c.bornGuess && ds.slice(5) === c.born.slice(5) && ds > c.born;
  }

  function nextBday(c) {
    if (!c.born) return "";
    var t = today(),
      d = t.slice(0, 4) + c.born.slice(4);
    return d < t ? +t.slice(0, 4) + 1 + c.born.slice(4) : d;
  }

  function ageText(c) {
    var a = ageOn(c, today());
    if (a == null) return "";
    if (a < 1) {
      var m = Math.floor(daysBetween(c.born, today()) / 30.44);
      return m + (m === 1 ? " month" : " months");
    }
    return (c.bornGuess ? "about " : "") + a + (a === 1 ? " year" : " years");
  }

  // Weight units (this phone): data is always stored in kg; lb is only for showing and typing.
  function unit() {
    try {
      return localStorage.getItem(LS + "-unit") || "kg";
    } catch (e) {
      return "kg";
    }
  }

  function UL() {
    return unit() === "lb" ? "lb" : "kg";
  }

  // Number in the chosen unit (for inputs and figures).
  function wn(kg, d) {
    kg = +kg;
    return unit() === "lb" ? (kg * 2.20462).toFixed(1) : kg.toFixed(d == null ? 2 : d);
  }

  // Number + unit, e.g. "8.48 kg" or "18.7 lb". d=null keeps a target as typed.
  function wt(kg, d) {
    return (unit() !== "lb" && d === "t" ? String(+kg) : wn(kg, d === "t" ? 1 : d)) + " " + UL();
  }

  // Body-weight change given in grams: "70 g" or "2.5 oz".
  function wg(g) {
    g = Math.abs(Math.round(g));
    return unit() === "lb" ? (g / 28.35).toFixed(1) + " oz" : g + " g";
  }

  // A typed weight, in the chosen unit, back to kg.
  function toKg(v) {
    v = parseFloat(String(v).replace(",", "."));
    if (isNaN(v)) return NaN;
    return unit() === "lb" ? Math.round((v / 2.20462) * 100) / 100 : v;
  }

  function daysBetween(a, b) {
    return Math.round((parse(b) - parse(a)) / 864e5);
  }

  function nice(s) {
    var t = today();
    if (s === t) return "Today";
    if (s === addDays(t, -1)) return "Yesterday";
    return parse(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  }

  function short(s) {
    return s ? parse(s).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "No date";
  }

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function fmt(n) {
    return Math.round(n * 10) / 10;
  }

  function cat() {
    return S.cats[ui.cat];
  }

  function day(c, d) {
    c = c || cat();
    d = d || ui.day;
    if (!c.days[d]) c.days[d] = { f: {}, treats: 0, play: {}, checks: {}, note: "", photos: [] };
    return c.days[d];
  }

  function peek(c, d) {
    return c.days[d];
  }

  function sorted(c) {
    return c.weights.slice().sort(function (a, b) {
      return a.d < b.d ? -1 : 1;
    });
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function firstOf(c, k) {
    for (var i = 0; i < c.foods.length; i++) if (c.foods[i].kind === k) return c.foods[i];
    return null;
  }

  function dayTotals(c, d) {
    var t = { dry: 0, wet: 0, kcal: 0, play: 0 };
    if (!d) return t;
    c.foods.forEach(function (f) {
      var a = d.f[f.id] || 0;
      if (f.kind === "dry") {
        t.dry += a;
        t.kcal += (a * f.kcal) / 100;
      } else {
        t.wet += a;
        t.kcal += a * f.kcal;
      }
    });
    t.kcal += (d.treats || 0) * (c.treatKcal || 0);
    for (var k in d.play) t.play += d.play[k] || 0;
    return t;
  }
