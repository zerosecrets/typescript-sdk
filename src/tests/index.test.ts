import {gqlClient} from 'sdk/graphql/client'
import {zero} from 'sdk/index'
import {refreshTokens} from 'sdk/refresh-tokens'
import {Vendor} from 'sdk/types'
import * as updateSecretModule from 'sdk/updateSecret'
import {secretsResponse} from './data/mock'

jest.mock('sdk/decrypt', () => ({
  decrypt: (text: string) => {
    return text
  },
}))

jest.mock('arctic', () => ({
  Auth0: jest.fn(),
  Bitbucket: jest.fn(),
  Discord: jest.fn(),
  Dropbox: jest.fn(),
  Figma: jest.fn(),
  Github: jest.fn(),
  GitLab: jest.fn(),
  Google: jest.fn(),
  LinkedIn: jest.fn(),
  Reddit: jest.fn(),
  Twitter: jest.fn(),
  Zoom: jest.fn(),
}))

jest.mock('sdk/graphql/client')
jest.mock('sdk/refresh-tokens/refresh-google-tokens')

const mockedGqlClient = jest.mocked(gqlClient)

describe('Zero TypeScript SDK - fetch', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('fetch by old config', async () => {
    mockedGqlClient.request.mockResolvedValueOnce(secretsResponse)
    await expect(zero({token: '123', pick: ['aws']}).fetch()).resolves.toEqual({aws: {name: 'value', name2: 'value2'}})
  })

  it('requires token to be non-empty string', () => {
    expect(() => {
      zero({apiToken: ''}).fetch({
        pick: ['aws'],
      })
    }).toThrow('Zero token should be non-empty string')
  })

  it('does a GraphQL request which queries the requested APIs', async () => {
    mockedGqlClient.request.mockResolvedValueOnce(secretsResponse)

    await expect(
      zero({apiToken: 'token'}).fetch({
        pick: ['aws'],
      }),
    ).resolves.toEqual({aws: {name: 'value', name2: 'value2'}})
  })

  it('does a GraphQL request with wrong vars (expect empty body)', async () => {
    mockedGqlClient.request.mockResolvedValueOnce({secrets: []})

    await expect(
      zero({apiToken: 'invalid token'}).fetch({
        pick: ['aws'],
      }),
    ).resolves.toEqual({})
  })

  it('raises an exception if GraphQL API responds with error', async () => {
    const errorMessage = 'Could not establish connection with database'
    mockedGqlClient.request.mockResolvedValueOnce({errors: [{message: errorMessage}]})

    await expect(
      zero({apiToken: 'token'}).fetch({
        pick: [],
      }),
    ).rejects.toThrow(errorMessage)
  })
})

describe('Zero TypeScript SDK - createCredentialSecret', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('throws an error if neither expiresAt nor expiresIn are provided', async () => {
    const sdk = zero({apiToken: 'token'})

    await expect(
      // @ts-ignore - testing invalid input
      sdk.createCredentialSecret({
        accessToken: 'access',
        refreshToken: 'refresh',
        secretKey: 'a'.repeat(64),
        secretName: 'name',
        vendor: 'google',
      }),
    ).rejects.toThrow('Either expiresAt or expiresIn should be provided')
  })

  it('successfully creates a credential secret', async () => {
    const sdk = zero({apiToken: 'token'})

    mockedGqlClient.request.mockResolvedValueOnce({
      createCredentialSecret: {
        success: true,
        message: 'The credentials secret has been successfully created',
      },
    })

    const response = await sdk.createCredentialSecret({
      accessToken: 'access',
      expiresIn: '3600',
      refreshToken: 'refresh',
      secretKey: 'a'.repeat(64),
      secretName: 'name',
      vendor: 'google',
    })

    expect(response).toEqual('The credentials secret has been successfully created')
  })
})

