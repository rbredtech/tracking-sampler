(function () {
  var nameTechnicalCookie = "__ejs(/*-TECHNICAL_COOKIE_NAME*/);";
  var namePercentileCookie = "__ejs(/*-PERCENTILE_COOKIE_NAME*/);";

  __ejs(/*- include("partials/storage.js") */);

  sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;

  sampler.setPercentile = function (percentile, callback) {
    writeStorage(namePercentileCookie, percentile);
    callback(percentile);
  };

  sampler.isTechCookieValid = function (callback) {
    var technicalCookie = parseInt(readStorage(nameTechnicalCookie)) || null;
    callback(!!technicalCookie && Date.now() - parseInt("__ejs(/*-TECHNICAL_COOKIE_MIN_AGE*/);") > technicalCookie);
  };

  sampler.setValidTechCookie = function (callback) {
    writeStorage(nameTechnicalCookie, Date.now() - parseInt("__ejs(/*-TECHNICAL_COOKIE_MIN_AGE*/);") * 2);
    callback();
  };

  sampler.reset = function (callback) {
    deleteStorage(nameTechnicalCookie);
    deleteStorage(namePercentileCookie);
    callback();
  };
})();
