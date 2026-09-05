"use strict";

const assert = require("node:assert/strict");
require("../static/data.js");

const {markers, cosmology, sources} = globalThis.MassScaleData;
const ids = new Set();

for (const marker of markers) {
  assert.ok(!ids.has(marker.id), `duplicate marker id: ${marker.id}`);
  ids.add(marker.id);
  assert.ok(sources[marker.source] || marker.source === null, `unknown source: ${marker.id}`);
  if (marker.secondarySource) assert.ok(sources[marker.secondarySource]);
  for (const locale of ["ja", "en"]) {
    assert.ok(marker.title[locale], `${marker.id} lacks ${locale} title`);
    assert.ok(marker.value[locale], `${marker.id} lacks ${locale} value`);
    assert.ok(marker.detail[locale], `${marker.id} lacks ${locale} detail`);
  }
  if (marker.type === "point") assert.ok(marker.energy > 0);
  else assert.ok(marker.low > 0 && marker.high > marker.low);
}

for (const id of ["electron", "muon", "tau", "up-quark", "down-quark", "strange-quark", "charm-quark", "bottom-quark", "top-quark", "w-boson", "z-boson", "higgs"]) {
  assert.ok(ids.has(id), `missing Standard Model entry: ${id}`);
}
assert.equal(markers.at(-1).id, "planck");
for (const milestone of cosmology) assert.ok(milestone.energy > 0);
