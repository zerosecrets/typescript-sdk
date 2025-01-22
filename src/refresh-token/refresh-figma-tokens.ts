import {ResponseRefreshTokens} from 'sdk/types'

export const refreshFigmaTokens = async (params: {
  clientId: string
  clientSecret: string
  decryptedRefreshToken: string
}): Promise<ResponseRefreshTokens> => {
  try {
    const url = 'https://api.figma.com/v1/oauth/refresh'
    const authHeader = Buffer.from(`${params.clientId}:${params.clientSecret}`).toString('base64')

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: params.decryptedRefreshToken,
    })

    const response = await fetch(url, {
      method: 'POST',
      body: body.toString(),

      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`)
    }

    const data: {access_token: string; expires_in: number} = await response.json()

    if (!data.access_token || !data.expires_in) {
      throw new Error('Invalid refresh figma token')
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
