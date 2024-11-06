import {encrypt, zero} from 'sdk/index'
import {secretsResponse} from 'sdk/tests/data/mock'

global.fetch = jest.fn()

jest.mock('graphql-request', () => {
  return {
    __esModule: true,
    ...jest.requireActual('graphql-request'),

    GraphQLClient: jest.fn().mockImplementation(() => ({
      request: jest.fn().mockImplementation((_, variables) => {
        if (variables.pick.length === 0) {
          return Promise.resolve({
            data: null,

            errors: [
              {
                message: 'Could not establish connection with database',
                locations: [{line: 2, column: 2}],
                path: ['secrets'],
                extensions: {
                  internal_error:
                    'Error occurred while creating a new object: error connecting to server: Connection refused (os error 61)',
                },
              },
            ],
          })
        }

        if (variables.token !== 'token') {
          return {secrets: []}
        }

        return Promise.resolve(secretsResponse)
      }),
    })),
  }
})

describe('Zero TypeScript SDK - fetch', () => {
  beforeEach(() => {
    ;(fetch as jest.Mock).mockReset()
  })

  it('requires token to be non-empty string', () => {
    expect(() => {
      zero({apiToken: ''}).fetch({
        pick: ['aws'],
      })
    }).toThrow('Zero token should be non-empty string')
  })

  it('does a GraphQL request which queries the requested APIs', async () => {
    await expect(
      zero({apiToken: 'token'}).fetch({
        pick: ['aws'],
      }),
    ).resolves.toEqual({aws: {name: 'value', name2: 'value2'}})
  })

  it('does a GraphQL request with wrong vars (expect empty body)', async () => {
    await expect(
      zero({apiToken: 'invalid token'}).fetch({
        pick: ['aws'],
      }),
    ).resolves.toEqual({})
  })

  it('raises an exception if GraphQL API responds with error', async () => {
    await expect(
      zero({apiToken: 'token'}).fetch({
        pick: [],
      }),
    ).rejects.toThrow('Could not establish connection with database')
  })
})

describe('Zero TypeScript SDK - createCredentialSecret', () => {
  beforeEach(() => {
    ;(fetch as jest.Mock).mockReset()
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
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve('The credentials secret has been successfully created'),
    })

    const sdk = zero({apiToken: 'token'})

    const response = await sdk.createCredentialSecret({
      accessToken: 'access',
      expiresIn: '3600',
      refreshToken: 'refresh',
      secretKey: 'a'.repeat(64),
      secretName: 'name',
      vendor: 'google',
    })

    expect(response).toEqual('The credentials secret has been successfully created')

    expect(fetch).toHaveBeenCalledWith('https://http.tryzero.com/cm/create', expect.objectContaining({method: 'POST'}))
  })
})

describe('Zero TypeScript SDK - fetchCredentialSecret', () => {
  beforeEach(() => {
    ;(fetch as jest.Mock).mockReset()
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
    const secretKey = 'a'.repeat(64)
    const encryptedAccessToken = encrypt('accessToken', secretKey)
    const encryptedRefreshToken = encrypt('refreshToken', secretKey)

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
            expiresAt: '2024-11-10T10:00:00Z',
            meta: JSON.stringify({metaKey: 'metaValue'}),
            vendor: 'google',
          }),
      })
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({access_token: 'newAccessToken', refresh_token: 'newRefreshToken', expires_in: 3600}),
      })

    const sdk = zero({apiToken: 'token'})

    const response = await sdk.fetchCredentialSecret({
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      secretName: 'name',
      secretKey: secretKey,
    })

    expect(response).toHaveProperty('accessToken', 'accessToken')
    expect(response).toHaveProperty('refreshToken', 'refreshToken')
    expect(response.meta).toEqual({metaKey: 'metaValue'})
  })

  it('throws an error if token refresh fails', async () => {
    const secretKey = 'a'.repeat(64)
    const encryptedAccessToken = encrypt('accessToken', secretKey)
    const encryptedRefreshToken = encrypt('refreshToken', secretKey)

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
            expiresAt: '2023-11-01T10:00:00Z', // Истекшая дата
            meta: JSON.stringify({metaKey: 'metaValue'}),
            vendor: 'google',
          }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({error_description: 'Invalid refresh token'}),
      })

    const sdk = zero({apiToken: 'token'})

    await expect(
      sdk.fetchCredentialSecret({
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        secretName: 'name',
        secretKey: secretKey,
      }),
    ).rejects.toThrow('Error refreshing token: Invalid refresh token')
  })
})
