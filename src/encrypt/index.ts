import {createCipheriv, randomBytes} from 'crypto'
import {ALGORITHM} from 'sdk/const'
const IV_LENGTH = 12

export function encrypt(text: string, key: string): string {
  const keyBuffer = Buffer.from(key, 'hex')
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, keyBuffer, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`
}
