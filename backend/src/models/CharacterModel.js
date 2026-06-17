import { all, run } from '../config/database.js'

function mapCharacter(row) {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    species: row.species,
    origin: row.origin,
    image: row.image,
    notes: row.notes,
    source: 'local',
    createdAt: row.created_at,
  }
}

export async function listCharacters() {
  const rows = await all(
    `SELECT id, name, status, species, origin, image, notes, created_at
     FROM characters
     ORDER BY created_at DESC`,
  )

  return rows.map(mapCharacter)
}

export async function searchLocalCharacters(filters) {
  const clauses = []
  const params = []

  if (filters.name) {
    clauses.push('LOWER(name) LIKE ?')
    params.push(`%${filters.name.toLowerCase()}%`)
  }

  if (filters.status) {
    clauses.push('LOWER(status) = ?')
    params.push(filters.status.toLowerCase())
  }

  if (filters.species) {
    clauses.push('LOWER(species) LIKE ?')
    params.push(`%${filters.species.toLowerCase()}%`)
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const rows = await all(
    `SELECT id, name, status, species, origin, image, notes, created_at
     FROM characters
     ${where}
     ORDER BY created_at DESC`,
    params,
  )

  return rows.map(mapCharacter)
}

export async function createCharacter(character, userId) {
  const result = await run(
    `INSERT INTO characters (name, status, species, origin, image, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     RETURNING id`,
    [
      character.name,
      character.status,
      character.species,
      character.origin,
      character.image,
      character.notes,
      userId,
    ],
  )

  return {
    id: result.id,
    ...character,
    source: 'local',
  }
}
