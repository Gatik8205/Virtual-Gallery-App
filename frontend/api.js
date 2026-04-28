// ─────────────────────────────────────────────────────────
//  api.js  –  Matches server.js routes exactly
// ─────────────────────────────────────────────────────────

const API_BASE = 'https://virtual-gallery-app.onrender.com' // ← your Render URL

function getToken() {
  return localStorage.getItem('vg_token')
}

// No "Bearer " prefix — server uses token directly
function authHeaders(json = true) {
  const h = { Authorization: getToken() }
  if (json) h['Content-Type'] = 'application/json'
  return h
}

async function handleRes(res) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`)
  return data
}

// ── Auth ──────────────────────────────────────────────────

async function apiLogin(email, password) {
  // Returns: { token }
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleRes(res)
}

async function apiRegister(name, email, password) {
  // Returns: { message }
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  return handleRes(res)
}

async function apiForgotPassword(email) {
  // Returns: { message }
  const res = await fetch(`${API_BASE}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return handleRes(res)
}

// ── Photos ────────────────────────────────────────────────

async function apiGetPhotos() {
  // Returns: [{ url, id, uploadedBy }, ...]
  const res = await fetch(`${API_BASE}/images`, {
    headers: authHeaders(),
  })
  return handleRes(res)
}

async function apiUploadPhoto(formData) {
  // formData must use field name 'image' (not 'file')
  // Returns: { message, url }
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { Authorization: getToken() }, // no Content-Type for multipart
    body: formData,
  })
  return handleRes(res)
}

async function apiDeletePhoto(id) {
  // Returns: { message }
  const res = await fetch(`${API_BASE}/image/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return handleRes(res)
}