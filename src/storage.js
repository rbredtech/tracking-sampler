function getCookie(name) {
  var cname = name + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === " ") {
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
  document.cookie = name + "=" + value + ";max-age=" + maxAge + ";path=/";
}

function deleteCookie(name) {
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function readStorage(key) {
  var value = null;
  if (window.localStorage && localStorage.getItem) {
    value = localStorage.getItem(key);
    if (value) {
      return value;
    }
  }
  value = getCookie(key);
  return value;
}

function writeStorage(key, value) {
  setCookie(key, value + "");
  if (window.localStorage && localStorage.setItem) {
    localStorage.setItem(key, value + "");
  }
}

function deleteStorage(key) {
  deleteCookie(key);
  if (window.localStorage && localStorage.removeItem) {
    localStorage.removeItem(key);
  }
}
