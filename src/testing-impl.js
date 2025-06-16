(function () {
  __ejs(/*- include("partials/storage.js") */);

  sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;

  sampler.setPercentile = function (percentile, callback) {
    writeStorage('{{PERCENTILE_COOKIE_NAME}}', percentile);
    if (callback && typeof callback === 'function') {
      callback(percentile);
    }
  };

  sampler.isTechCookieValid = function (callback) {
    var technicalCookie = parseInt(readStorage('{{TECH_COOKIE_NAME}}')) || null;
    if (callback && typeof callback === 'function') {
      callback(!!technicalCookie && Date.now() - parseInt('{{TECHNICAL_COOKIE_MIN_AGE}}') > technicalCookie);
    }
  };

  sampler.setValidTechCookie = function (callback) {
    writeStorage('{{TECH_COOKIE_NAME}}', Date.now() - parseInt('{{TECHNICAL_COOKIE_MIN_AGE}}') * 2);
    if (callback && typeof callback === 'function') {
      callback();
    }
  };

  sampler.reset = function (callback) {
    deleteStorage('{{TECH_COOKIE_NAME}}');
    deleteStorage('{{PERCENTILE_COOKIE_NAME}}');
    if (callback && typeof callback === 'function') {
      callback();
    }
  };
})();
