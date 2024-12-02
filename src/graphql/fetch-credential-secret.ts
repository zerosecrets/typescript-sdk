import {gql} from 'graphql-request'

export const FetchCredentialSecret = gql`
  query FetchCredentialSecret(
    $apiToken: String!
    $secretName: String!
  ) {
    fetchCredentialSecret(
      apiToken: $apiToken
      secretName: $secretName
    ) {
      accessToken
      expiresAt
      meta
      refreshToken
      vendor
    }
  }
`
