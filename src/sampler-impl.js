(function () {
  var nameTechnicalCookie = '__ejs(/*-TECH_COOKIE_NAME*/);';
  var namePercentileCookie = '__ejs(/*-PERCENTILE_COOKIE_NAME*/);';
  var inSampleWithoutTC = __ejs(/*-IN_SAMPLE_WITHOUT_TC*/);

  __ejs(/*- include("partials/storage.js") */);

  var technicalCookie = parseInt(readStorage(nameTechnicalCookie), 10);

  var now = new Date().getTime();
  if (!technicalCookie) {
    writeStorage(nameTechnicalCookie, now);
    technicalCookie = now;
  }

  var technicalCookiePassed = now - parseInt('__ejs(/*-TECH_COOKIE_MIN_AGE*/);', 10) > technicalCookie;

  var percentile = parseInt(readStorage(namePercentileCookie), 10) || undefined;
  if (!percentile && technicalCookiePassed) {
    percentile = Math.floor(Math.random() * 100) + 1;
    writeStorage(namePercentileCookie, percentile);
  }

  var sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;

  sampler.checkInSample = function (callback) {
    var minPercentile = parseInt('__ejs(/*-IN_SAMPLE_PERCENTILE_MIN*/);', 10);
    var maxPercentile = parseInt('__ejs(/*-IN_SAMPLE_PERCENTILE_MAX*/);', 10);
    if (callback && typeof callback === 'function') {
      var inSample = inSampleWithoutTC;
      if (technicalCookiePassed || !!percentile) {
        inSample = !!percentile && percentile >= minPercentile && percentile <= maxPercentile;
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
