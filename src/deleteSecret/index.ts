import {gqlClient} from 'sdk/graphql/client'
import {DeleteCredentialSecret} from 'sdk/graphql/delete-credential-secret'
import {ResponseSuccess} from 'sdk/types'

export const deleteSecret = async (params: {apiToken: string; secretName: string}): Promise<ResponseSuccess> => {
  try {
    const id = (
      await gqlClient.request<{deleteCredentialSecret: {id: string}}>(DeleteCredentialSecret, {
        apiToken: params.apiToken,
        secretName: params.secretName,
      })
    ).deleteCredentialSecret.id

    if (!id) {
      throw new Error()
    }

    return {success: true}
  } catch (error) {
    console.log(error)
    throw new Error(`Error delete secret ${params.secretName}`)
  }
}
