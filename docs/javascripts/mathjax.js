window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true,
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex",
  },
  startup: {
    ready() {
      MathJax.startup.defaultReady();
      MathJax.startup.promise.then(() => {
        window.dispatchEvent(new Event("physics-atlas:mathjax-ready"));
      });
    },
  },
};

const mathJaxReady = new Promise(resolve => {
  window.addEventListener("physics-atlas:mathjax-ready", resolve, {once: true});
});
let mathJaxQueue = mathJaxReady;

function withMathJax(callback) {
  const task = mathJaxQueue.then(() => callback(window.MathJax));
  mathJaxQueue = task.catch(error => {
    console.error("MathJax typesetting failed", error);
  });
  return task;
}

document$.subscribe(() => {
  void withMathJax(mathJax => {
    mathJax.startup.output.clearCache();
    mathJax.typesetClear();
    mathJax.texReset();
    return mathJax.typesetPromise();
  });
});

component$.subscribe(({ref}) => {
  if (ref.classList.contains("md-annotation")) {
    void withMathJax(mathJax => mathJax.typesetPromise([ref]));
  }
});
