/* Pembungkus fetch ke API internal (/api/...) untuk komponen client */

export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch("/api" + path, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error((data && data.error) || "Terjadi kesalahan (" + res.status + ").");
    err.status = res.status;
    throw err;
  }
  return data;
}
