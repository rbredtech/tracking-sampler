(function () {
  var nameTechnicalCookie = '__ejs(/*-TECH_COOKIE_NAME*/);';
  var namePercentileCookie = '__ejs(/*-PERCENTILE_COOKIE_NAME*/);';
  var nameEligibilityCookie = '__ejs(/*-ELIGIBILITY_COOKIE_NAME*/);';
  var nameEligibilityRoundCookie = '__ejs(/*-ELIGIBILITY_ROUND_COOKIE_NAME*/);';
  // Identifies the backend's list of eligible devices; empty when there is none
  var eligibilityRound = '{{ELIGIBILITY_ROUND}}';
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

  function isInSample() {
    var minPercentile = parseInt('__ejs(/*-IN_SAMPLE_PERCENTILE_MIN*/);', 10);
    var maxPercentile = parseInt('__ejs(/*-IN_SAMPLE_PERCENTILE_MAX*/);', 10);
    var inSample = inSampleWithoutTC;
    if (technicalCookiePassed || !!percentile) {
      inSample = !!percentile && percentile >= minPercentile && percentile <= maxPercentile;
    }
    return eligible || inSample;
  }

  // Once per round, a device out of sample asks the backend whether it is on the list
  function isEligibilityCheckDue() {
    return !!eligibilityRound && !isInSample() && readStorage(nameEligibilityRoundCookie) !== eligibilityRound;
  }

  sampler.checkInSample = function (callback) {
    if (callback && typeof callback === 'function') {
      callback(isInSample());
    }
  };

  sampler._setEligible = function (isEligible, callback) {
    if (isEligible === true) {
      writeStorage(nameEligibilityCookie, true);
    } else {
      deleteStorage(nameEligibilityCookie);
    }
    eligible = readStorage(nameEligibilityCookie) === 'true';
    if (callback && typeof callback === 'function') {
      callback(eligible);
    }
  };

  sampler._shouldCheckEligibility = function (callback) {
    if (callback && typeof callback === 'function') {
      callback(isEligibilityCheckDue());
    }
  };

  // Called by the tracking script's eligibility.js with the device ID tracking stored, or '' without one
  sampler._checkEligibility = function (deviceId) {
    if (!isEligibilityCheckDue()) {
      return;
    }

    // Tracking never ran on a device without an ID, so it cannot be on the list
    if (!deviceId) {
      writeStorage(nameEligibilityRoundCookie, eligibilityRound);
      return;
    }

    var head = document.getElementsByTagName('head')[0];
    if (!head) {
      return;
    }
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute(
      'src',
      window.location.protocol +
        "//{{SAMPLER_HOST}}{{SAMPLER_PATH}}set_eligible__ejs(/*= __CONFIG_NAME ? '-' + __CONFIG_NAME : '' */);.js?did=" +
        encodeURIComponent(deviceId) +
        '&ts=' +
        new Date().getTime()
    );
    head.appendChild(script);
  };

  // Called by the backend's set_eligible.js; the round is stored only once a marking held, so a failed one is retried
  sampler._eligibilityChecked = function (isEligible, round) {
    if (isEligible !== true) {
      writeStorage(nameEligibilityRoundCookie, round);
      return;
    }
    sampler._setEligible(true, function (marked) {
      if (marked) {
        writeStorage(nameEligibilityRoundCookie, round);
      }
    });
  };

  sampler.getPercentile = function (callback) {
    if (callback && typeof callback === 'function') {
      callback(percentile);
    }
  };
})();
