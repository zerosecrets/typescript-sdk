import {createDecipheriv} from 'crypto'
import {ALGORITHM} from 'sdk/const'

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
