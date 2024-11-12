import {encrypt} from 'sdk/encrypt'
import {gqlClient} from 'sdk/graphql/client'
import {UpdateCredentialSecret} from 'sdk/graphql/updateCredentialSecret'
import {ResponseSuccess} from 'sdk/types'

export const updateSecret = async (params: {
  accessToken: string
  apiToken: string
  expiresIn?: number
  expiresAt?: string
  refreshToken: string
  secretKey: string
  secretName: string
}): Promise<ResponseSuccess> => {
  try {
    await gqlClient.request(UpdateCredentialSecret, {
      accessToken: encrypt(params.accessToken, params.secretKey),
      apiToken: params.apiToken,
      expiresAt: params.expiresAt,
      expiresIn: params.expiresIn,
      refreshToken: encrypt(params.refreshToken, params.secretKey),
      secretName: params.secretName,
    })

    return {success: true}
  } catch (error) {
    throw new Error(`Error updating tokens in secret ${params.secretName}`)
  }
}
