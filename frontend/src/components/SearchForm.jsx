import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useCharacters } from '../contexts/CharacterContext'

const schema = yup.object({
  name: yup.string().trim(),
  status: yup.string().oneOf(['', 'alive', 'dead', 'unknown']),
  species: yup.string().trim(),
})

function SearchForm() {
  const { filters, loading, searchCharacters } = useCharacters()
  const { register, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    defaultValues: filters,
  })

  function onSubmit(values) {
    searchCharacters(values, 1)
  }

  return (
    <form className="form-grid search-form" onSubmit={handleSubmit(onSubmit)}>
      <label>
        Nome
        <input placeholder="Rick, Morty, Summer..." {...register('name')} />
      </label>

      <label>
        Status
        <select {...register('status')}>
          <option value="">Todos</option>
          <option value="alive">Vivo</option>
          <option value="dead">Morto</option>
          <option value="unknown">Desconhecido</option>
        </select>
      </label>

      <label>
        Especie
        <input placeholder="Human, Alien..." {...register('species')} />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  )
}

export default SearchForm
