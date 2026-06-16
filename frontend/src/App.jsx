import { useEffect, useRef } from 'react'
import CharacterForm from './components/CharacterForm'
import CharacterList from './components/CharacterList'
import ErrorMessage from './components/ErrorMessage'
import Loading from './components/Loading'
import LoginForm from './components/LoginForm'
import Pagination from './components/Pagination'
import SearchForm from './components/SearchForm'
import { useAuth } from './contexts/AuthContext'
import { useCharacters } from './contexts/CharacterContext'

function App() {
  const { user, isAuthenticated, logout } = useAuth()
  const loadedLocalCharacters = useRef(false)
  const {
    characters,
    localCharacters,
    info,
    currentPage,
    loading,
    error,
    success,
    hasSearched,
    fetchLocalCharacters,
    goToPage,
  } = useCharacters()

  useEffect(() => {
    if (!isAuthenticated) {
      loadedLocalCharacters.current = false
      return
    }

    if (isAuthenticated) {
      if (loadedLocalCharacters.current) {
        return
      }

      loadedLocalCharacters.current = true
      fetchLocalCharacters()
    }
  }, [fetchLocalCharacters, isAuthenticated])

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Projeto 2 - ES47B</p>
          <h1>Rick and Morty REST Lab</h1>
          <p>
            Aplicacao fullstack com login, busca e insercao de personagens no tema
            Rick and Morty, armazenados no banco local da aplicacao.
          </p>
        </div>

        {isAuthenticated && (
          <div className="session-card">
            <span>Logado como</span>
            <strong>{user?.name}</strong>
            <button type="button" onClick={logout}>
              Sair
            </button>
          </div>
        )}
      </section>

      {!isAuthenticated ? (
        <LoginForm />
      ) : (
        <>
          <section className="panel">
            <h2>Buscar personagens</h2>
            <SearchForm />
          </section>

          <section className="panel">
            <h2>Inserir personagem</h2>
            <CharacterForm />
          </section>

          {error && <ErrorMessage message={error} />}
          {success && <p className="success-message">{success}</p>}
          {loading && <Loading />}

          {hasSearched && !loading && (
            <section className="panel results-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Busca REST</p>
                  <h2>Resultados do banco local</h2>
                </div>
                {info && <span>{info.count} registros encontrados</span>}
              </div>
              <CharacterList characters={characters} />
              <Pagination info={info} currentPage={currentPage} onPageChange={goToPage} />
            </section>
          )}

          {localCharacters.length > 0 && (
            <section className="panel results-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Banco local</p>
                  <h2>Personagens inseridos</h2>
                </div>
                <span>{localCharacters.length} registros locais</span>
              </div>
              <CharacterList characters={localCharacters} />
            </section>
          )}
        </>
      )}
    </main>
  )
}

export default App
