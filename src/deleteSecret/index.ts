import {gqlClient} from 'sdk/graphql/client'
import {DeleteCredentialSecret} from 'sdk/graphql/delete-credential-secret'
import {ResponseSuccess} from 'sdk/types'

export const deleteSecret = async (params: {apiToken: string; secretName: string}): Promise<ResponseSuccess> => {
  try {
    await gqlClient.request(DeleteCredentialSecret, {
      apiToken: params.apiToken,
      secretName: params.secretName,
    })

      //  fetchResponse = (
      //         await gqlClient.request<{fetchCredentialSecret: FetchCredentialSecretOutput}>(FetchCredentialSecret, {
      //           apiToken: config.apiToken,
      //           secretName: params.secretName,
      //         })
      //       ).fetchCredentialSecret

    return {success: true}
  } catch (error) {
    console.log(error)
    throw new Error(`Error delete secret ${params.secretName}`)
  }
}
