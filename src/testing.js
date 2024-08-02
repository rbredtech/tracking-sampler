(function () {
  var sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;
  sampler._tq = [];

  sampler.setPercentile = function () {
    sampler._tq[sampler._tq.length] = { m: "setPercentile", a: Array.prototype.slice.call(arguments) };
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

  function isIframeCapable() {
    var excludeList = ["antgalio", "hybrid", "maple", "presto", "technotrend goerler", "viera 2011" /* "hbbtvemulator"*/];
    var currentUserAgent = window.navigator && navigator.userAgent && navigator.userAgent.toLowerCase();

    if (!currentUserAgent || !currentUserAgent.indexOf) {
      return false;
    }

    var userAgentIsExcluded = false;
    for (var i = 0; i < excludeList.length; i++) {
      userAgentIsExcluded = userAgentIsExcluded || currentUserAgent.indexOf(excludeList[i]) !== -1;
    }

    return !userAgentIsExcluded;
  }

  function loadOnDOMContentLoaded(elementTagName, onDOMContentLoadedCB) {
    document.addEventListener("DOMContentLoaded", function () {
      var element = document.getElementsByTagName(elementTagName)[0];
      if (element && onDOMContentLoadedCB && typeof onDOMContentLoadedCB === "function") {
        onDOMContentLoadedCB(element);
      }
    });
  }

  function waitForDOMElement(elementTagName, onDomElementFoundCB, retriesLeft) {
    if (retriesLeft < 0) {
      loadOnDOMContentLoaded(elementTagName, onDomElementFoundCB);
      return;
    }

    var element = document.getElementsByTagName(elementTagName)[0];

    if (!element) {
      setTimeout(function () {
        waitForDOMElement(elementTagName, onDomElementFoundCB, retriesLeft - 1);
      }, 200);
      return;
    }

    if (onDomElementFoundCB && typeof onDomElementFoundCB === "function") {
      onDomElementFoundCB(element);
    }
  }

  var iframe;

  function iframeMessage(method, parameter, callback) {
    sampler._cbMap[++sampler._cbCount] = callback;
    var msg = sampler._cbCount + ";__tvi_sampler;" + method + ";" + JSON.stringify({ param: parameter });
    iframe.contentWindow.postMessage(msg, "http://localhost:4000");
  }

  function loadTesting(element) {
    var tester = document.createElement("script");
    tester.setAttribute("type", "text/javascript");
    tester.setAttribute("src", "http://localhost:4000/testing-ipml.js");

    tester.onload = function () {
      onTestingLoaded();
    };

    tester.onerror = function (e) {
      console.error("error loading testing", e);
    };

    element.appendChild(tester);
  }

  function loadTestingIframe(element) {
    iframe = document.createElement("iframe");
    iframe.setAttribute("src", "http://localhost:4000/testing-iframe.html");
    iframe.setAttribute("style", "position:fixed;border:0;outline:0;top:-999px;left:-999px;width:0;height:0;");
    iframe.setAttribute("frameborder", "0");

    iframe.onload = function () {
      if (!iframe.contentWindow || !iframe.contentWindow.postMessage) {
        iframe.parentElement.removeChild(iframe);
        return waitForDOMElement("head", loadSampler, 3);
      }

      sampler.setPercentile = function (percentile, callback) {
        iframeMessage("setPercentile", percentile, callback);
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
