import { GraphQLClient } from 'graphql-request'
import { Secrets } from './graphql/secrets'
import { ResponseBody } from './types'
const GRAPHQL_ENDPOINT_URL = 'https://core.tryzero.com/v1/graphql'

interface IData {
  [key: string]: { [key: string]: string } | undefined
}

export const zero = async (params: { pick: Array<string>; token: string, callerName?: string }) => {
  if (typeof params.token === 'undefined' || params.token.length === 0) {
    const errorMsg = 'Zero token should be non-empty string'
    return [null, errorMsg]
  }

  const client = new GraphQLClient(GRAPHQL_ENDPOINT_URL, {
    headers: {},
  });

  const response = await client.request<ResponseBody>(Secrets, params)

    if (response.errors) {
      return [null, response.errors[0].message]
    }

    return [response.secrets.reduce((secretAccumulator, secret) => {
      return {
        ...secretAccumulator,
        [secret.name]: secret.fields.reduce((fieldAccumulator, field) => {
          return { ...fieldAccumulator, [field.name]: field.value }
        }, {}),
      }
    }, {}), null]
}
