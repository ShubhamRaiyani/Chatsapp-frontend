// src/utils/cookieUtils.js
export function getCookieValue(name) {
  const matches = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/([.*+?^${}()|[\]\\])/g, "\\$1")}=([^;]*)`
    )
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}
