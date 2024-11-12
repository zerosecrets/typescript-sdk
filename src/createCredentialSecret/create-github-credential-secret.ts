import {gqlClient} from 'sdk/graphql/client'
import {CreateCredentialSecret} from 'sdk/graphql/createCredentialSecret'
import {ResponseSuccess, Vendor} from 'sdk/types'

export const createGithubCredentialSecret = async (params: {
  apiToken: string
  encryptedAccessToken: string
  encryptedRefreshToken: string
  expiresAt?: string
  expiresIn?: string
  meta?: string
  secretName: string
}) => {
  try {
    const response = await gqlClient.request<{createCredentialSecret: ResponseSuccess}>(CreateCredentialSecret, {
      accessToken: params.encryptedAccessToken,
      apiToken: params.apiToken,
      expiresAt: params.expiresAt,
      expiresIn: params.expiresIn,
      meta: params.meta,
      refreshToken: params.encryptedRefreshToken,
      secretName: params.secretName,
      vendor: Vendor.GITHUB,
    })

    if (!response.createCredentialSecret.success) {
      throw new Error('Failed to create Github credential secret')
    }
  } catch (error) {
    console.error('Failed to create Github credential secret')
    throw error
  }
}
