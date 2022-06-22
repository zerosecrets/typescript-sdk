# Zero TypeScript SDK

## Short intro.
Typescript SDK for [Zero](https://tryzero.com). Provides a clear and simple interface for the secrets manager GraphQL API.

## Installation
npm i @zero/zero

## Usage
Fetch secrets for AWS by passing your `zero` token

```typescript
import {zero} from '@zero/zero'

let result

try {
  result = zero({
    token: process.env.ZERO_TOKEN,
    apis: ["aws"],
  })
} catch(error) {
  console.error(error)
}

console.log(result) // {aws: {secret: "value", secret2: "value2"}}
```
