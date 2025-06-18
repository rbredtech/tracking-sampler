(function () {
  __ejs(/*- include("partials/storage.js") */);

  var technicalCookieFromCookie = parseInt('{{TECH_COOKIE_VALUE}}');
  var technicalCookieFromLocalStorage = parseInt(readStorage('{{TECH_COOKIE_NAME}}'));
  if (!technicalCookieFromLocalStorage && technicalCookieFromCookie) {
    writeStorage('{{TECH_COOKIE_NAME}}', technicalCookieFromCookie);
  }

  var now = new Date().getTime();
  var technicalCookie = technicalCookieFromLocalStorage || technicalCookieFromCookie || now;
  var technicalCookiePassed = now - parseInt('{{TECH_COOKIE_MIN_AGE}}') > technicalCookie;

  var percentileFromCookie = parseInt('{{PERCENTILE_COOKIE_VALUE}}');
  var percentileFromLocalStorage = parseInt(readStorage('{{PERCENTILE_COOKIE_NAME}}'));
  if (!percentileFromLocalStorage && percentileFromCookie) {
    writeStorage('{{PERCENTILE_COOKIE_NAME}}', percentileFromCookie);
  }
  var percentile = percentileFromLocalStorage || percentileFromCookie || undefined;

  sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;

  sampler.checkInSample = function (callback) {
    var desiredPercentile = parseInt('__ejs(/*-IN_SAMPLE_PERCENTILE*/);');
    if (callback && typeof callback === 'function') {
      var inSample = __ejs(/*-IN_SAMPLE_WITHOUT_TC*/);
      if (technicalCookiePassed || !!percentile) {
        inSample = !!percentile && percentile <= desiredPercentile;
      }
      callback(inSample);
    }
  };

  sampler.getPercentile = function (callback) {
    if (callback && typeof callback === 'function') {
      callback(percentile);
    }
  };
})();
