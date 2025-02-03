import {Figma} from 'arctic'
import {ResponseRefreshTokens} from 'sdk/types'

export const refreshFigmaTokens = async (params: {
  clientId: string
  clientSecret: string
  decryptedRefreshToken: string
}): Promise<ResponseRefreshTokens> => {
  try {
    const figma = new Figma(params.clientId, params.clientSecret, '')
    const tokens = await figma.refreshAccessToken(params.decryptedRefreshToken)
    const accessToken = tokens.accessToken()

    if (!accessToken) {
      throw new Error(`Invalid refresh token response type: ${JSON.stringify(tokens.data)}`)
    }

    return {
      accessToken,
      refreshToken: params.decryptedRefreshToken,
      expiresIn: tokens.accessTokenExpiresInSeconds(),
    }
  } catch (error) {
    throw error
  }
}
