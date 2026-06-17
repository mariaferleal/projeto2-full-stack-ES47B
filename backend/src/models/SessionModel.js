import { get, run } from '../config/database.js'

export async function revokeToken(token, userId) {
  return run(
    'INSERT INTO revoked_tokens (token, user_id) VALUES (?, ?) ON CONFLICT (token) DO NOTHING',
    [token, userId],
  )
}

export async function isTokenRevoked(token) {
  const row = await get('SELECT token FROM revoked_tokens WHERE token = ?', [token])
  return Boolean(row)
}
