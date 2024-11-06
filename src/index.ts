import {createCipheriv, createDecipheriv, randomBytes} from 'crypto'
import dayjs from 'dayjs'
import {GraphQLClient} from 'graphql-request'
import {NewConfig, OldConfig, ReturnTypeZero} from 'sdk/types'
import {Secrets} from './graphql/secrets'
import {ResponseBody} from './types'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const GRAPHQL_ENDPOINT_URL = 'https://core.tryzero.com/graphql'
const HTTP_ENDPOINT_URL = 'https://http.tryzero.com'

enum Vendor {
  GOOGLE = 'google',
}

export function encrypt(text: string, key: string): string {
  const keyBuffer = Buffer.from(key, 'hex')
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, keyBuffer, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`
}

export function decrypt(data: string, key: string): string {
  const keyBuffer = Buffer.from(key, 'hex')
  const [ivHex, encryptedData, authTagHex] = data.split(':')

  if (!ivHex || !encryptedData || !authTagHex) {
    throw new Error('Invalid encrypted data format')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

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

    const client = new GraphQLClient(GRAPHQL_ENDPOINT_URL, {
      headers: {},
    })

    return {
      /**
       * @deprecated
       * Old fetch function that fetches secrets from the Zero platform.
       * Deprecated in favor of the new fetch function.
       */
      async fetch(): Promise<{[key: string]: {[key: string]: string} | undefined}> {
        const response = await client.request<ResponseBody>(Secrets, config)

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
    async fetch(params: {pick: Array<string>; callerName?: string}): Promise<{
      [key: string]: {[key: string]: string} | undefined
    }> {
      const client = new GraphQLClient(GRAPHQL_ENDPOINT_URL, {headers: {}})

      const response = await client.request<ResponseBody>(Secrets, {
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
    async createCredentialSecret(params: {
      accessToken: string
      expiresAt?: string
      expiresIn?: string
      meta?: Record<string, string>
      refreshToken: string
      secretKey: string
      secretName: string
      vendor: string
    }): Promise<any> {
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

      if (params.vendor !== Vendor.GOOGLE) {
        throw new Error('Only Google vendor is supported at the moment')
      }

      const encryptedAccessToken = encrypt(params.accessToken, params.secretKey)
      const encryptedRefreshToken = encrypt(params.refreshToken, params.secretKey)
      let response

      try {
        response = await fetch(`${HTTP_ENDPOINT_URL}/cm/create`, {
          body: JSON.stringify({
            accessToken: encryptedAccessToken,
            apiToken: config.apiToken,
            expiresAt: params.expiresAt,
            expiresIn: params.expiresIn,
            meta: JSON.stringify(params.meta),
            refreshToken: encryptedRefreshToken,
            secretName: params.secretName,
            vendor: params.vendor,
          }),
          method: 'POST',
        })
      } catch (error) {
        throw error
      }

      return await response.json()
    },

    /**
     * Fetches a credential secret from the credential manager.
     * @param params
     * @returns
     */
    async fetchCredentialSecret(params: {
      clientId: string
      clientSecret: string
      secretName: string
      secretKey: string
    }): Promise<any> {
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
        fetchResponse = await fetch(`${HTTP_ENDPOINT_URL}/cm/fetch`, {
          body: JSON.stringify({
            apiToken: config.apiToken,
            secretName: params.secretName,
          }),
          method: 'POST',
        })

        fetchResponse = await fetchResponse.json()
      } catch (error) {
        console.error(error)
        throw error
      }

      const accessToken = decrypt(fetchResponse.accessToken, params.secretKey)
      const refreshToken = decrypt(fetchResponse.refreshToken, params.secretKey)
      const expiresAt = dayjs(fetchResponse.expiresAt)

      if (dayjs().add(10, 'minutes').isAfter(expiresAt)) {
        if (fetchResponse.vendor === Vendor.GOOGLE) {
          try {
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              body: new URLSearchParams({
                client_id: params.clientId,
                client_secret: params.clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
              }).toString(),
            })

            if (!tokenResponse.ok) {
              const data = await tokenResponse.json()
              throw new Error(`Error refreshing token: ${data.error_description}`)
            }

            const data = await tokenResponse.json()
            const newEncryptedAccessToken = encrypt(data.access_token, params.secretKey)
            const newEncryptedRefreshToken = encrypt(data.refresh_token, params.secretKey)
            const expiresIn = data.expires_in

            await fetch(`${HTTP_ENDPOINT_URL}/cm/update`, {
              body: JSON.stringify({
                accessToken: newEncryptedAccessToken,
                apiToken: config.apiToken,
                expiresIn: expiresIn,
                refreshToken: newEncryptedRefreshToken,
                secretName: params.secretName,
              }),
              method: 'POST',
            })

            return {
              accessToken: data.access_toke,
              refreshToken: data.refresh_token,
              meta: JSON.parse(fetchResponse.meta),
            }
          } catch (error) {
            throw error
          }
        }
      }

      return {accessToken, refreshToken, meta: JSON.parse(fetchResponse.meta)}
    },
  } as ReturnTypeZero<T>
}
