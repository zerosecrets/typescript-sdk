import {NewConfig} from 'sdk/types'

export type ReturnTypeZero<T> = T extends NewConfig
  ? {
      fetch(params: {pick: Array<string>; callerName?: string}): Promise<{
        [key: string]: {[key: string]: string} | undefined
      }>

      createCredentialSecret(params: {
        accessToken: string
        expiresAt?: string
        expiresIn?: string
        meta?: Record<string, string>
        refreshToken: string
        secretKey: string
        secretName: string
        vendor: string
      }): Promise<{message: string}>

      fetchCredentialSecret(params: {
        clientId: string
        clientSecret: string
        secretName: string
        secretKey: string
      }): Promise<{
        accessToken: string
        refreshToken: string
        meta: Record<string, any>
      }>
    }
  : {
      fetch(): Promise<{[key: string]: {[key: string]: string} | undefined}>
    }
