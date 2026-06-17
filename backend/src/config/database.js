import bcrypt from 'bcryptjs'
import pg from 'pg'

const { Client, Pool } = pg
const databaseName = process.env.PGDATABASE || 'rickandmorty'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: databaseName,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  max: Number(process.env.DB_POOL_SIZE || 10),
})

function getTargetDatabaseName() {
  if (!process.env.DATABASE_URL) {
    return databaseName
  }

  const databaseUrl = new URL(process.env.DATABASE_URL)
  return databaseUrl.pathname.replace(/^\//, '')
}

function getAdminDatabaseConfig() {
  if (!process.env.DATABASE_URL) {
    return {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      database: 'postgres',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
    }
  }

  const adminUrl = new URL(process.env.DATABASE_URL)
  adminUrl.pathname = '/postgres'

  return { connectionString: adminUrl.toString() }
}

async function ensureDatabaseExists() {
  const targetDatabase = getTargetDatabaseName()

  if (targetDatabase === 'postgres') {
    return
  }

  if (!/^[a-zA-Z0-9_]+$/.test(targetDatabase)) {
    throw new Error('Nome do banco invalido. Use apenas letras, numeros e underline.')
  }

  const client = new Client(getAdminDatabaseConfig())

  try {
    await client.connect()
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      targetDatabase,
    ])

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${targetDatabase}"`)
    }
  } finally {
    await client.end()
  }
}

function normalizeSql(sql) {
  let paramIndex = 0
  return sql.replace(/\?/g, () => `$${++paramIndex}`)
}

export function run(sql, params = []) {
  return pool.query(normalizeSql(sql), params).then((result) => ({
    id: result.rows[0]?.id,
    changes: result.rowCount,
  }))
}

export function get(sql, params = []) {
  return pool.query(normalizeSql(sql), params).then((result) => result.rows[0])
}

export function all(sql, params = []) {
  return pool.query(normalizeSql(sql), params).then((result) => result.rows)
}

export async function initDatabase() {
  await ensureDatabaseExists()

  await run(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`)

  await run(`CREATE TABLE IF NOT EXISTS revoked_tokens (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    revoked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`)

  await run(`CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    species TEXT NOT NULL,
    origin TEXT NOT NULL,
    image TEXT NOT NULL,
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`)

  const existingUser = await get('SELECT id FROM users WHERE email = ?', ['rick@citadel.com'])

  if (!existingUser) {
    const passwordHash = await bcrypt.hash('portal123', 12)
    await run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      ['Rick Sanchez', 'rick@citadel.com', passwordHash],
    )
  }

  const user = await get('SELECT id FROM users WHERE email = ?', ['rick@citadel.com'])
  const characterCount = await get('SELECT COUNT(*) as total FROM characters')

  if (user && Number(characterCount.total) === 0) {
    const seedCharacters = [
      {
        name: 'Rick Sanchez',
        status: 'alive',
        species: 'Human',
        origin: 'Earth (C-137)',
        image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        notes: 'Cientista brilhante e criador da arma de portais.',
      },
      {
        name: 'Morty Smith',
        status: 'alive',
        species: 'Human',
        origin: 'Earth (C-137)',
        image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
        notes: 'Neto do Rick e parceiro frequente nas aventuras.',
      },
      {
        name: 'Summer Smith',
        status: 'alive',
        species: 'Human',
        origin: 'Earth (Replacement Dimension)',
        image: 'https://rickandmortyapi.com/api/character/avatar/3.jpeg',
        notes: 'Irma da Morty e integrante das aventuras da familia Smith.',
      },
      {
        name: 'Birdperson',
        status: 'alive',
        species: 'Bird-Person',
        origin: 'Bird World',
        image: 'https://rickandmortyapi.com/api/character/avatar/47.jpeg',
        notes: 'Antigo amigo de Rick e guerreiro da resistencia.',
      },
      {
        name: 'Mr. Meeseeks',
        status: 'unknown',
        species: 'Meeseeks',
        origin: 'Meeseeks Box',
        image: 'https://rickandmortyapi.com/api/character/avatar/242.jpeg',
        notes: 'Criatura criada para completar uma tarefa especifica.',
      },
    ]

    for (const character of seedCharacters) {
      await run(
        `INSERT INTO characters (name, status, species, origin, image, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          character.name,
          character.status,
          character.species,
          character.origin,
          character.image,
          character.notes,
          user.id,
        ],
      )
    }
  }
}
