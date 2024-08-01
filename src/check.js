(function () {
  var nameTechnicalCookie = "x-sampler-t";
  var namePercentileCookie = "x-sampler-p";

  function getCookie(name) {
    var cname = name + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(cname) === 0) {
        return c.substring(cname.length, c.length);
      }
    }
    return null;
  }

  function setCookie(name, value) {
    let maxAge = 60 * 60 * 24 * 365 * 2; // 2 years
    document.cookie = name + "=" + value + ";max-age=" + maxAge + ";path=/";
  }

  function readStorage(key) {
    var value = null;
    if (window.localStorage && localStorage.getItem) {
      value = localStorage.getItem(key);
      if (value) return value;
    }
    value = getCookie(key);
    return value;
  }

  function writeStorage(key, value) {
    setCookie(key, value + "");
    if (window.localStorage && localStorage.setItem) {
      localStorage.setItem(key, value + "");
    }
  }

  var technicalCookie = parseInt(readStorage(nameTechnicalCookie));
  var now = Date.now();
  if (!technicalCookie) {
    writeStorage(nameTechnicalCookie, now);
    technicalCookie = now;
  }

  var percentile = parseInt(readStorage(namePercentileCookie));
  if (now - 1000 * 60 * 60 * 24 * 2 > technicalCookie) { // technical cookie is at least 2 days old
    if (!percentile) {
      var percentile = Math.floor(Math.random() * 100) + 1;
      writeStorage(namePercentileCookie, percentile);
    }
  }

  window.__sample_me = function (group, inSampleCB, outOfSampleCB) {
    var desiredPercentile = 10;
    if (group === "agf") {
      desiredPercentile = 20;
    }
    if (group === "agtt") {
      desiredPercentile = 10;
    }

    if (percentile <= desiredPercentile) {
      if (inSampleCB && typeof inSampleCB === "function") {
        inSampleCB();
      }
    } else {
      if(outOfSampleCB && typeof outOfSampleCB === "function") {
        outOfSampleCB();
      }
    }
  }
})();
