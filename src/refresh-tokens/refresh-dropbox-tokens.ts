import {Dropbox, GitHub} from 'arctic'
import {ResponseRefreshTokens} from 'sdk/types'

export const refreshDropboxTokens = async (params: {
  clientId: string
  clientSecret: string
  decryptedRefreshToken: string
}): Promise<ResponseRefreshTokens> => {
  try {
    const dropbox = new Dropbox(params.clientId, params.clientSecret, '')
    const tokens = await dropbox.refreshAccessToken(params.decryptedRefreshToken)
    const accessToken = tokens.accessToken()

    if (!accessToken) {
      throw new Error(`Invalid refresh token response type: ${JSON.stringify(tokens.data)}`)
    }

    return {
      accessToken,
      refreshToken: params.decryptedRefreshToken,
      expiresIn: tokens.accessTokenExpiresInSeconds(),
    }
  } catch (error) {
    throw error
  }
}
