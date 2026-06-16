const statusLabels = {
  Alive: 'Vivo',
  Dead: 'Morto',
  unknown: 'Desconhecido',
  alive: 'Vivo',
  dead: 'Morto',
}

function CharacterCard({ character }) {
  const origin = typeof character.origin === 'string' ? character.origin : character.origin?.name
  const status = statusLabels[character.status] || character.status

  return (
    <article className="character-card">
      <img src={character.image} alt={`Imagem de ${character.name}`} />
      <div className="character-content">
        <span className="source-badge">{character.source === 'local' ? 'Local' : 'API'}</span>
        <h3>{character.name}</h3>
        <p>
          <strong>Status:</strong> {status}
        </p>
        <p>
          <strong>Especie:</strong> {character.species}
        </p>
        <p>
          <strong>Origem:</strong> {origin || 'Desconhecida'}
        </p>
        {character.notes && <p className="notes">{character.notes}</p>}
      </div>
    </article>
  )
}

export default CharacterCard
