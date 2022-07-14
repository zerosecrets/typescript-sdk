import {gql} from 'graphql-request'

export const Secrets = gql`
  query Secrets($token: String!, $pick: [String!]) {
    secrets(zeroToken: $token, pick: $pick) {
      name

      fields {
        name
        value
      }
    }
  }
`
