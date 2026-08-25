"use strict";

/* Keep same-origin visualization iframes tall enough that only the atlas page scrolls. */
function installVisualizationFrameResizer(frame) {
  let observer = null;

  function resize() {
    const content = frame.contentDocument;
    if (!content) return;
    const height = Math.max(
      content.documentElement.scrollHeight,
      content.body?.scrollHeight ?? 0,
    );
    if (height > 0) frame.style.height = `${Math.ceil(height)}px`;
  }

  function observeContent() {
    observer?.disconnect();
    resize();
    const content = frame.contentDocument;
    if (!content || !("ResizeObserver" in window)) return;
    observer = new ResizeObserver(resize);
    observer.observe(content.documentElement);
    if (content.body) observer.observe(content.body);
    frame.contentWindow?.addEventListener("resize", resize);
  }

  frame.addEventListener("load", observeContent);
  if (frame.contentDocument?.readyState === "complete") observeContent();
}

function installVisualizationFrameResizers() {
  document.querySelectorAll("iframe[data-auto-height]").forEach(installVisualizationFrameResizer);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", installVisualizationFrameResizers);
} else {
  installVisualizationFrameResizers();
}
