import bcrypt from 'bcryptjs'
import { get } from '../config/database.js'

export async function findUserByEmail(email) {
  return get('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email])
}

export async function findUserById(id) {
  return get('SELECT id, name, email FROM users WHERE id = ?', [id])
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}
