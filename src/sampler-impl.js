(function () {
  var nameTechnicalCookie = "<%-TECHNICAL_COOKIE_NAME%>";
  var namePercentileCookie = "<%-PERCENTILE_COOKIE_NAME%>";

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
    if (now - parseInt("<%-TECHNICAL_COOKIE_MIN_AGE%>") > technicalCookie) {
      percentile = parseInt(readStorage(namePercentileCookie));
      if (!percentile) {
        var percentile = Math.floor(Math.random() * 100) + 1;
        writeStorage(namePercentileCookie, percentile);
      }
    }
  }

  sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;

  sampler.checkInSample = function (callback) {
    var desiredPercentile = parseInt("<%-MAX_PERCENTILE%>");
    if (callback && typeof callback === "function") {
      callback(!!percentile && percentile <= desiredPercentile);
    }
  };
})();
