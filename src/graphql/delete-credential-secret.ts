import {gql} from 'graphql-request'

export const DeleteCredentialSecret = gql`
  mutation DeleteCredentialSecret($apiToken: String!,$secretName: String!) {
    deleteCredentialSecret(apiToken: $apiToken, secretName: $secretName) {
      id
    }
  }
`
