import CharacterCard from './CharacterCard'

function CharacterList({ characters }) {
  if (!characters.length) {
    return <p className="empty-state">Nenhum personagem encontrado.</p>
  }

  return (
    <div className="character-grid">
      {characters.map((character) => (
        <CharacterCard key={`${character.source || 'api'}-${character.id}`} character={character} />
      ))}
    </div>
  )
}

export default CharacterList
