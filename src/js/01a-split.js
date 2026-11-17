/* 01a-split: The data repo keeps one file per area instead of one data.json. These turn the app's single state object into those files and back. Not wired into syncing yet. */
  // Which top-level keys live in which file. Each cat gets its own file (albert.json, milly.json).
  // Anything not listed here goes to info.json, so a new key is never dropped.
  var SPLIT = {
    "fights.json": ["fights", "calm"],
    "litter.json": ["litter"],
    "money.json": ["costs", "stock", "extraStock"],
    "notes.json": ["msgs", "push", "pushPub"]
  };

  function splitData(s) {
    var out = { "info.json": {} },
      where = {};
    Object.keys(SPLIT).forEach(function (f) {
      out[f] = {};
      SPLIT[f].forEach(function (k) {
        where[k] = f;
      });
    });
    Object.keys(s).forEach(function (k) {
      if (k === "cats") {
        // info.json lists the cats, so joining knows which files to read.
        out["info.json"].cats = Object.keys(s.cats);
        Object.keys(s.cats).forEach(function (c) {
          out[c + ".json"] = s.cats[c];
        });
      } else out[where[k] || "info.json"][k] = s[k];
    });
    return out;
  }

  function joinData(files) {
    var info = files["info.json"] || {},
      s = {};
    Object.keys(info).forEach(function (k) {
      if (k !== "cats") s[k] = info[k];
    });
    Object.keys(SPLIT).forEach(function (f) {
      var o = files[f] || {};
      Object.keys(o).forEach(function (k) {
        s[k] = o[k];
      });
    });
    s.cats = {};
    (info.cats || []).forEach(function (c) {
      if (files[c + ".json"]) s.cats[c] = files[c + ".json"];
    });
    return s;
  }
