import {gql} from 'graphql-request'

export const DeleteCredentialSecret = gql`
  mutation DeleteCredentialSecret($apiToken: String!,$secretName: String!) {
    deleteCredentialSecret(apiToken: String!, secretName: String!) {
      id
    }
  }
`
