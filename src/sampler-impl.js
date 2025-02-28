(function () {
  var nameTechnicalCookie = '__ejs(/*-TECHNICAL_COOKIE_NAME*/);';
  var namePercentileCookie = '__ejs(/*-PERCENTILE_COOKIE_NAME*/);';
  var inSampleWithoutTC = __ejs(/*-IN_SAMPLE_WITHOUT_TC*/);

  __ejs(/*- include("partials/storage.js") */);

  var technicalCookie = parseInt(readStorage(nameTechnicalCookie));

  var now = Date.now();
  if (!technicalCookie) {
    writeStorage(nameTechnicalCookie, now);
    technicalCookie = now;
  }

  var technicalCookiePassed = now - parseInt('__ejs(/*-TECHNICAL_COOKIE_MIN_AGE*/);') > technicalCookie;

  var percentile = parseInt(readStorage(namePercentileCookie)) || undefined;
  if (!percentile && technicalCookiePassed) {
    percentile = Math.floor(Math.random() * 100) + 1;
    writeStorage(namePercentileCookie, percentile);
  }

  sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;

  sampler.checkInSample = function (callback) {
    var desiredPercentile = parseInt('__ejs(/*-IN_SAMPLE_PERCENTILE*/);');
    if (callback && typeof callback === 'function') {
      var inSample = inSampleWithoutTC;
      if (technicalCookiePassed) {
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
