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

function readStorage(key) {
  return lsAvailable ? localStorage.getItem(key) : null;
}

function writeStorage(key, value) {
  if (!lsAvailable) {
    return;
  }
  localStorage.setItem(key, value + '');
}

function deleteStorage(key) {
  if (!lsAvailable) {
    return;
  }
  localStorage.removeItem(key);
}
