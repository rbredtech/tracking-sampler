(function () {
  var nameTechnicalCookie = '__ejs(/*-TECH_COOKIE_NAME*/);';
  var namePercentileCookie = '__ejs(/*-PERCENTILE_COOKIE_NAME*/);';
  var nameEligibilityCookie = '__ejs(/*-ELIGIBILITY_COOKIE_NAME*/);';

  __ejs(/*- include("partials/storage.js") */);

  var sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;

  sampler.setPercentile = function (percentile, callback) {
    writeStorage(namePercentileCookie, percentile);
    if (callback && typeof callback === 'function') {
      callback(percentile);
    }
  };

  sampler.isTechCookieValid = function (callback) {
    var technicalCookie = parseInt(readStorage(nameTechnicalCookie), 10) || null;
    if (callback && typeof callback === 'function') {
      var now = new Date().getTime();
      callback(!!technicalCookie && now - parseInt('__ejs(/*-TECH_COOKIE_MIN_AGE*/);', 10) > technicalCookie);
    }
  };

  sampler.setValidTechCookie = function (callback) {
    var now = new Date().getTime();
    writeStorage(nameTechnicalCookie, now - parseInt('__ejs(/*-TECH_COOKIE_MIN_AGE*/);', 10) * 2);
    if (callback && typeof callback === 'function') {
      callback();
    }
  };

  sampler.reset = function (callback) {
    deleteStorage(nameTechnicalCookie);
    deleteStorage(namePercentileCookie);
    deleteStorage(nameEligibilityCookie);
    if (callback && typeof callback === 'function') {
      callback();
    }
  };
})();
