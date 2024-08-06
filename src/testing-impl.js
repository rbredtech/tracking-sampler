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

  sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;

  sampler.setPercentile = function (percentile, callback) {
    writeStorage(namePercentileCookie, percentile);
    callback(percentile);
  };

  sampler.isTechCookieValid = function (callback) {
    var technicalCookie = parseInt(readStorage(nameTechnicalCookie)) || null;
    callback(!!technicalCookie && Date.now() - 1000 * 60 * 60 * 24 * 2 > technicalCookie);
  };

  sampler.setValidTechCookie = function (callback) {
    writeStorage(nameTechnicalCookie, Date.now() - 1000 * 60 * 60 * 24 * 4);
    callback();
  };
})();
