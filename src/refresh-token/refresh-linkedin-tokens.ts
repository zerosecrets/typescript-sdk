import {LinkedIn} from 'arctic'
import {ResponseRefreshTokens} from 'sdk/types'

export const refreshLinkedinTokens = async (params: {
  clientId: string
  clientSecret: string
  decryptedRefreshToken: string
}): Promise<ResponseRefreshTokens> => {
  try {
    // TODO  redirect
    const linkedin = new LinkedIn(params.clientId, params.clientSecret, '')
    const tokens = await linkedin.refreshAccessToken(params.decryptedRefreshToken)

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
