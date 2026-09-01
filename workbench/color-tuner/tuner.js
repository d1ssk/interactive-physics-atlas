const controls = {
  hue: document.querySelector("#hue"),
  saturation: document.querySelector("#saturation"),
  lightness: document.querySelector("#lightness"),
};

const outputs = {
  hue: document.querySelector("#hue-value"),
  saturation: document.querySelector("#saturation-value"),
  lightness: document.querySelector("#lightness-value"),
  hex: document.querySelector("#hex-value"),
  contrast: document.querySelector("#contrast-value"),
  contrastStatus: document.querySelector("#contrast-status"),
};

function hslToRgb(hue, saturation, lightness) {
  const saturationRatio = saturation / 100;
  const lightnessRatio = lightness / 100;
  const chroma = (1 - Math.abs(2 * lightnessRatio - 1)) * saturationRatio;
  const segment = hue / 60;
  const intermediate = chroma * (1 - Math.abs((segment % 2) - 1));
  let channels;

  if (segment < 1) channels = [chroma, intermediate, 0];
  else if (segment < 2) channels = [intermediate, chroma, 0];
  else if (segment < 3) channels = [0, chroma, intermediate];
  else if (segment < 4) channels = [0, intermediate, chroma];
  else if (segment < 5) channels = [intermediate, 0, chroma];
  else channels = [chroma, 0, intermediate];

  const offset = lightnessRatio - chroma / 2;
  return channels.map((channel) => Math.round((channel + offset) * 255));
}

function rgbToHex(channels) {
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function hexToHsl(hex) {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const maximum = Math.max(...channels);
  const minimum = Math.min(...channels);
  const delta = maximum - minimum;
  let hue = 0;

  if (delta) {
    if (maximum === channels[0]) hue = ((channels[1] - channels[2]) / delta) % 6;
    else if (maximum === channels[1]) hue = (channels[2] - channels[0]) / delta + 2;
    else hue = (channels[0] - channels[1]) / delta + 4;
    hue = (hue * 60 + 360) % 360;
  }

  const lightness = (maximum + minimum) / 2;
  const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0;
  return [Math.round(hue), Math.round(saturation * 100), Math.round(lightness * 100)];
}

function relativeLuminance(channels) {
  const linear = channels.map((channel) => {
    const ratio = channel / 255;
    return ratio <= 0.04045 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(first, second) {
  const brighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (brighter + 0.05) / (darker + 0.05);
}

function update() {
  const hue = Number(controls.hue.value);
  const saturation = Number(controls.saturation.value);
  const lightness = Number(controls.lightness.value);
  const channels = hslToRgb(hue, saturation, lightness);
  const hex = rgbToHex(channels);
  const contrast = contrastRatio(channels, [247, 248, 246]);

  document.documentElement.style.setProperty("--tuned", hex);
  outputs.hue.value = `${hue}°`;
  outputs.saturation.value = `${saturation}%`;
  outputs.lightness.value = `${lightness}%`;
  outputs.hex.textContent = hex.toUpperCase();
  outputs.contrast.textContent = `${contrast.toFixed(2)}:1`;
  outputs.contrastStatus.textContent = contrast >= 7 ? "AAA for normal text" : contrast >= 4.5 ? "AA for normal text" : "Below AA for normal text";

  const parameters = new URLSearchParams({ h: hue, s: saturation, l: lightness });
  history.replaceState(null, "", `${location.pathname}?${parameters}`);
}

function setColor(hex) {
  const [hue, saturation, lightness] = hexToHsl(hex);
  controls.hue.value = hue;
  controls.saturation.value = saturation;
  controls.lightness.value = lightness;
  update();
}

const parameters = new URLSearchParams(location.search);
for (const [parameter, control] of [
  ["h", controls.hue],
  ["s", controls.saturation],
  ["l", controls.lightness],
]) {
  const value = Number(parameters.get(parameter));
  if (Number.isFinite(value) && value >= Number(control.min) && value <= Number(control.max)) {
    control.value = value;
  }
}

for (const control of Object.values(controls)) control.addEventListener("input", update);
for (const preset of document.querySelectorAll("[data-color]")) {
  preset.addEventListener("click", () => setColor(preset.dataset.color));
}

document.querySelector("#copy-color").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  try {
    await navigator.clipboard.writeText(outputs.hex.textContent);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Select value";
    const selection = window.getSelection();
    selection.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(outputs.hex);
    selection.addRange(range);
  }
  window.setTimeout(() => {
    button.textContent = "Copy";
  }, 1400);
});

update();
