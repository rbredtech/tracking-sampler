(function () {
  var __samplerLsAvailable = (function () {
    try {
      if (!window.localStorage) {
        return false;
      }
      var key = 'a';
      var value = new Date().getTime() + '';
      localStorage.setItem(key, value);
      var ls = localStorage.getItem(key);
      localStorage.removeItem(key);
      return ls === value;
    } catch (e) {}
    return false;
  })();

  function getCookie(name) {
    var cname = name + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(cname) === 0) {
        return c.substring(cname.length, c.length);
      }
    }
    return null;
  }

  function setCookie(name, value) {
    var cookie = name + '=' + value + ';max-age=63072000;domain=__ejs(/*-COOKIE_DOMAIN*/);;path=/';
    document.cookie = cookie;
  }

  function deleteCookie(name) {
    var cookie = name + '=;max-age=-1;domain=__ejs(/*-COOKIE_DOMAIN*/);;path=/';
    document.cookie = cookie;
  }

  window.samplerReadStorage = function (key) {
    var value = null;
    if (__samplerLsAvailable) {
      value = localStorage.getItem(key);
      if (value) {
        return value;
      }
    }
    value = getCookie(key);
    return value;
  };

  window.samplerWriteStorage = function (key, value) {
    setCookie(key, value + '');
    if (__samplerLsAvailable) {
      localStorage.setItem(key, value + '');
    }
  };

  window.samplerDeleteStorage = function (key) {
    deleteCookie(key);
    if (__samplerLsAvailable) {
      localStorage.removeItem(key);
    }
  };
})();
