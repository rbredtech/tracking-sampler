(function() {
  var nameTechnicalCookie = "x-sampler-t";
  var namePercentileCookie = "x-sampler-p";

  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  function setCookie(cname, cvalue) {
    const d = new Date();
    d.setTime(d.getTime() + 1000 * 60 * 60 * 24 * 365 * 2); // 2 years
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  var technicalCookie = parseInt(getCookie(nameTechnicalCookie));
  var now = Date.now();
  if (!technicalCookie) {
    setCookie(nameTechnicalCookie, now);
    technicalCookie = now;
  }

  var percentile = parseInt(getCookie(namePercentileCookie)) || 0;
  if (now - 1000 * 60 * 60 * 24 * 2 > technicalCookie) { // technical cookie is at least 2 days old
    if (!percentile) {
      var percentile = Math.ceil(Math.random() * 100);
      setCookie(namePercentileCookie, percentile);
    }
  }

  console.log("you are in percentile", percentile);

  window.__sample_me = function(group, inSampleCB, outOfSampleCB) {
    var desiredPercentile = 10;
    if (group === "agf") {
      desiredPercentile = 20;
    }
    if (group === "agtt") {
      desiredPercentile = 10;
    }

    if (percentile <= desiredPercentile) {
      if (inSampleCB && typeof inSampleCB === "function") {
        inSampleCB();
      }
    } else {
      if(outOfSampleCB && typeof outOfSampleCB === "function") {
        outOfSampleCB();
      }
    }
  }
})();
