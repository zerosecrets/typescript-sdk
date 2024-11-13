import {gqlClient} from 'sdk/graphql/client'
import {CreateCredentialSecret} from 'sdk/graphql/create-credential-secret'
import {ResponseSuccess, Vendor} from 'sdk/types'

export const createCredentialSecret = async (params: {
  apiToken: string
  encryptedAccessToken: string
  encryptedRefreshToken: string
  expiresAt?: string
  expiresIn?: string
  meta?: string
  secretName: string
  vendor: string
}) => {
  const errorMessage = `Failed to create credential secret for ${params.vendor} `

  try {
    const response = await gqlClient.request<{createCredentialSecret: ResponseSuccess}>(CreateCredentialSecret, {
      accessToken: params.encryptedAccessToken,
      apiToken: params.apiToken,
      expiresAt: params.expiresAt,
      expiresIn: params.expiresIn,
      meta: params.meta,
      refreshToken: params.encryptedRefreshToken,
      secretName: params.secretName,
      vendor: params.vendor,
    })

    if (!response.createCredentialSecret.success) {
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error(errorMessage)
    throw error
  }
}
