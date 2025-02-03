import {gql} from 'graphql-request'

export const UpdateCredentialSecret = gql`
  mutation UpdateCredentialSecret(
    $accessToken: String!
    $apiToken: String!
    $expiresAt: String
    $expiresIn: Int
    $refreshToken: String!
    $secretName: String!
  ) {
    updateCredentialSecret(
      accessToken: $accessToken,
      apiToken: $apiToken,
      expiresAt:  $expiresAt,
      expiresIn: $expiresIn,
      refreshToken: $refreshToken,
      secretName: $secretName
    ) {
      success
    }
  }
`
