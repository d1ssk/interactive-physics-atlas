"use strict";

const FRAME_HEIGHT_MESSAGE = "physics-atlas:frame-height";
const FRAME_HEIGHT_REQUEST = "physics-atlas:request-frame-height";

function visualizationFrames() {
  return [...document.querySelectorAll("iframe[data-auto-height]")];
}

function isExpectedOrigin(event) {
  return window.location.origin === "null" || event.origin === window.location.origin;
}

function requestFrameHeight(frame) {
  frame.contentWindow?.postMessage({type: FRAME_HEIGHT_REQUEST}, "*");
}

window.addEventListener("message", event => {
  if (!isExpectedOrigin(event) || event.data?.type !== FRAME_HEIGHT_MESSAGE) return;
  const frame = visualizationFrames().find(candidate => candidate.contentWindow === event.source);
  const height = Number(event.data.height);
  if (!frame || !Number.isFinite(height) || height <= 0) return;
  frame.style.height = `${Math.ceil(height)}px`;
});

function installVisualizationFrameResizers() {
  visualizationFrames().forEach(frame => {
    frame.addEventListener("load", () => requestFrameHeight(frame));
    if (frame.contentDocument?.readyState === "complete") requestFrameHeight(frame);
  });
  window.addEventListener("resize", () => visualizationFrames().forEach(requestFrameHeight));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", installVisualizationFrameResizers);
} else {
  installVisualizationFrameResizers();
}
