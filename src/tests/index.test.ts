import {zero} from 'sdk/index'
import {secretsResponse} from 'sdk/tests/data/mock'

jest.mock('graphql-request', () => {
  const originalModule = jest.requireActual('graphql-request')

  return {
    __esModule: true,
    ...originalModule,

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

describe('Zero TypeScript SDK', () => {
  it('requires token to be non-empty string', () => {
    expect(() => {
      zero({
        token: '',
        pick: ['aws'],
      }).fetch()
    }).toThrowError('Zero token should be non-empty string')
  })

  it('does a GraphQL request which queries the requested APIs', async () => {
    await expect(
      zero({
        token: 'token',
        pick: ['aws'],
      }).fetch(),
    ).resolves.toEqual({aws: {name: 'value', name2: 'value2'}})
  })

  it('does a GraphQL request with wrong vars (expect empty body)', async () => {
    await expect(
      zero({
        token: 'invalid token',
        pick: ['aws'],
      }).fetch(),
    ).resolves.toEqual({})
  })

  it('raises an exception if GraphQL API responds with error', async () => {
    await expect(
      zero({
        token: 'token',
        pick: [],
      }).fetch(),
    ).rejects.toThrowError('Could not establish connection with database')
  })
})
