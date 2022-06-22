# Zero TypeScript SDK

## Short intro.
Typescript SDK for [Zero](https://tryzero.com). Provides a clear and simple interface for the secrets manager GraphQL API.

## Installation
`npm i @zerosecrets/zero`

## Usage
Fetch secrets for AWS by passing your `zero` token

```typescript
import {zero} from '@zerosecrets/zero'

export async function main() {
  let result

  try {
    result = await zero({
      token: process.env.ZERO_TOKEN,
      apis: ["aws"],
    }).fetch()
  } catch(error) {
    console.error(error)
  }

  console.log(result?.aws) // {secret: "value", secret2: "value2"}
}
```
