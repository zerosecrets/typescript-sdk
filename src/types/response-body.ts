export type ResponseBody = {
  secrets: Array<{
    name: string

    fields: Array<{
      name: string
      value: string
    }>
  }>

  errors?: [
    {
      message: string
    }
  ]
}
