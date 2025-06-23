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

  sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;

  sampler.setPercentile = function (percentile, callback) {
    var image = document.createElement('img');
    image.src = window.location.protocol + '//{{SAMPLER_HOST}}{{SAMPLER_PATH}}set-percentile?p=' + percentile;

    image.onload = function () {
      writeStorage('{{PERCENTILE_COOKIE_NAME}}', percentile);

      if (callback && typeof callback === 'function') {
        callback(percentile);
      }
    };
  };

  sampler.isTechCookieValid = function (callback) {
    if (callback && typeof callback === 'function') {
      callback(technicalCookiePassed);
    }
  };

  sampler.setValidTechCookie = function (callback) {
    var validTechCookieValue = new Date().getTime() - parseInt('{{TECH_COOKIE_MIN_AGE}}') * 2;
    var image = document.createElement('img');
    image.src = window.location.protocol + '//{{SAMPLER_HOST}}{{SAMPLER_PATH}}set-valid-tech-cookie?x=' + validTechCookieValue;

    image.onload = function () {
      writeStorage('{{TECH_COOKIE_NAME}}', validTechCookieValue);

      if (callback && typeof callback === 'function') {
        callback();
      }
    };
  };

  sampler.reset = function (callback) {
    var image = document.createElement('img');
    image.src = window.location.protocol + '//{{SAMPLER_HOST}}{{SAMPLER_PATH}}reset';

    image.onload = function () {
      deleteStorage('{{TECH_COOKIE_NAME}}');
      deleteStorage('{{PERCENTILE_COOKIE_NAME}}');

      if (callback && typeof callback === 'function') {
        callback();
      }
    };
  };
})();
