import {Auth0} from 'arctic'
import {ResponseRefreshTokens} from 'sdk/types'

export const refreshOAuth0Tokens = async (params: {
  clientId: string
  clientSecret: string
  decryptedRefreshToken: string
}): Promise<ResponseRefreshTokens> => {
  try {
    // TODO domain + redirect
    const auth0 = new Auth0('', params.clientId, params.clientSecret, '')
    const tokens = await auth0.refreshAccessToken(params.decryptedRefreshToken)

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
