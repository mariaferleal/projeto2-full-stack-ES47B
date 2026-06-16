import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useCharacters } from '../contexts/CharacterContext'

const schema = yup.object({
  name: yup.string().trim().min(2, 'Informe ao menos 2 caracteres.').required('Nome obrigatorio.'),
  status: yup.string().oneOf(['alive', 'dead', 'unknown']).required('Status obrigatorio.'),
  species: yup.string().trim().required('Especie obrigatoria.'),
  origin: yup.string().trim().required('Origem obrigatoria.'),
  image: yup.string().trim().url('Informe uma URL valida.').required('Imagem obrigatoria.'),
  notes: yup.string().trim().max(300, 'Use no maximo 300 caracteres.'),
})

function CharacterForm() {
  const { createCharacter, fetchLocalCharacters, loading } = useCharacters()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      status: 'alive',
      species: 'Human',
      origin: 'Earth (C-137)',
      image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
      notes: '',
    },
  })

  async function onSubmit(values) {
    const created = await createCharacter(values)

    if (created) {
      await fetchLocalCharacters()
      reset()
    }
  }

  return (
    <form className="form-grid insert-form" onSubmit={handleSubmit(onSubmit)}>
      <label>
        Nome
        <input {...register('name')} />
        {errors.name && <small>{errors.name.message}</small>}
      </label>

      <label>
        Status
        <select {...register('status')}>
          <option value="alive">Vivo</option>
          <option value="dead">Morto</option>
          <option value="unknown">Desconhecido</option>
        </select>
      </label>

      <label>
        Especie
        <input {...register('species')} />
        {errors.species && <small>{errors.species.message}</small>}
      </label>

      <label>
        Origem
        <input {...register('origin')} />
        {errors.origin && <small>{errors.origin.message}</small>}
      </label>

      <label className="wide">
        URL da imagem
        <input {...register('image')} />
        {errors.image && <small>{errors.image.message}</small>}
      </label>

      <label className="wide">
        Observacoes
        <textarea rows="3" {...register('notes')} />
        {errors.notes && <small>{errors.notes.message}</small>}
      </label>

      <button type="submit" disabled={loading}>
        Inserir personagem
      </button>
    </form>
  )
}

export default CharacterForm
