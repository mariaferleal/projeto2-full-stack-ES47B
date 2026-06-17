import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import selfsigned from 'selfsigned'

const here = path.dirname(fileURLToPath(import.meta.url))
const certsDir = path.join(here, 'certs')
const keyPath = path.join(certsDir, 'localhost-key.pem')
const certPath = path.join(certsDir, 'localhost-cert.pem')

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('Certificados ja existem em backend/certs. Nada a fazer.')
  process.exit(0)
}

const attributes = [{ name: 'commonName', value: 'localhost' }]
const pems = await selfsigned.generate(attributes, {
  days: 365,
  keySize: 2048,
  algorithm: 'sha256',
  extensions: [
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'localhost' },
        { type: 7, ip: '127.0.0.1' },
      ],
    },
  ],
})

fs.mkdirSync(certsDir, { recursive: true })
fs.writeFileSync(keyPath, pems.private)
fs.writeFileSync(certPath, pems.cert)

console.log('Certificados gerados em backend/certs (localhost-key.pem e localhost-cert.pem).')
