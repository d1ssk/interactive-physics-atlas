"use strict";

(() => {
  if (window.parent === window || window.location.protocol === "file:") return;

  const properties = {
    "--atlas-viz-background": "--atlas-paper",
    "--atlas-viz-panel": "--atlas-panel",
    "--atlas-viz-border": "--atlas-line",
    "--atlas-viz-accent": "--atlas-accent",
  };

  try {
    if (window.parent.location.origin !== window.location.origin) return;
    const parentStyles = window.parent.getComputedStyle(window.parent.document.documentElement);
    for (const [target, source] of Object.entries(properties)) {
      const value = parentStyles.getPropertyValue(source).trim();
      if (value) document.documentElement.style.setProperty(target, value);
    }
    document.documentElement.dataset.atlasVisualizationTheme = "parent";
  } catch (error) {
    if (error?.name !== "SecurityError") throw error;
  }
})();
