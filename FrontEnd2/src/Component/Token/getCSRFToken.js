import Cookies from 'js-cookie';
function getCSRFTokenFromCookie(name) {
  return Cookies.get(name) || null;
}

export { getCSRFTokenFromCookie };
