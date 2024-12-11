(function () {
  __ejs(/*- include("partials/polyfill.js") */);

  var sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;
  sampler._tq = [];

  sampler.setPercentile = function () {
    sampler._tq[sampler._tq.length] = { m: "setPercentile", a: Array.prototype.slice.call(arguments) };
  };

  sampler.isTechCookieValid = function () {
    sampler._tq[sampler._tq.length] = { m: "isTechCookieValid", a: Array.prototype.slice.call(arguments) };
  };

  sampler.setValidTechCookie = function () {
    sampler._tq[sampler._tq.length] = { m: "setValidTechCookie", a: Array.prototype.slice.call(arguments) };
  };

  sampler.reset = function () {
    sampler._tq[sampler._tq.length] = { m: "reset", a: Array.prototype.slice.call(arguments) };
  };

  function callTestingQueue() {
    for (var i = 0; i < sampler._tq.length; i++) {
      var f = sampler._tq[i];
      sampler[f.m].apply(null, f.a);
    }
    delete sampler._tq;
  }

  function onTestingLoaded() {
    callTestingQueue();
  }

  var iframe;

  function iframeMessage(method, parameter, callback) {
    sampler._cbMap[++sampler._cbCount] = callback;
    var msg = sampler._cbCount + ";__tvi_sampler;" + method + ";" + window.jsonStringify({ param: parameter });
    iframe.contentWindow.postMessage(msg, window.location.protocol + "//__ejs(/*-SAMPLER_HOST*/);");
  }

  function loadTesting(element) {
    var testingScriptTag = document.createElement("script");
    testingScriptTag.setAttribute("type", "text/javascript");
    testingScriptTag.setAttribute("src", window.location.protocol + "//__ejs(/*-SAMPLER_HOST*/);/testing-impl__ejs(/*= __CONFIG_NAME ? '-' + __CONFIG_NAME : '' */);.js");

    testingScriptTag.onload = function () {
      onTestingLoaded();
    };

    testingScriptTag.onerror = function (e) {
      console.error("error loading testing", e);
    };

    element.appendChild(testingScriptTag);
  }

  function loadTestingIframe(element) {
    iframe = document.createElement("iframe");
    iframe.setAttribute("src", window.location.protocol + "//__ejs(/*-SAMPLER_HOST*/);/testing-iframe__ejs(/*= __CONFIG_NAME ? '-' + __CONFIG_NAME : '' */);.html");
    iframe.setAttribute("style", "position:fixed;border:0;outline:0;top:-999px;left:-999px;width:0;height:0;");
    iframe.setAttribute("frameborder", "0");

    iframe.onload = function () {
      if (!iframe.contentWindow || !iframe.contentWindow.postMessage) {
        iframe.parentElement.removeChild(iframe);
        return waitForDOMElement("head", loadTesting, 3);
      }

      sampler.setPercentile = function (percentile, callback) {
        iframeMessage("setPercentile", percentile, callback);
      };

      sampler.isTechCookieValid = function (callback) {
        iframeMessage("isTechCookieValid", undefined, callback);
      };

      sampler.setValidTechCookie = function (callback) {
        iframeMessage("setValidTechCookie", undefined, callback);
      };

      sampler.reset = function (callback) {
        iframeMessage("reset", undefined, callback);
      };

      onTestingLoaded();
    };

    iframe.onerror = function (e) {
      console.error("error loading testing iframe", e);
    };

    element.appendChild(iframe);
  }

  function initTesting() {
    var waitForDOMElementRetries = 3;
    if (isIframeCapable()) {
      waitForDOMElement("body", loadTestingIframe, waitForDOMElementRetries);
    } else {
      waitForDOMElement("head", loadTesting, waitForDOMElementRetries);
    }
  }

  initTesting();
})();
