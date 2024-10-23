import {GraphQLClient} from 'graphql-request'
import {Secrets} from './graphql/secrets'
import {ResponseBody} from './types'
const GRAPHQL_ENDPOINT_URL = 'https://core.tryzero.com/graphql'

export const zero = (params: {pick: Array<string>; token: string; callerName?: string}) => {
  if (typeof params.token === 'undefined' || params.token.length === 0) {
    throw new Error('Zero token should be non-empty string')
  }

  const client = new GraphQLClient(GRAPHQL_ENDPOINT_URL, {
    headers: {},
  })

  return {
    async fetch(): Promise<{[key: string]: {[key: string]: string} | undefined}> {
      const response = await client.request<ResponseBody>(Secrets, params)

      if (response.errors) {
        throw new Error(response.errors[0].message)
      }

      return response.secrets.reduce((secretAccumulator, secret) => {
        return {
          ...secretAccumulator,
          [secret.name]: secret.fields.reduce((fieldAccumulator, field) => {
            return {...fieldAccumulator, [field.name]: field.value}
          }, {}),
        }
      }, {})
    },
  }
}
