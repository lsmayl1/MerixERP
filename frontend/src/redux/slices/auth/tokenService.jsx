export const setCookie = (name, value, days) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    "; expires=" +
    expires +
    "; path=/";
};

export const getCookie = (name) => {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
};

export const deleteCookie = (name) => {
  setCookie(name, "", -1);
};

export const saveToken = (token) => {
  setCookie("token", token, 7); // Save token for 7 days
};

export const saveRole = (role) => {
  localStorage.setItem("role", role);
};

export const getRole = () => {
  const role = localStorage.getItem("role");
  if (role) {
    return role;
  }
};
