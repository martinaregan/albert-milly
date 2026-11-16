/* 00-setup: App state (S = your data, ui = what is on screen), constants, data migration, date and number helpers. */
(function () {
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
    if (!S.costs)
      S.costs = [
        {
          id: "c1",
          d: "2026-11-07",
          who: "albert",
          cat: "Vet",
          amount: 104.5,
          reimb: 75,
          desc: "Vaccinations",
          n: "Insurance claim"
        },
        {
          id: "c2",
          d: "2026-11-07",
          who: "albert",
          cat: "Food",
          amount: 37.5,
          reimb: 0,
          desc: "Diet food bought at the vet",
          n: "Not covered by insurance"
        },
        {
          id: "c3",
          d: "2026-11-07",
          who: "milly",
          cat: "Vet",
          amount: 65.75,
          reimb: 52.6,
          desc: "Vaccinations",
          n: "Insurance claim"
        },
        {
          id: "c4",
          d: "2026-12-19",
          who: "both",
          cat: "Hotel / sitter",
          amount: 280,
          reimb: 0,
          desc: "Cat hotel, 10 nights",
          n: "Pay at drop-off",
          planned: true
        }
      ];
    ["albert", "milly"].forEach(function (k) {
      if (!S.cats[k].treat) S.cats[k].treat = [];
    });
    if (!S.todos)
      S.todos = [
        {
          id: "t1",
          text: "Check names match on vet, insurance and microchip records",
          done: false,
          due: ""
        },
        {
          id: "t2",
          text: "Ask the cat hotel about a quiet room",
          done: false,
          due: "2026-12-18"
        },
        { id: "t3", text: "Add insurance policy numbers in Info", done: false, due: "" },
        { id: "t4", text: "Cancel any open sitter requests", done: false, due: "" }
      ];
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
        { id: "x3", name: "Cat's Best litter", qty: "", unit: "bags" }
      ];
    if (S.info && S.info.insurance && S.info.insurance.yearAlbert == null) {
      var In = S.info.insurance;
      In.policyAlbert = In.policyAlbert || In.policy || "";
      In.policyMilly = In.policyMilly || "";
      In.yearAlbert = "1 Jul to 30 Jun";
      In.yearMilly = "1 Feb to 31 Jan";
      In.notes = (In.notes || "").replace(
        /^Separate insurance years:[^\n]*\n?/,
        "Two separate insurer policies, one per cat.\n"
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
          name: "the cat hotel cat hotel",
          address: "",
          phone: "",
          email: "",
          notes: "Milly: quiet / older / shyer department. Albert: playful department.",
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
