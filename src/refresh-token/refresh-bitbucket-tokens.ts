import {Bitbucket} from 'arctic'
import {ResponseRefreshTokens} from 'sdk/types'

export const refreshBitbucketTokens = async (params: {
  clientId: string
  clientSecret: string
  decryptedRefreshToken: string
}): Promise<ResponseRefreshTokens> => {
  try {
    // TODO  redirect
    const bitbucket = new Bitbucket(params.clientId, params.clientSecret, '')
    const tokens = await bitbucket.refreshAccessToken(params.decryptedRefreshToken)

    if (!tokens.accessToken()) {
      throw new Error(`Invalid refresh token response type: ${JSON.stringify(tokens.data)}`)
    }

    return {
      accessToken: tokens.accessToken(),
      refreshToken: params.decryptedRefreshToken,
      expiresIn: tokens.accessTokenExpiresInSeconds(),
    }
  } catch (error) {
    throw error
  }
}
