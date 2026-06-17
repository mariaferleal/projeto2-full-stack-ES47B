import express from 'express'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import { logSecurityEvent } from '../config/logger.js'
import { isTokenRevoked, revokeToken } from '../models/SessionModel.js'
import { findUserByEmail, findUserById, verifyPassword } from '../models/UserModel.js'

const router = express.Router()
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me'
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '2h'

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

function getBearerToken(req) {
  const authorization = req.headers.authorization || ''
  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return ''
  }

  return token
}

export async function authenticateToken(req, res, next) {
  const token = getBearerToken(req)

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticacao nao informado.' })
  }

  try {
    if (await isTokenRevoked(token)) {
      return res.status(401).json({ message: 'Sessao expirada. Faca login novamente.' })
    }

    const payload = jwt.verify(token, jwtSecret)
    const user = await findUserById(payload.sub)

    if (!user) {
      return res.status(401).json({ message: 'Usuario nao encontrado.' })
    }

    req.user = user
    req.token = token
    return next()
  } catch {
    return res.status(401).json({ message: 'Token invalido ou expirado.' })
  }
}

router.post('/login', async (req, res, next) => {
  try {
    const email = validator.normalizeEmail(String(req.body.email || '').trim())
    const password = String(req.body.password || '')

    if (!email || !validator.isEmail(email) || !password) {
      logSecurityEvent('login_validation_failed', { email: email || 'empty' })
      return res.status(400).json({ message: 'Informe e-mail e senha validos.' })
    }

    const user = await findUserByEmail(email)
    const validPassword = user ? await verifyPassword(password, user.password_hash) : false

    if (!user || !validPassword) {
      logSecurityEvent('login_failed', { email })
      return res.status(401).json({ message: 'Credenciais invalidas.' })
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, jwtSecret, {
      expiresIn: jwtExpiresIn,
    })

    logSecurityEvent('login_success', { userId: user.id, email })
    return res.json({ token, user: publicUser(user) })
  } catch (error) {
    return next(error)
  }
})

router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    await revokeToken(req.token, req.user.id)
    logSecurityEvent('logout', { userId: req.user.id })
    return res.json({ message: 'Logout realizado com sucesso.' })
  } catch (error) {
    return next(error)
  }
})

export default router
