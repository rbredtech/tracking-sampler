(function () {
  __ejs(/*- include("partials/storage.js") */);

  var technicalCookie = parseInt(readStorage('{{TECH_COOKIE_NAME}}'));

  var now = Date.now();
  if (!technicalCookie) {
    writeStorage('{{TECH_COOKIE_NAME}}', now);
    technicalCookie = now;
  }

  var technicalCookiePassed = now - parseInt('{{TECHNICAL_COOKIE_MIN_AGE}}') > technicalCookie;

  var percentile = parseInt(readStorage('{{PERCENTILE_COOKIE_NAME}}')) || undefined;
  if (!percentile && technicalCookiePassed) {
    percentile = Math.floor(Math.random() * 100) + 1;
    writeStorage('{{PERCENTILE_COOKIE_NAME}}', percentile);
  }

  sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;

  sampler.checkInSample = function (callback) {
    var desiredPercentile = parseInt('__ejs(/*-IN_SAMPLE_PERCENTILE*/);');
    if (callback && typeof callback === 'function') {
      var inSample = __ejs(/*-IN_SAMPLE_WITHOUT_TC*/);
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
