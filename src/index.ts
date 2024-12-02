import dayjs from 'dayjs'
import {createCredentialSecret} from 'sdk/create-credential-secret'
import {decrypt} from 'sdk/decrypt'
import {encrypt} from 'sdk/encrypt'
import {gqlClient} from 'sdk/graphql/client'
import {FetchCredentialSecret} from 'sdk/graphql/fetch-credential-secret'
import {Secrets} from 'sdk/graphql/secrets'
import {
  refreshBitbucketTokens,
  refreshDiscordTokens,
  refreshFigmaTokens,
  refreshGithubTokens,
  refreshGoogleTokens,
  refreshZoomTokens,
} from 'sdk/refresh-token'
import {
  FetchCredentialSecretOutput,
  NewConfig,
  OldConfig,
  ResponseBody,
  ResponseRefreshTokens,
  ReturnTypeZero,
  Vendor,
} from 'sdk/types'
import {updateSecret} from 'sdk/updateSecret'

export const zero = <T extends NewConfig | OldConfig>(config: T): ReturnTypeZero<T> => {
  // Check if both tokens are missing
  if (!('apiToken' in config) && !('token' in config)) {
    throw new Error('Either apiToken or token should be provided')
  }

  // Deprecated approach
  if ('token' in config) {
    if (typeof config.token === 'undefined' || config.token.length === 0) {
      throw new Error('Zero token should be non-empty string')
    }

    return {
      /**
       * @deprecated
       * Old fetch function that fetches secrets from the Zero platform.
       * Deprecated in favor of the new fetch function.
       */
      async fetch(): Promise<{[key: string]: {[key: string]: string} | undefined}> {
        const response = await gqlClient.request<ResponseBody>(Secrets, config)

        if (response.errors) {
          throw new Error(response.errors[0].message)
        }

        console.warn('Deprecated function. Use the new fetch function instead.')

        return response.secrets.reduce((secretAccumulator, secret) => {
          return {
            ...secretAccumulator,
            [secret.name]: secret.fields.reduce((fieldAccumulator, field) => {
              return {...fieldAccumulator, [field.name]: field.value}
            }, {}),
          }
        }, {})
      },
    } as ReturnTypeZero<T>
  }

  if (typeof config.apiToken === 'undefined' || config.apiToken.length === 0) {
    throw new Error('Zero token should be non-empty string')
  }

  return {
    /**
     * Fetches secrets from the Zero platform. The secrets are encrypted and can be decrypted using the secret key.
     * If tokens are expired, they will be refreshed.
     * @param params
     * @returns
     */
    async fetch(params): Promise<{
      [key: string]: {[key: string]: string} | undefined
    }> {
      const response = await gqlClient.request<ResponseBody>(Secrets, {
        callerName: params.callerName,
        pick: params.pick,
        token: config.apiToken,
      })

      if (response.errors) {
        throw new Error(response.errors[0].message)
      }

      return response.secrets.reduce((secretAccumulator, secret) => {
        return {
          ...secretAccumulator,
          [secret.name]: secret.fields.reduce((fieldAccumulator, field) => {
            return {...fieldAccumulator, [field.name]: field.value}
          }, {}),
        }
      }, {})
    },

    /**
     * Create a credential secret, which is a secret that contains access and refresh tokens for a specific vendor.
     * The secret is encrypted with a secret key. Expiration time can be set either by providing expiresAt or expiresIn.
     * At the moment, only Google vendor is supported.
     * @returns Success message
     * @param params
     */
    async createCredentialSecret(params): Promise<string> {
      if (!params.expiresAt && !params.expiresIn) {
        throw new Error('Either expiresAt or expiresIn should be provided')
      }

      if (params.expiresAt && params.expiresIn) {
        throw new Error('Only one of expiresAt or expiresIn should be provided')
      }

      if (!params.accessToken || !params.refreshToken) {
        throw new Error('Both accessToken and refreshToken should be provided')
      }

      if (!params.secretKey) {
        throw new Error('Secret key should be provided')
      }

      if (params.secretKey.length !== 64) {
        throw new Error('Secret key should be 32 bytes long')
      }

      if (!params.secretName) {
        throw new Error('Secret name should be provided')
      }

      const isSupportedVendor = Object.values(Vendor).map(String).includes(params.vendor)

      if (!isSupportedVendor) {
        throw new Error('Not supported vendor at the moment')
      }

      const encryptedAccessToken = encrypt(params.accessToken, params.secretKey)
      const encryptedRefreshToken = encrypt(params.refreshToken, params.secretKey)

      await createCredentialSecret({
        encryptedAccessToken,
        encryptedRefreshToken,
        apiToken: config.apiToken,
        expiresAt: params.expiresAt,
        expiresIn: params.expiresIn,
        meta: params.meta,
        secretName: params.secretName,
        vendor: params.vendor,
      })

      return 'The credentials secret has been successfully created'
    },

    /**
     * Fetches a credential secret from the credential manager.
     * @param params
     * @returns
     */
    async fetchCredentialSecret(params): Promise<{
      accessToken: string
      refreshToken: string
      meta: object
    }> {
      if (!params.secretKey) {
        throw new Error('Secret key should be provided')
      }

      if (params.secretKey.length !== 64) {
        throw new Error('Secret key should be 32 bytes long')
      }

      if (!params.secretName) {
        throw new Error('Secret name should be provided')
      }

      if (!params.clientId || !params.clientSecret) {
        throw new Error('Client ID and Client Secret should be provided')
      }

      let fetchResponse

      try {
        fetchResponse = (
          await gqlClient.request<{fetchCredentialSecret: FetchCredentialSecretOutput}>(FetchCredentialSecret, {
            apiToken: config.apiToken,
            secretName: params.secretName,
          })
        ).fetchCredentialSecret
      } catch (error) {
        console.error(error)
        throw error
      }

      const decryptedAccessToken = decrypt(fetchResponse.accessToken, params.secretKey)
      const decryptedRefreshToken = decrypt(fetchResponse.refreshToken, params.secretKey)
      const expiresAt = dayjs(fetchResponse.expiresAt)

      if (dayjs().add(10, 'minutes').isAfter(expiresAt)) {
        let newTokens: ResponseRefreshTokens | null = null

        if (fetchResponse.vendor === Vendor.GOOGLE) {
          newTokens = await refreshGoogleTokens({
            clientId: params.clientId,
            clientSecret: params.clientSecret,
            decryptedRefreshToken,
          })
        }

        if (fetchResponse.vendor === Vendor.GITHUB) {
          newTokens = await refreshGithubTokens({
            clientId: params.clientId,
            clientSecret: params.clientSecret,
            decryptedRefreshToken,
          })
        }

        if (fetchResponse.vendor === Vendor.BITBUCKET) {
          newTokens = await refreshBitbucketTokens({
            clientId: params.clientId,
            clientSecret: params.clientSecret,
            decryptedRefreshToken,
          })
        }

        if (fetchResponse.vendor === Vendor.DISCORD) {
          newTokens = await refreshDiscordTokens({
            clientId: params.clientId,
            clientSecret: params.clientSecret,
            decryptedRefreshToken,
          })
        }

        if (fetchResponse.vendor === Vendor.FIGMA) {
          newTokens = await refreshFigmaTokens({
            clientId: params.clientId,
            clientSecret: params.clientSecret,
            decryptedRefreshToken,
          })
        }

        if (fetchResponse.vendor === Vendor.ZOOM) {
          newTokens = await refreshZoomTokens({
            clientId: params.clientId,
            clientSecret: params.clientSecret,
            decryptedRefreshToken,
          })
        }

        if (!newTokens) {
          throw new Error('Error refresh token')
        }

        await updateSecret({
          accessToken: newTokens.accessToken,
          apiToken: config.apiToken,
          expiresIn: newTokens.expiresIn,
          expiresAt: newTokens.expiresAt,
          refreshToken: newTokens.refreshToken,
          secretKey: params.secretKey,
          secretName: params.secretName,
        })

        return {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          meta: JSON.parse(fetchResponse.meta),
        }
      }

      return {
        accessToken: decryptedAccessToken,
        refreshToken: decryptedRefreshToken,
        meta: JSON.parse(fetchResponse.meta),
      }
    },
  } as ReturnTypeZero<T>
}
