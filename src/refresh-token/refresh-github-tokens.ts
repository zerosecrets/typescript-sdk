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

const guard = (obj: {}): obj is GitHubRefreshResponse => {
  if ('access_token' in obj && 'refresh_token' in obj) {
    return true
  }

  return false
}

export const refreshGithubTokens = async (params: {
  clientId: string
  clientSecret: string
  decryptedRefreshToken: string
}): Promise<ResponseRefreshTokens> => {
  try {
    const github = new GitHub(params.clientId, params.clientSecret, null)
    const {data} = await github.refreshAccessToken(params.decryptedRefreshToken)

    if (!data || !guard(data)) {
      throw new Error(`Invalid refresh token response type: ${JSON.stringify(data)}`)
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    }
  } catch (error) {
    throw error
  }
}
