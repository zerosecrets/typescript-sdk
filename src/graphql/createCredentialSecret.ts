import {gql} from 'graphql-request'

export const CreateCredentialSecret = gql`
  mutation CreateCredentialSecret(
    $accessToken: String!
    $apiToken: String!
    $expiresAt: String
    $expiresIn: Int
    $meta: String
    $refreshToken: String!
    $secretName: String!
    $vendor: String!
  ) {
    createCredentialSecret(
      accessToken: $accessToken
      apiToken: $apiToken
      expiresAt: $expiresAt
      expiresIn: $expiresIn
      meta: $meta
      refreshToken: $refreshToken
      secretName: $secretName
      vendor: $vendor
    ) {
      success
    }
  }
`
