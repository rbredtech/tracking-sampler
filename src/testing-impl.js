(function () {
  var nameTechnicalCookie = "x-sampler-t";
  var namePercentileCookie = "x-sampler-p";

  function setCookie(name, value) {
    var maxAge = 60 * 60 * 24 * 365 * 2; // 2 years
    document.cookie = name + "=" + value + ";max-age=" + maxAge + ";path=/";
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

  sampler.setValidTechCookie = function (callback) {
    writeStorage(nameTechnicalCookie, Date.now() - 1000 * 60 * 60 * 24 * 4);
    callback();
  };
})();
