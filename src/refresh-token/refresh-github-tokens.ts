import {GitHub} from 'arctic'
import {ResponseRefreshTokens} from 'sdk/types'

type GitHubRefreshResponse = {
  access_token: string
  expires_in: number
  refresh_token: string
  refresh_token_expires_in: number
  scope: string
  token_type: 'bearer'
}

export const refreshGithubTokens = async (params: {
  clientId: string
  clientSecret: string
  decryptedRefreshToken: string
}): Promise<ResponseRefreshTokens> => {
  try {
    const github = new GitHub(params.clientId, params.clientSecret, null)
    const tokens = await github.refreshAccessToken(params.decryptedRefreshToken)

    if (!tokens.accessToken() || !tokens.refreshToken()) {
      throw new Error(`Invalid refresh token response type: ${JSON.stringify(tokens.data)}`)
    }

    return {
      accessToken: tokens.accessToken(),
      refreshToken: tokens.refreshToken(),
      expiresIn: tokens.accessTokenExpiresInSeconds()
    }
  } catch (error) {
    throw error
  }
}
