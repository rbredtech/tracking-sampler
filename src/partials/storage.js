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
  var maxAge = 60 * 60 * 24 * 365 * 2; // 2 years
  var cookie = name + '=' + value + ';max-age=' + maxAge + ';path=/';
  document.cookie = cookie;
}

function deleteCookie(name) {
  var cookie = name + '=;max-age=-1;path=/';
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
