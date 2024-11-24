import {Bitbucket, Figma} from 'arctic'
import {ResponseRefreshTokens} from 'sdk/types'

export const refreshFigmaTokens = async (params: {
  clientId: string
  clientSecret: string
  decryptedRefreshToken: string
}): Promise<ResponseRefreshTokens> => {
  try {
    // TODO  redirect
    const figma = new Figma(params.clientId, params.clientSecret, '')
    const tokens = await figma.refreshAccessToken(params.decryptedRefreshToken)

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
