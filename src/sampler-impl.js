(function () {
  var nameTechnicalCookie = '__ejs(/*-TECH_COOKIE_NAME*/);';
  var namePercentileCookie = '__ejs(/*-PERCENTILE_COOKIE_NAME*/);';
  var nameEligibilityCookie = '__ejs(/*-ELIGIBILITY_COOKIE_NAME*/);';
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

  var eligible = readStorage(nameEligibilityCookie) === 'true';

  var sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;

  sampler.checkInSample = function (callback) {
    var desiredPercentile = parseInt('__ejs(/*-IN_SAMPLE_PERCENTILE*/);', 10);
    if (callback && typeof callback === 'function') {
      var inSample = inSampleWithoutTC;
      if (technicalCookiePassed || !!percentile) {
        inSample = !!percentile && percentile <= desiredPercentile;
      }
      callback(eligible || inSample);
    }
  };

  sampler._setEligible = function (isEligible, callback) {
    eligible = isEligible === true;
    if (eligible) {
      writeStorage(nameEligibilityCookie, eligible);
    } else {
      deleteStorage(nameEligibilityCookie);
    }
    if (callback && typeof callback === 'function') {
      callback(eligible);
    }
  };

  sampler.getPercentile = function (callback) {
    if (callback && typeof callback === 'function') {
      callback(percentile);
    }
  };
})();
