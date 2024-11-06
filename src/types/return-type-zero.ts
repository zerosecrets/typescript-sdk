import {Expiration, NewConfig} from 'sdk/types'

export type ReturnTypeZero<T> = T extends NewConfig
  ? {
      fetch(params: {pick: Array<string>; callerName?: string}): Promise<{
        [key: string]: {[key: string]: string} | undefined
      }>

      createCredentialSecret(
        params: {
          accessToken: string
          meta?: string
          refreshToken: string
          secretKey: string
          secretName: string
          vendor: string
        } & Expiration,
      ): Promise<string>

      fetchCredentialSecret(params: {
        clientId: string
        clientSecret: string
        secretName: string
        secretKey: string
      }): Promise<{
        accessToken: string
        meta: Record<string, any>
        refreshToken: string
      }>
    }
  : {
      fetch(): Promise<{[key: string]: {[key: string]: string} | undefined}>
    }