describe('Zero TypeScript SDK - fetchCredentialSecret', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('throws an error if secret key length is invalid', async () => {
    const sdk = zero({apiToken: 'token'})

    await expect(
      sdk.fetchCredentialSecret({
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        secretName: 'name',
        secretKey: 'invalid-key',
      }),
    ).rejects.toThrow('Secret key should be 32 bytes long')
  })

  it('successfully fetches and decrypts a credential secret', async () => {
    const EXPECT_DATA = {
      accessToken: 'newAccessToken',
      expiresAt: '3024-11-10T10:00:00Z',
      meta: '{"metaKey": "metaValue"}',
      refreshToken: 'newRefreshToken',
      vendor: Vendor.GOOGLE,
    }

    mockedGqlClient.request.mockResolvedValueOnce({fetchCredentialSecret: EXPECT_DATA})
    const sdk = zero({apiToken: 'token'})

    const response = await sdk.fetchCredentialSecret({
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      secretName: 'name',
      secretKey: 'a'.repeat(64),
    })

    expect(response).toHaveProperty('accessToken', EXPECT_DATA.accessToken)
    expect(response).toHaveProperty('refreshToken', EXPECT_DATA.refreshToken)
    expect(response.meta).toEqual(JSON.parse(EXPECT_DATA.meta))
  })

  it('throws an error if token refresh fails', async () => {
    const EXPECT_DATA = {
      request: {
        accessToken: 'newAccessToken',
        expiresAt: '1000-11-10T10:00:00Z',
        meta: '{"metaKey": "metaValue"}',
        refreshToken: 'newRefreshToken',
        vendor: Vendor.GOOGLE,
      },
      errorMessage: 'Error refreshing token: Invalid refresh token',
    }

    mockedGqlClient.request.mockResolvedValueOnce({fetchCredentialSecret: EXPECT_DATA.request})

    jest.mocked(refreshTokens.google).mockImplementationOnce(() => {
      throw new Error(EXPECT_DATA.errorMessage)
    })

    const sdk = zero({apiToken: 'token'})

    await expect(
      sdk.fetchCredentialSecret({
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        secretName: 'name',
        secretKey: 'a'.repeat(64),
      }),
    ).rejects.toThrow(EXPECT_DATA.errorMessage)
  })

  it('success refresh token', async () => {
    const GQL_MOCK = {
      accessToken: 'newAccessToken',
      expiresAt: '1000-11-10T10:00:00Z',
      meta: '{"metaKey": "metaValue"}',
      refreshToken: 'newRefreshToken',
      vendor: Vendor.GOOGLE,
    }

    const REFRESH_TOKENS_MOCK = {
      accessToken: 'awesomeAccessToken',
      refreshToken: 'newAwesomeRefreshToken',
      expiresIn: 3600,
    }

    const apiToken = 'mockApiToken'
    const secretKey = 'a'.repeat(64)
    const secretName = 'mockSecretName'

    mockedGqlClient.request.mockResolvedValueOnce({fetchCredentialSecret: GQL_MOCK})
    jest.mocked(refreshTokens.google).mockImplementationOnce(async () => REFRESH_TOKENS_MOCK)
    const updateSecretSpy = jest.spyOn(updateSecretModule, 'updateSecret')

    const sdk = zero({apiToken})

    await expect(
      sdk.fetchCredentialSecret({
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        secretName,
        secretKey,
      }),
    ).resolves.toEqual({
      accessToken: REFRESH_TOKENS_MOCK.accessToken,
      refreshToken: REFRESH_TOKENS_MOCK.refreshToken,
      meta: JSON.parse(GQL_MOCK.meta),
    })

    expect(updateSecretSpy).toHaveBeenCalledWith({
      accessToken: REFRESH_TOKENS_MOCK.accessToken,
      apiToken,
      refreshToken: REFRESH_TOKENS_MOCK.refreshToken,
      expiresIn: REFRESH_TOKENS_MOCK.expiresIn,
      expiresAt: undefined,
      secretKey,
      secretName,
    })
  })
})

describe('Zero TypeScript SDK - deleteCredentialSecret', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('throws an error if secret name is empty', async () => {
    const sdk = zero({apiToken: 'token'})
    await expect(sdk.deleteCredentialSecret({secretName: ''})).rejects.toThrow('Secret name should be provided')
  })

  it('successfully delete credential secret', async () => {
    mockedGqlClient.request.mockResolvedValueOnce({deleteCredentialSecret: {id: 'mock-id'}})
    const sdk = zero({apiToken: 'token'})
    const response = await sdk.deleteCredentialSecret({secretName: 'some name'})
    expect(response).toBe('The credentials secret has been successfully deleted')
  })

  it('throws an error if delete fails', async () => {
    mockedGqlClient.request.mockResolvedValueOnce({errors: [{message: 'some api error'}]})
    const sdk = zero({apiToken: 'token'})

    await expect(sdk.deleteCredentialSecret({secretName: 'name'})).rejects.toThrow({
      name: 'error name',
      message: 'Error delete secret name',
    })
  })
})
