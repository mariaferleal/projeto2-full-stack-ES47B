import 'dotenv/config'
import fs from 'node:fs'
import https from 'node:https'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './src/routes/auth.js'
import characterRoutes from './src/routes/characters.js'
import { initDatabase } from './src/config/database.js'
import { logSecurityEvent } from './src/config/logger.js'

const app = express()
const port = Number(process.env.PORT || 3001)

function getHttpsOptions() {
  const keyPath = process.env.SSL_KEY_PATH
  const certPath = process.env.SSL_CERT_PATH

  if (!keyPath || !certPath) {
    return null
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  }
}

app.use(helmet())
app.use(compression())
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '20kb' }))
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
)

app.use('/api', authRoutes)
app.use('/api/characters', characterRoutes)

app.use((error, req, res, _next) => {
  logSecurityEvent('server_error', {
    method: req.method,
    path: req.path,
    message: error.message,
  })

  res.status(500).json({ message: 'Erro interno do servidor.' })
})

await initDatabase()

const httpsOptions = getHttpsOptions()

if (httpsOptions) {
  https.createServer(httpsOptions, app).listen(port, () => {
    console.log(`Backend Rick and Morty REST ouvindo em https://localhost:${port}`)
  })
} else {
  app.listen(port, () => {
    console.log(`Backend Rick and Morty REST ouvindo em http://localhost:${port}`)
  })
}
