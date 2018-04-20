export const getCookie = (name) => {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = String(cookies[i]).trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export const removeDuplicates = (array, key) => array
  .filter(Boolean)
  .filter((obj, pos, arr) => arr
    .map(mapObj => mapObj[key]).indexOf(obj[key]) === pos);

