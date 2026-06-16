/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer } from 'react'
import { useAuth } from './AuthContext'

const API_URL = '/api/characters'

const CharacterContext = createContext(null)

const initialState = {
  characters: [],
  localCharacters: [],
  info: null,
  currentPage: 1,
  filters: {
    name: '',
    status: '',
    species: '',
  },
  loading: false,
  error: '',
  success: '',
  hasSearched: false,
}

function characterReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: '', success: '' }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        characters: action.payload.results,
        info: action.payload.info,
        currentPage: action.payload.page,
        filters: action.payload.filters,
        hasSearched: true,
      }
    case 'FETCH_LOCAL_SUCCESS':
      return { ...state, localCharacters: action.payload }
    case 'CREATE_SUCCESS':
      return {
        ...state,
        loading: false,
        localCharacters: [action.payload, ...state.localCharacters],
        success: 'Personagem inserido com sucesso.',
      }
    case 'ERROR':
      return { ...state, loading: false, error: action.payload }
    case 'CLEAR_MESSAGE':
      return { ...state, error: '', success: '' }
    default:
      return state
  }
}

export function CharacterProvider({ children }) {
  const [state, dispatch] = useReducer(characterReducer, initialState)
  const { token } = useAuth()

  function getHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  async function parseResponse(response) {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Nao foi possivel concluir a operacao.')
    }

    return data
  }

  async function searchCharacters(filters, page = 1) {
    dispatch({ type: 'FETCH_START' })

    try {
      const params = new URLSearchParams()
      params.set('page', page)

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })

      const response = await fetch(`${API_URL}/search?${params.toString()}`, {
        headers: getHeaders(),
      })
      const data = await parseResponse(response)

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { ...data, page, filters },
      })
    } catch (error) {
      dispatch({ type: 'ERROR', payload: error.message })
    }
  }

  async function fetchLocalCharacters() {
    if (!token) {
      return
    }

    try {
      const response = await fetch(API_URL, { headers: getHeaders() })
      const data = await parseResponse(response)
      dispatch({ type: 'FETCH_LOCAL_SUCCESS', payload: data.results })
    } catch (error) {
      dispatch({ type: 'ERROR', payload: error.message })
    }
  }

  async function createCharacter(character) {
    dispatch({ type: 'FETCH_START' })

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(character),
      })
      const data = await parseResponse(response)
      dispatch({ type: 'CREATE_SUCCESS', payload: data.character })
      return true
    } catch (error) {
      dispatch({ type: 'ERROR', payload: error.message })
      return false
    }
  }

  function goToPage(page) {
    searchCharacters(state.filters, page)
  }

  const value = {
    ...state,
    searchCharacters,
    fetchLocalCharacters,
    createCharacter,
    goToPage,
    clearMessage: () => dispatch({ type: 'CLEAR_MESSAGE' }),
  }

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>
}

export function useCharacters() {
  const context = useContext(CharacterContext)

  if (!context) {
    throw new Error('useCharacters deve ser utilizado dentro de CharacterProvider.')
  }

  return context
}
