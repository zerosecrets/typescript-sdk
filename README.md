# Zero TypeScript SDK

Typescript SDK for [Zero](https://tryzero.com). Provides a clear and simple interface for the secrets manager GraphQL API.

## Installation

```sh
npm i @zerosecrets/zero
```

## Usage

Fetch secrets for AWS by passing your `zero` token

```ts
import {zero} from '@zerosecrets/zero'

export async function main() {
  if (!process.env.ZERO_TOKEN) {
    throw new Error('Did you forget to set the ZERO_TOKEN environment variable?')
  }

  const [result, error] = await zero({
    token: process.env.ZERO_TOKEN,
    pick: ['aws'],
  })

  result ? console.log(result?.aws) : // {secret: "value", secret2: "value2"}
  throw new Error(error)
}

main()
```
