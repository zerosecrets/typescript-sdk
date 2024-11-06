declare module 'graphql/secrets' {
  export const Secrets: string
}

declare module 'types/response-body' {
  export type ResponseBody = {
    secrets: Array<{
      name: string

      fields: Array<{
        name: string
        value: string
      }>
    }>

    errors?: Array<{
      message: string
    }>
  }
}

declare module 'index' {
  import {DeprecatedZeroClient, NewConfig, OldConfig, ZeroClient} from './types'

  export const zero: (config: NewConfig | OldConfig) => ZeroClient | DeprecatedZeroClient
}

declare module 'tests/data/mock' {
  import {ResponseBody} from 'types/index'
  export const secretsResponse: ResponseBody
}

declare module 'tests/index.test' {}
