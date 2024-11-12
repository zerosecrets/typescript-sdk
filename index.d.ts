import {ReturnTypeZero} from './src/types'
import {NewConfig} from './src/types/new-config'
import {OldConfig} from './src/types/old-config'
import {ResponseBody} from './src/types/response-body'

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
  export const zero: <T extends NewConfig | OldConfig>(config: T) => ReturnTypeZero<T>
}

declare module 'tests/data/mock' {
  export const secretsResponse: ResponseBody
}

declare module 'tests/index.test' {}
