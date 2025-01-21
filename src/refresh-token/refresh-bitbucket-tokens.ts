import {Bitbucket} from 'arctic'
import {ResponseRefreshTokens} from 'sdk/types'

export const refreshBitbucketTokens = async (params: {
  clientId: string
  clientSecret: string
  decryptedRefreshToken: string
}): Promise<ResponseRefreshTokens> => {
  try {
    const bitbucket = new Bitbucket(params.clientId, params.clientSecret, '')
    const tokens = await bitbucket.refreshAccessToken(params.decryptedRefreshToken)
    const accessToken = tokens.accessToken()
    const refreshToken = tokens.refreshToken()

    if (!accessToken || !refreshToken) {
      throw new Error(`Invalid refresh token response type: ${JSON.stringify(tokens.data)}`)
    }

    return {
      accessToken,
      refreshToken,
      expiresIn: tokens.accessTokenExpiresInSeconds(),
    }
  } catch (error) {
    throw error
  }
}
