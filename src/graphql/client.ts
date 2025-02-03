import {GraphQLClient} from 'graphql-request'
import {GRAPHQL_ENDPOINT_URL} from 'sdk/const'

export const gqlClient = new GraphQLClient(GRAPHQL_ENDPOINT_URL, {
  headers: {},
})
