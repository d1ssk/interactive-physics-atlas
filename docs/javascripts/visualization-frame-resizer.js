(() => {
  "use strict";

  const FRAME_HEIGHT_MESSAGE = "physics-atlas:frame-height";
  const FRAME_HEIGHT_REQUEST = "physics-atlas:request-frame-height";
  const FRAME_TARGET_ORIGIN = window.location.protocol === "file:" ? "*" : window.location.origin;
  const frameObservers = new WeakMap();

  function visualizationFrames() {
    return [...document.querySelectorAll("iframe[data-auto-height]")];
  }

  function isExpectedOrigin(event) {
    const localFileFrame = window.location.protocol === "file:" && event.origin === "null";
    return localFileFrame || event.origin === window.location.origin;
  }

  function applyHeight(frame, value) {
    const height = Number(value);
    if (!Number.isFinite(height) || height <= 0) return;
    frame.style.minHeight = "0";
    frame.style.height = `${Math.ceil(height)}px`;
    frame.setAttribute("scrolling", "no");
    frame.style.overflow = "hidden";
  }

  function contentHeight(content) {
    const main = content.querySelector("main");
    const mainBottom = main ? main.getBoundingClientRect().bottom : 0;
    const bodyHeight = content.body.getBoundingClientRect().height;
    return Math.max(mainBottom, bodyHeight);
  }

  function measureSameOriginFrame(frame) {
    try {
      const content = frame.contentDocument;
      if (!content?.body) return;
      applyHeight(frame, contentHeight(content));
    } catch (_error) {
      // Cross-origin frames must use the postMessage path.
    }
  }

  function requestFrameHeight(frame) {
    frame.contentWindow?.postMessage({type: FRAME_HEIGHT_REQUEST}, FRAME_TARGET_ORIGIN);
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
      observer.observe(content.body);
      if (main) observer.observe(main);
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
