import {gql} from 'graphql-request'

export const Secrets = gql`
  query Secrets($token: String!, $apis: [String!]) {
    secrets(zeroToken: $token, pick: $apis) {
      name

      fields {
        name
        value
      }
    }
  }
`
