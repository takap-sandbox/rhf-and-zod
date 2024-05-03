import { useCallback, useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const BaseSchema = z.object({
  name: z.string(),
  age: z.preprocess((v) => Number(v), z.number()),
})

const Schema = BaseSchema.merge(
  z.object({
    id: z.number(),
    nameCount: z.number(),
  }))
  .transform((vals) => ({
    ...vals,
    formattedAge: `${vals.age}歳`,
    formattedName: `${vals.name}(${vals.nameCount})`
  })
)

const Schemas = z.object({
  list: z.array(Schema)
})

const FormSchema = BaseSchema.transform((vals) => ({
  ...vals,
  nameCount: vals.name.length
}))

type InputFormSchema = z.input<typeof FormSchema>;
type OutputFormSchema = z.output<typeof FormSchema>;
type Schema = z.infer<typeof Schema>;
type Schemas = z.infer<typeof Schemas>;

const useApi = () => {

  const endpoint = '/api/test'
  const fetchData = useCallback(async () => {
    const fetchedData = await axios.get(endpoint)
    return Schemas.parse(fetchedData.data)
  }, [])

  const postData = useCallback((values: OutputFormSchema) => {
    return axios.post(endpoint, values)
  }, [])

  return {
    fetchData,
    postData,
  }
}

function App() {
  const { fetchData, postData } = useApi()
  const [data, setData] = useState<Schemas['list']>([])

  const { register, handleSubmit, reset, formState: {errors} } = useForm<InputFormSchema, unknown, OutputFormSchema>({
    resolver: zodResolver(FormSchema),
  });


  const postDataWithMutate = async (values: OutputFormSchema) => {
    const _result = await postData(values)
    // なんかうまいことエラー処理とか
    reset()
    const fetchedData = await fetchData()
    setData(fetchedData.list)
  }

  useEffect(() => {
    fetchData().then((value) => {
      setData(value.list)
    })
  }, [fetchData])

  return (
    <>
      <form onSubmit={handleSubmit(postDataWithMutate)}>
        <input defaultValue='' {...register('name')} />
        <input defaultValue='' type='number' {...register('age')} />
        <input type='submit' />
        <p>{errors.age?.message}</p>
        <p>{errors.name?.message}</p>
      </form>
      {data.map(datum => (
        <div key={datum.id}>
          <p>名前: { datum.formattedName } 年齢: { datum.formattedAge }</p>
        </div>
      ))}
    </>
  )
}

export default App
