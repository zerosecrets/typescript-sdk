# Zero TypeScript SDK

## Short intro.
Typescript SDK for [Zero](https://tryzero.com). Provides a clear and simple interface for the secrets manager GraphQL API.

## Installation
`npm i @zerosecrets/zero`

## Usage
Fetch secrets for AWS by passing your `zero` token

- create your own `awesome token`
![Screenshot 2022-06-30 at 12 51 32 p m](https://user-images.githubusercontent.com/79540316/176648187-a7592c84-9a5b-4a6a-914b-7c487db5ddea.png)

- create a secret
![Screenshot 2022-06-30 at 12 53 08 p m](https://user-images.githubusercontent.com/79540316/176648634-130d0e0e-3117-423c-909e-39ca9b3d57a4.png)

- use secret token and name to request your tokens
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
