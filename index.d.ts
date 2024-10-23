declare module "graphql/secrets" {
    export const Secrets: string;
}
declare module "types/response-body" {
    export type ResponseBody = {
        secrets: Array<{
            name: string;
            fields: Array<{
                name: string;
                value: string;
            }>;
        }>;
        errors?: [
            {
                message: string;
            }
        ];
    };
}
declare module "types/index" {
    export * from "types/response-body";
}
declare module "index" {
    export const zero: (params: {
        pick: Array<string>;
        token: string;
        callerName?: string;
    }) => {
        fetch(): Promise<{
            [key: string]: {
                [key: string]: string;
            } | undefined;
        }>;
    };
}
declare module "tests/data/mock" {
    import { ResponseBody } from "types/index";
    export const secretsResponse: ResponseBody;
}
declare module "tests/index.test" { }
