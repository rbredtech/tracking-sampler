// Stands in for the tracking script's eligibility.js: hands the sampler the device ID a test stored in the did cookie
(function () {
  var match = /(?:^|; )did=([^;]*)/.exec(document.cookie);
  window.__tvi_sampler._checkEligibility(match ? match[1] : "");
})();
