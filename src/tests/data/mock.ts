import {ResponseBody} from 'sdk/types'

export const secretsResponse: ResponseBody = {
  secrets: [
    {
      name: 'aws',

      fields: [
        {
          name: 'name',
          value: 'value',
        },

        {
          name: 'name2',
          value: 'value2',
        },
      ],
    },
  ],
}
