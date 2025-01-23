import {Auth0} from 'arctic'
import {ResponseRefreshTokens} from 'sdk/types'

export const refreshAuth0Tokens = async (params: {
  clientId: string
  clientSecret: string
  decryptedRefreshToken: string
  meta?: Record<string, string>
}): Promise<ResponseRefreshTokens> => {
  let domain

  if (params.meta && 'domain' in params.meta) {
    domain = params.meta.domain
  } else {
    throw new Error('Please add `domain` to `meta` parameter')
  }

  try {
    const auth0 = new Auth0(domain, params.clientId, params.clientSecret, '')
    const tokens = await auth0.refreshAccessToken(params.decryptedRefreshToken)
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
