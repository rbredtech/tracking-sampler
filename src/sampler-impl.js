(function () {
  var nameTechnicalCookie = "__ejs(/*-TECHNICAL_COOKIE_NAME*/);";
  var namePercentileCookie = "__ejs(/*-PERCENTILE_COOKIE_NAME*/);";

  __ejs(/*- include("partials/storage.js") */);

  var technicalCookie = parseInt(readStorage(nameTechnicalCookie));
  var percentile = 0;

  var now = Date.now();
  if (!technicalCookie) {
    writeStorage(nameTechnicalCookie, now);
    technicalCookie = now;
  } else {
    if (now - parseInt("__ejs(/*-TECHNICAL_COOKIE_MIN_AGE*/);") > technicalCookie) {
      percentile = parseInt(readStorage(namePercentileCookie));
      if (!percentile) {
        var percentile = Math.floor(Math.random() * 100) + 1;
        writeStorage(namePercentileCookie, percentile);
      }
    }
  }

  sampler = window.__tvi_sampler || {};
  window.__tvi_sampler = sampler;

  sampler.checkInSample = function (callback) {
    var desiredPercentile = parseInt("__ejs(/*-IN_SAMPLE_PERCENTILE*/);");
    if (callback && typeof callback === "function") {
      callback(!!percentile && percentile <= desiredPercentile);
    }
  };
})();
