// Frontend/src/api/client.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };

  let body = options.body;

  const isPlainObject =
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob);

  if (isPlainObject) {
    body = JSON.stringify(body);
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  } else {
    // if body is FormData or Blob, do NOT set Content-Type (fetch will set boundary)
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    throw err;
  }

  return data;
}
