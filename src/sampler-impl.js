(function () {
  var nameTechnicalCookie = "x-sampler-t";
  var namePercentileCookie = "x-sampler-p";

  function getCookie(name) {
    var cname = name + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(cname) === 0) {
        return c.substring(cname.length, c.length);
      }
    }
    return null;
  }

  function setCookie(name, value) {
    var maxAge = 60 * 60 * 24 * 365 * 2; // 2 years
    document.cookie = name + "=" + value + ";max-age=" + maxAge + ";path=/";
  }

  function readStorage(key) {
    var value = null;
    if (window.localStorage && localStorage.getItem) {
      value = localStorage.getItem(key);
      if (value) {
        return value;
      }
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
  var percentile = 0;

  var now = Date.now();
  if (!technicalCookie) {
    writeStorage(nameTechnicalCookie, now);
    technicalCookie = now;
  } else {
    // check if technical cookie is at least 2 days old
    if (now - 1000 * 60 * 60 * 24 * 2 > technicalCookie) {
      percentile = parseInt(readStorage(namePercentileCookie));
      if (!percentile) {
        var percentile = Math.floor(Math.random() * 100) + 1;
        writeStorage(namePercentileCookie, percentile);
      }
    }
  }

  sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;

  sampler.checkInSample = function (group, callback) {
    var desiredPercentile = 10;
    if (group === "agf") {
      desiredPercentile = 20;
    }
    if (group === "agtt") {
      desiredPercentile = 10;
    }
    if (callback && typeof callback === "function") {
      callback(!!percentile && percentile <= desiredPercentile);
    }
  };
})();
