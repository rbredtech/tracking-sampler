window.loadOnDOMContentLoaded = function (elementTagName, onDOMContentLoadedCB) {
  document.addEventListener("DOMContentLoaded", function () {
    var element = document.getElementsByTagName(elementTagName)[0];
    if (element && onDOMContentLoadedCB && typeof onDOMContentLoadedCB === "function") {
      onDOMContentLoadedCB(element);
    }
  });
};

window.waitForDOMElement = function (elementTagName, onDomElementFoundCB, retriesLeft) {
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
};

window.isIframeCapable = function () {
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
};

(function () {
  var sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;
  sampler._q = [];

  sampler.checkInSample = function () {
    sampler._q[sampler._q.length] = { m: "checkInSample", a: Array.prototype.slice.call(arguments) };
  };

  function callQueue() {
    for (var i = 0; i < sampler._q.length; i++) {
      var f = sampler._q[i];
      sampler[f.m].apply(null, f.a);
    }
    delete sampler._q;
  }

  function onSamplerLoaded() {
    callQueue();
  }

  sampler._cbCount = sampler._cbCount || 0;
  sampler._cbMap = sampler.callbackMap || {};
  var iframe;

  function iframeMessage(method, parameter, callback) {
    sampler._cbMap[++sampler._cbCount] = callback;
    var msg = sampler._cbCount + ";__tvi_sampler;" + method + ";" + JSON.stringify({ param: parameter });
    iframe.contentWindow.postMessage(msg, window.location.protocol + "//<%-SAMPLER_HOST%>");
  }

  function loadSampler(element) {
    var samplerScriptTag = document.createElement("script");
    samplerScriptTag.setAttribute("type", "text/javascript");
    samplerScriptTag.setAttribute("src", window.location.protocol + "//<%-SAMPLER_HOST%>/sampler-impl.js");

    samplerScriptTag.onload = function () {
      onSamplerLoaded();
    };

    samplerScriptTag.onerror = function (e) {
      console.error("error loading sampler", e);
    };

    element.appendChild(samplerScriptTag);
  }

  function onIframeMessage(event) {
    if ((window.location.protocol + "//<%-SAMPLER_HOST%>").indexOf(event.origin) === -1 || !event.data) {
      return;
    }

    var message = event.data.split(";");
    var id = message[0];
    var callbackParameter = JSON.parse(message[1]);
    if (!sampler._cbMap[id] || typeof sampler._cbMap[id] !== "function") {
      return;
    }
    sampler._cbMap[id](callbackParameter.param);
    sampler._cbMap[id] = undefined;
  }

  function loadSamplerIframe(element) {
    iframe = document.createElement("iframe");
    iframe.setAttribute("src", window.location.protocol + "//<%-SAMPLER_HOST%>/sampler-iframe.html");
    iframe.setAttribute("style", "position:fixed;border:0;outline:0;top:-999px;left:-999px;width:0;height:0;");
    iframe.setAttribute("frameborder", "0");

    iframe.onload = function () {
      if (!iframe.contentWindow || !iframe.contentWindow.postMessage) {
        iframe.parentElement.removeChild(iframe);
        return waitForDOMElement("head", loadSampler, 3);
      }

      sampler.checkInSample = function (callback) {
        iframeMessage("checkInSample", undefined, callback);
      };

      window.addEventListener("message", onIframeMessage);

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
