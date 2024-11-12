import {ResponseRefreshTokens} from 'sdk/types'

export const refreshGoogleTokens = async (params: {
  clientId: string
  clientSecret: string
  decryptedRefreshToken: string
}): Promise<ResponseRefreshTokens> => {
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        client_id: params.clientId,
        client_secret: params.clientSecret,
        refresh_token: params.decryptedRefreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    })

    const data = await tokenResponse.json()

    if (!tokenResponse.ok || data.error_description) {
      throw new Error(`Error refreshing token: ${data.error_description}`)
    }

    return {
      accessToken: data.access_token,
      refreshToken: params.decryptedRefreshToken,
      expiresIn: data.expires_in,
    }
  } catch (error) {
    throw error
  }
}
