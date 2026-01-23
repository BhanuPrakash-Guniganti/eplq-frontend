import { BASE_URL } from "../config";

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("eplq_token");

  const finalOptions = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  const res = await fetch(BASE_URL + url, finalOptions);

  if (res.status === 401) {
    localStorage.removeItem("eplq_token");
    window.location.href = "/login";
    return Promise.reject(new Error("Unauthorized"));
  }

  return res;
}
