// ─────────────────────────────────────────────────────────
//  api.js  –  All backend calls in one place
//  Change API_BASE to your Render backend URL
// ─────────────────────────────────────────────────────────

const API_BASE = 'https://your-backend.onrender.com' // ← change this

function getToken() {
  return localStorage.getItem('vg_token')
}

function authHeaders(json = true) {
  const h = { Authorization: `Bearer ${getToken()}` }
  if (json) h['Content-Type'] = 'application/json'
  return h
}

async function handleRes(res) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`)
  return data
}

// ── Auth ──────────────────────────────────────────────────

async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleRes(res)
}

async function apiRegister(name, email, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  return handleRes(res)
}

async function apiForgotPassword(email) {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return handleRes(res)
}

// ── Photos ────────────────────────────────────────────────

async function apiGetPhotos() {
  const res = await fetch(`${API_BASE}/api/photos`, {
    headers: authHeaders(),
  })
  return handleRes(res)
}

async function apiUploadPhoto(formData) {
  const res = await fetch(`${API_BASE}/api/photos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  })
  return handleRes(res)
}

async function apiDeletePhoto(id) {
  const res = await fetch(`${API_BASE}/api/photos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return handleRes(res)
}