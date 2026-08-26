(() => {
  "use strict";

  const FRAME_HEIGHT_MESSAGE = "physics-atlas:frame-height";
  const FRAME_HEIGHT_REQUEST = "physics-atlas:request-frame-height";
  const frameObservers = new WeakMap();

  function visualizationFrames() {
    return [...document.querySelectorAll("iframe[data-auto-height]")];
  }

  function isExpectedOrigin(event) {
    return window.location.origin === "null" || event.origin === window.location.origin;
  }

  function applyHeight(frame, value) {
    const height = Number(value);
    if (!Number.isFinite(height) || height <= 0) return;
    frame.style.height = `${Math.ceil(height)}px`;
    frame.setAttribute("scrolling", "no");
    frame.style.overflow = "hidden";
  }

  function measureSameOriginFrame(frame) {
    try {
      const content = frame.contentDocument;
      if (!content?.body) return;
      const main = content.querySelector("main");
      const contentHeight = main
        ? main.getBoundingClientRect().bottom
        : content.documentElement.scrollHeight;
      applyHeight(frame, contentHeight);
    } catch (_error) {
      // Cross-origin frames must use the postMessage path.
    }
  }

  function requestFrameHeight(frame) {
    frame.contentWindow?.postMessage({type: FRAME_HEIGHT_REQUEST}, "*");
    measureSameOriginFrame(frame);
  }

  function observeSameOriginFrame(frame) {
    frameObservers.get(frame)?.disconnect();
    try {
      const content = frame.contentDocument;
      const frameWindow = frame.contentWindow;
      if (!content?.body || !frameWindow) return;
      measureSameOriginFrame(frame);
      if (!("ResizeObserver" in frameWindow)) return;
      const observer = new frameWindow.ResizeObserver(() => measureSameOriginFrame(frame));
      const main = content.querySelector("main");
      observer.observe(main ?? content.body);
      frameObservers.set(frame, observer);
    } catch (_error) {
      // Cross-origin frames must use the postMessage path.
    }
  }

  window.addEventListener("message", event => {
    if (!isExpectedOrigin(event) || event.data?.type !== FRAME_HEIGHT_MESSAGE) return;
    const frame = visualizationFrames().find(candidate => candidate.contentWindow === event.source);
    if (frame) applyHeight(frame, event.data.height);
  });

  function installVisualizationFrameResizers() {
    visualizationFrames().forEach(frame => {
      frame.addEventListener("load", () => {
        observeSameOriginFrame(frame);
        requestFrameHeight(frame);
      });
      if (frame.contentDocument?.readyState === "complete") {
        observeSameOriginFrame(frame);
        requestFrameHeight(frame);
      }
    });
    window.addEventListener("resize", () => visualizationFrames().forEach(requestFrameHeight));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installVisualizationFrameResizers);
  } else {
    installVisualizationFrameResizers();
  }
})();
