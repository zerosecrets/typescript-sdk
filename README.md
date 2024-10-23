# Zero TypeScript SDK

Typescript SDK for [Zero](https://tryzero.com). Provides a clear and simple interface for the secrets manager GraphQL API.

## Installation

```sh
npm i @zerosecrets/zero
```

## Usage

Fetch secrets for AWS by passing your `zero` token

```typescript
import {zero} from '@zerosecrets/zero'

export async function main() {
  if (!process.env.ZERO_TOKEN) {
    throw new Error('Did you forget to set the ZERO_TOKEN environment variable?')
  }

  let result

  try {
    result = await zero({
      token: process.env.ZERO_TOKEN,
      pick: ['aws'],
      callerName: 'staging',
    }).fetch()
  } catch (error) {
    console.error(error)
  }

  console.log(result?.aws) // {secret: "value", secret2: "value2"}
}

main().catch(console.error)
```
