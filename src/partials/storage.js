/* eslint-disable hbbtv-compat/no-unsupported-js */
var lsAvailable = (function () {
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
  // not decoded: our values are plain ASCII, and decoding would throw on any malformed cookie of the host app
  var ca = document.cookie.split(';');
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
  var maxAge = 60 * 60 * 24 * 365 * 2; // 2 years
  // expires as well, for older browsers that ignore max-age and would keep the cookie for the session only
  var expires = new Date(new Date().getTime() + maxAge * 1000).toUTCString();
  var cookie = name + '=' + value + ';expires=' + expires + ';max-age=' + maxAge + ';path=/';
  document.cookie = cookie;
}

function deleteCookie(name) {
  var cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;max-age=-1;path=/';
  document.cookie = cookie;
}

function readStorage(key) {
  var value = null;
  if (lsAvailable) {
    value = localStorage.getItem(key);
    if (value) {
      return value;
    }
  }
  value = getCookie(key);
  return value;
}

function writeStorage(key, value) {
  setCookie(key, value + '');
  if (lsAvailable) {
    localStorage.setItem(key, value + '');
  }
}

function deleteStorage(key) {
  deleteCookie(key);
  if (lsAvailable) {
    localStorage.removeItem(key);
  }
}
