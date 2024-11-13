import {ResponseRefreshTokens} from 'sdk/types'

export const refreshGithubTokens = async (params: {
  clientId: string
  clientSecret: string
  decryptedRefreshToken: string
}): Promise<ResponseRefreshTokens> => {
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',

      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },

      body: new URLSearchParams({
        client_id: params.clientId,
        client_secret: params.clientSecret,
        refresh_token: params.decryptedRefreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    })

    const data = await response.json()

    if (!response.ok || data.error_description) {
      throw new Error(`Error refreshing token: ${data.error_description}`)
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
