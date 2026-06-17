import express from 'express'
import validator from 'validator'
import { clearCache, getCachedValue, setCachedValue } from '../config/cache.js'
import { logSecurityEvent } from '../config/logger.js'
import {
  createCharacter,
  listCharacters,
  searchLocalCharacters,
} from '../models/CharacterModel.js'
import { authenticateToken } from './auth.js'

const router = express.Router()
const allowedStatuses = new Set(['alive', 'dead', 'unknown'])

function cleanText(value, maxLength = 120) {
  return validator.escape(String(value || '').trim()).slice(0, maxLength)
}

function cleanSearchFilters(query) {
  const filters = {
    name: String(query.name || '').trim().slice(0, 80),
    status: String(query.status || '').trim().toLowerCase(),
    species: String(query.species || '').trim().slice(0, 80),
  }

  if (filters.status && !allowedStatuses.has(filters.status)) {
    throw new Error('Status invalido. Use alive, dead ou unknown.')
  }

  return filters
}

function validateCharacter(body) {
  const character = {
    name: cleanText(body.name),
    status: cleanText(body.status).toLowerCase(),
    species: cleanText(body.species),
    origin: cleanText(body.origin),
    image: String(body.image || '').trim(),
    notes: cleanText(body.notes, 300),
  }

  if (!character.name || !character.status || !character.species || !character.origin || !character.image) {
    throw new Error('Preencha nome, status, especie, origem e imagem.')
  }

  if (!allowedStatuses.has(character.status)) {
    throw new Error('Status invalido. Use alive, dead ou unknown.')
  }

  if (!validator.isURL(character.image, { require_protocol: true })) {
    throw new Error('Informe uma URL de imagem valida.')
  }

  return character
}

function paginateLocalResults(results, page, pageSize = 20) {
  const totalPages = Math.ceil(results.length / pageSize)
  const startIndex = (page - 1) * pageSize

  return {
    info: {
      count: results.length,
      pages: totalPages,
      next: page < totalPages ? page + 1 : null,
      prev: page > 1 && totalPages > 0 ? page - 1 : null,
    },
    results: results.slice(startIndex, startIndex + pageSize),
  }
}

router.use(authenticateToken)

router.get('/', async (req, res, next) => {
  try {
    const results = await listCharacters()
    logSecurityEvent('local_characters_listed', {
      userId: req.user.id,
      total: results.length,
    })

    return res.json({ results })
  } catch (error) {
    return next(error)
  }
})

router.get('/search', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1))
    const filters = cleanSearchFilters(req.query)
    const cacheKey = JSON.stringify({ filters, page })
    const cached = getCachedValue(cacheKey)

    if (cached) {
      logSecurityEvent('character_search_cache_hit', { userId: req.user.id, filters, page })
      return res.json(cached)
    }

    const localCharacters = await searchLocalCharacters(filters)
    const result = paginateLocalResults(localCharacters, page)

    setCachedValue(cacheKey, result)
    logSecurityEvent('character_search', {
      userId: req.user.id,
      filters,
      page,
      total: result.info.count,
    })

    return res.json(result)
  } catch (error) {
    if (error.message.includes('Status invalido')) {
      return res.status(400).json({ message: error.message })
    }

    return next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const character = validateCharacter(req.body)
    const savedCharacter = await createCharacter(character, req.user.id)
    clearCache()

    logSecurityEvent('character_created', {
      userId: req.user.id,
      characterId: savedCharacter.id,
      name: savedCharacter.name,
    })

    return res.status(201).json({ character: savedCharacter })
  } catch (error) {
    if (
      error.message.includes('Preencha') ||
      error.message.includes('Status invalido') ||
      error.message.includes('URL')
    ) {
      return res.status(400).json({ message: error.message })
    }

    return next(error)
  }
})

export default router
