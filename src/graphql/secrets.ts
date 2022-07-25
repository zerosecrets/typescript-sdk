import {gql} from 'graphql-request'

export const Secrets = gql`
  query Secrets($token: String!, $pick: [String!], $callerName: String) {
    secrets(zeroToken: $token, pick: $pick, callerName: $callerName) {
      name

      fields {
        name
        value
      }
    }
  }
`
