export const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = String(cookies[i]).trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export const getCSRFCookie = (name) => {
  // When the HttpOnly flag on the CSRF cookie is set to true, client-side
  // JavaScript will not to be able to access the CSRF cookie, forcing it
  // to retrieve it from the DOM (if set)
  // https://docs.djangoproject.com/en/2.1/ref/settings/#csrf-cookie-httponly
  let cookieValue = getCookie(name);
  const csrfToken = document.getElementsByName('csrfmiddlewaretoken')
  if (!cookieValue && csrfToken.length) {
    cookieValue = csrfToken[0].value;
  }
  return cookieValue;
}

export const removeDuplicates = (array, key) => array
  .filter(Boolean)
  .filter((obj, pos, arr) => arr
    .map(mapObj => mapObj[key]).indexOf(obj[key]) === pos);

