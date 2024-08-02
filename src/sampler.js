(function () {
  var queue = [];

  var sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;
  sampler._queue = [];

  sampler.checkInSample = function () {
    sampler._queue[sampler._queue.length] = { m: "checkInSample", a: Array.prototype.slice.call(arguments) };
  };

  function callQueue() {
    for (var i = 0; i < sampler._queue.length; i++) {
      var f = sampler._queue[i];
      sampler[f.m].apply(null, f.a);
    }
    delete sampler._queue;
  }

  function onSamplerLoaded() {
    callQueue();
  }

  function isIframeCapable() {
    var excludeList = ["antgalio", "hybrid", "maple", "presto", "technotrend goerler", "viera 2011"];
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

  var callbackCount = 0;
  var callbackMap = {};
  var iframe;

  function iframeMessage(method, parameter, callback) {
    callbackMap[++callbackCount] = callback;
    var msg = callbackCount + ";__tvi_sampler;" + method + ";" + JSON.stringify({ param: parameter });
    iframe.contentWindow.postMessage(msg, "http://localhost:4000");
  }

  function loadSampler(element) {
    var samplerScriptTag = document.createElement("script");
    samplerScriptTag.setAttribute("type", "text/javascript");
    samplerScriptTag.setAttribute("src", "http://localhost:4000/check.js");

    samplerScriptTag.onload = function () {
      onSamplerLoaded();
    };

    samplerScriptTag.onerror = function (e) {
      console.error("error loading sampler", e);
    };

    element.appendChild(samplerScriptTag);
  }

  function loadSamplerIframe(element) {
    iframe = document.createElement("iframe");
    iframe.setAttribute("src", "http://localhost:4000/iframe.html");
    iframe.setAttribute("style", "position:fixed;border:0;outline:0;top:-999px;left:-999px;width:0;height:0;");
    iframe.setAttribute("frameborder", "0");

    iframe.onload = function () {
      if (!iframe.contentWindow || !iframe.contentWindow.postMessage) {
        iframe.parentElement.removeChild(iframe);
        return waitForDOMElement("head", loadSampler, 3);
      }

      sampler.checkInSample = function (group, callback) {
        iframeMessage("checkInSample", group, callback);
      };

      function onMessage(event) {
        if ("http://localhost:4000".indexOf(event.origin) === -1 || !event.data) {
          return;
        }

        var message = event.data.split(";");
        var id = message[0];
        var callbackParameter = JSON.parse(message[1]);
        if (!callbackMap[id] || typeof callbackMap[id] !== "function") {
          return;
        }
        callbackMap[id](callbackParameter.param);
      }

      window.addEventListener("message", onMessage);

      onSamplerLoaded();
    };

    iframe.onerror = function (e) {
      console.error("error loading iframe", e);
    };

    element.appendChild(iframe);
  }

  function init() {
    var waitForDOMElementRetries = 3;
    if (isIframeCapable()) {
      waitForDOMElement("body", loadSamplerIframe, waitForDOMElementRetries);
    } else {
      waitForDOMElement("head", loadSampler, waitForDOMElementRetries);
    }
  }

  init();
})();
