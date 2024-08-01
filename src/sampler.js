(function() {
  var queue = [];

  window.__sample_me = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    queue[queue.length] = args;
  }

  function callQueue() {
    for (var i = 0; i < queue.length; i++) {
      window.__sample_me.apply(null, queue[i]);
    }
    queue = [];
  }

  function onSamplerLoaded() {
    callQueue();
  }

  function isIframeCapable() {
    var excludeList = ['antgalio', 'hybrid', 'maple', 'presto', 'technotrend goerler', 'viera 2011'];
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

  function waitForDOMElement(elementTagName, onDomElementFoundCB, retriesLeft) {
    if (retriesLeft < 0) {
      loadOnDOMContentLoaded(onDomElementFoundCB);
      return;
    }

    var element = document.getElementsByTagName(elementTagName)[0];

    if (!element) {
      setTimeout(function () {
        waitForDOMElement(elementTagName, onDomElementFoundCB, retriesLeft - 1);
      }, 200);
      return;
    }

    if (onDomElementFoundCB && typeof onDomElementFoundCB === 'function') {
      onDomElementFoundCB(element);
    }
  }

  var callbackCount = 0;
  var callbackMap = {};
 var iframe;

  function iframeMessage(group, inSampleCB, outOfSampleCB) {
    callbackMap[++callbackCount] = [inSampleCB, outOfSampleCB];
    var msg = callbackCount + ';__sample_me;' + group;
    iframe.contentWindow.postMessage(msg, 'http://localhost:4000');
  }

  function loadSampler(element) {
    var samplerScriptTag = document.createElement('script');
    samplerScriptTag.setAttribute('type', 'text/javascript');
    samplerScriptTag.setAttribute('src', 'http://localhost:4000/check.js');
    samplerScriptTag.onload = function () {
      onSamplerLoaded();
    };
    element.appendChild(samplerScriptTag);
  }

  function loadSamplerIframe(element) {
    iframe = document.createElement('iframe');
    iframe.setAttribute('src', 'http://localhost:4000/iframe.html');
    iframe.setAttribute('style', 'position:fixed;border:0;outline:0;top:-999px;left:-999px;width:0;height:0;');
    iframe.setAttribute('frameborder', '0');

    iframe.onload = function() {
      if (!iframe.contentWindow || !iframe.contentWindow.postMessage) {
        iframe.parentElement.removeChild(iframe);
        return waitForDOMElement('head', loadSampler, 3);
      }

      console.info("iframe loaded");

      window.__sample_me = function(group, inSampleCB, outOfSampleCB) {
        iframeMessage(group, inSampleCB, outOfSampleCB)
      }

      function onMessage(event) {
        if ('http://localhost:4000'.indexOf(event.origin) === -1 || !event.data) {
          return;
        }

        var message = event.data.split(';');
        var id = message[0];
        var callbackType = message[1];
        if (callbackType === "inSample" && callbackMap[id] && typeof callbackMap[id][0] === 'function') {
          callbackMap[id][0]();
        }
        if (callbackType === "outOfSample" && callbackMap[id] && typeof callbackMap[id][1] === 'function') {
          callbackMap[id][1]();
        }
      }

      window.addEventListener('message', onMessage);

      onSamplerLoaded();
    };

    iframe.onerror = function(e) {
      console.error("error loading iframe", e);
    }

    element.appendChild(iframe);
  }

  function init() {
    var waitForDOMElementRetries = 3;
    if (isIframeCapable()) {
      waitForDOMElement('body', loadSamplerIframe, waitForDOMElementRetries);
    } else {
      waitForDOMElement('head', loadSampler, waitForDOMElementRetries);
    }
  }

  init();
})();
